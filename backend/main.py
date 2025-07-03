from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from typing import Dict, Any
from cosinorage.bioages.cosinorage import CosinorAge
from cosinorage.datahandlers import GalaxyDataHandler
from cosinorage.datahandlers.genericdatahandler import GenericDataHandler
import os
import shutil
import tempfile
import logging
import zipfile
from datetime import datetime
from cosinorage.features.features import WearableFeatures
from pydantic import BaseModel
import pandas as pd
try:
    from docs_service import setup_docs_routes
except ImportError:
    from backend.docs_service import setup_docs_routes
import uvicorn


# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Create a permanent directory for extracted files
EXTRACTED_FILES_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "extracted_files")
os.makedirs(EXTRACTED_FILES_DIR, exist_ok=True)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost", "http://localhost:80"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup documentation routes
setup_docs_routes(app)

# Store uploaded data in memory (in a real app, you'd want to use a proper database)
uploaded_data = {}
temp_dirs = {}  # Store temporary directories

@app.on_event("startup")
async def startup_event():
    """
    Clear all state when the server starts
    """
    # Clear in-memory state
    uploaded_data.clear()
    temp_dirs.clear()
    
    # Clean up extracted files directory (handle volume mount)
    if os.path.exists(EXTRACTED_FILES_DIR):
        try:
            # Instead of removing the directory, clear its contents
            for item in os.listdir(EXTRACTED_FILES_DIR):
                item_path = os.path.join(EXTRACTED_FILES_DIR, item)
                if os.path.isdir(item_path):
                    shutil.rmtree(item_path)
                else:
                    os.remove(item_path)
        except Exception as e:
            logger.warning(f"Could not clear extracted_files directory: {str(e)}")
            # Ensure the directory exists
            os.makedirs(EXTRACTED_FILES_DIR, exist_ok=True)
    else:
        os.makedirs(EXTRACTED_FILES_DIR, exist_ok=True)
    
    logger.info("Server started - all state cleared")

def create_directory_tree(path: str) -> Dict[str, Any]:
    """Create a tree structure of the directory contents."""
    result = {
        'name': os.path.basename(path),
        'type': 'directory',
        'children': []
    }
    
    try:
        for item in os.listdir(path):
            item_path = os.path.join(path, item)
            if os.path.isdir(item_path):
                result['children'].append(create_directory_tree(item_path))
            else:
                result['children'].append({
                    'name': item,
                    'type': 'file'
                })
    except Exception as e:
        logger.error(f"Error creating directory tree: {str(e)}")
    
    return result

@app.get("/columns/{file_id}")
async def get_csv_columns(file_id: str) -> Dict[str, Any]:
    """
    Get column names from the uploaded CSV file
    """
    try:
        if file_id not in uploaded_data:
            raise HTTPException(status_code=404, detail="File not found")
        
        file_info = uploaded_data[file_id]
        file_path = file_info.get("file_path")
        
        if not file_path or not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found on disk")
        
        # Read the CSV file to get column names
        try:
            df = pd.read_csv(file_path, nrows=1)  # Only read first row to get headers
            columns = df.columns.tolist()
            return {
                "columns": columns,
                "data_type": file_info.get("data_type"),
                "data_source": file_info.get("data_source")
            }
        except Exception as e:
            logger.error(f"Error reading CSV file: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Error reading CSV file: {str(e)}")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting columns: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    data_source: str = Form(...),
    data_type: str = Form(None),
    time_format: str = Form(None),
    time_column: str = Form(None),
    data_columns: str = Form(None)
) -> Dict[str, Any]:
    """
    Handle file upload and extraction
    """
    try:
        logger.info(f"=== FILE UPLOAD REQUEST ===")
        logger.info(f"File name: {file.filename}")
        logger.info(f"File content type: {file.content_type}")
        logger.info(f"Data source: {data_source}")
        logger.info(f"File size: {file.size if hasattr(file, 'size') else 'Unknown'}")
        
        # Create a temporary directory to store the uploaded files
        temp_dir = tempfile.mkdtemp()  # Create a temporary directory that won't be automatically deleted
        temp_dirs[str(len(uploaded_data))] = temp_dir  # Store the temp directory path
        
        # Save the uploaded file
        file_path = os.path.join(temp_dir, file.filename)
        logger.info(f"Saving file to temporary directory: {file_path}")
        
        with open(file_path, "wb") as buffer:
            contents = await file.read()
            buffer.write(contents)
            logger.info(f"File saved successfully. File size on disk: {len(contents)} bytes")
        
        file_id = str(len(uploaded_data))
        
        # Handle based on data source
        if data_source == "samsung_galaxy_binary":
            if not file.filename.endswith('.zip'):
                raise HTTPException(status_code=400, detail="Only ZIP files are supported for binary data")
                
            logger.info("File is a ZIP file, extracting...")
            extract_dir = os.path.join(temp_dir, "extracted")
            os.makedirs(extract_dir, exist_ok=True)
            with zipfile.ZipFile(file_path, 'r') as zip_ref:
                zip_ref.extractall(extract_dir)
            logger.info(f"Extracted ZIP file to: {extract_dir}")
            
            # Create directory tree
            directory_tree = create_directory_tree(extract_dir)
            
            # Store the extracted directory path
            uploaded_data[file_id] = {
                "filename": file.filename,
                "extracted_dir": extract_dir,
                "temp_dir": temp_dir,
                "data_source": "samsung_galaxy_binary"
            }
            
            return {
                "file_id": file_id,
                "filename": file.filename,
                "directory_tree": directory_tree
            }
        elif data_source == "samsung_galaxy_csv":
            if not file.filename.endswith('.csv'):
                raise HTTPException(status_code=400, detail="Only CSV files are supported for CSV data")
                
            logger.info("File is a CSV file, storing path...")
            file_info = {
                "filename": file.filename,
                "file_path": file_path,
                "temp_dir": temp_dir,
                "data_source": "samsung_galaxy_csv"
            }
            
            # Store data_type if provided (for alternative_counts)
            if data_type:
                file_info["data_type"] = data_type
                logger.info(f"Storing data_type: {data_type}")
            
            uploaded_data[file_id] = file_info
            
            return {
                "file_id": file_id,
                "filename": file.filename
            }
        elif data_source == "other":
            uploaded_data[file_id] = {
                "filename": file.filename,
                "file_path": file_path,
                "temp_dir": temp_dir,
                "data_source": "other",
                "data_type": data_type,
                "time_format": time_format,
                "time_column": time_column,
                "data_columns": data_columns.split(",") if data_columns else None
            }
            return {
                "file_id": file_id,
                "filename": file.filename
            }
        else:
            raise HTTPException(status_code=400, detail="Invalid data source")
                
    except Exception as e:
        logger.error(f"Error processing file: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/extract/{file_id}")
async def extract_files(file_id: str) -> Dict[str, Any]:
    """
    Extract files from the uploaded ZIP file
    """
    try:
        if file_id not in uploaded_data:
            raise HTTPException(status_code=404, detail="File not found")

        file_data = uploaded_data[file_id]
        
        # Skip extraction for CSV files and other data sources
        if file_data.get("data_source") in ["samsung_galaxy_csv", "other"]:
            return {"message": "No extraction needed for CSV files"}

        temp_dir = file_data["temp_dir"]
        zip_path = os.path.join(temp_dir, file_data["filename"])

        # Create a permanent directory for extracted files
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        extracted_dir = os.path.join("extracted_files", f"extracted_{timestamp}")
        os.makedirs(extracted_dir, exist_ok=True)

        # Extract the ZIP file
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extracted_dir)

        # Find the actual data directory (skip __MACOSX)
        child_dirs = [d for d in os.listdir(extracted_dir) 
                     if os.path.isdir(os.path.join(extracted_dir, d)) 
                     and not d.startswith('__MACOSX')]
        
        if not child_dirs:
            raise HTTPException(status_code=400, detail="No valid data directory found in ZIP file")
        
        child_dir = os.path.join(extracted_dir, child_dirs[0])
        
        # Update the uploaded_data with the permanent directory
        uploaded_data[file_id]["permanent_dir"] = extracted_dir
        uploaded_data[file_id]["child_dir"] = child_dir

        logger.info(f"Files extracted successfully. Child directory for processing: {child_dir}")
        return {"message": "Files extracted successfully", "child_dir": child_dir}

    except Exception as e:
        logger.error(f"Error extracting files: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

class ProcessRequest(BaseModel):
    preprocess_args: dict = {
        'required_daily_coverage': 0.5,
        'autocalib_sd_criter': 0.00013,
        'autocalib_sphere_crit': 0.02,
        'filter_type': 'lowpass',
        'filter_cutoff': 2,
        'wear_sd_crit': 0.00013,
        'wear_range_crit': 0.00067,
        'wear_window_length': 45,
        'wear_window_skip': 7,
    }
    features_args: dict = {
        'sleep_ck_sf': 0.0025,
        'sleep_rescore': True,
        'pa_cutpoint_sl': 15,
        'pa_cutpoint_lm': 35,
        'pa_cutpoint_mv': 70,
    }

@app.post("/process/{file_id}")
async def process_data(file_id: str, request: ProcessRequest) -> Dict[str, Any]:
    """
    Process the data using appropriate data handler
    """
    try:
        logger.info(f"=== DATA PROCESSING REQUEST ===")
        logger.info(f"File ID: {file_id}")
        logger.info(f"Preprocessing arguments: {request.preprocess_args}")
        logger.info(f"Features arguments: {request.features_args}")
        
        if file_id not in uploaded_data:
            logger.error(f"File ID {file_id} not found in uploaded_data")
            raise HTTPException(status_code=404, detail="File not found")
        
        file_data = uploaded_data[file_id]
        logger.info(f"File data found: {file_data}")
        
        # Choose the appropriate data handler based on data source
        if file_data.get("data_source") == "samsung_galaxy_csv":
            # Check if column selections are available (for alternative_counts)
            if "time_column" in file_data and "data_columns" in file_data:
                # Use selected columns for alternative_counts
                time_column = file_data["time_column"]
                data_columns = file_data["data_columns"]
                logger.info(f"Using GalaxyCSVDataHandler for CSV file: {file_data['file_path']} with selected columns: time_column={time_column}, data_columns={data_columns}")
                handler = GalaxyDataHandler(
                    galaxy_file_path=file_data["file_path"], 
                    preprocess_args=request.preprocess_args,
                    verbose=False,
                    data_format='csv',
                    data_type='alternative_count',
                    time_column=time_column,
                    data_columns=data_columns
                )
            else:
                # Use hardcoded parameters for default ENMO
                logger.info(f"Using GalaxyCSVDataHandler for CSV file: {file_data['file_path']} with hardcoded parameters for Samsung Galaxy CSV")
                handler = GalaxyDataHandler(
                    galaxy_file_path=file_data["file_path"], 
                    preprocess_args=request.preprocess_args,
                    verbose=False,
                    data_format='csv',
                    data_type='enmo',
                    time_column='time',
                    data_columns=['enmo_mg']
                )
        elif file_data.get("data_source") == "other":
            # Set parameters based on data type and selected columns
            data_type = file_data["data_type"]
            time_column = file_data["time_column"]
            data_columns = file_data["data_columns"]
            time_format = file_data["time_format"]
            
            # Log the parameters being used
            logger.info(f"Using GenericDataHandler for CSV file: {file_data['file_path']}")
            logger.info(f"Data type: {data_type}")
            logger.info(f"Time format: {time_format}")
            logger.info(f"Time column: {time_column}")
            logger.info(f"Data columns: {data_columns}")
            
            # Validate column selections based on data type
            if data_type.startswith("accelerometer-"):
                if len(data_columns) != 3:
                    raise HTTPException(status_code=400, detail=f"Accelerometer data requires exactly 3 columns (X, Y, Z), but {len(data_columns)} were selected")
                logger.info(f"Processing accelerometer data with columns: {data_columns}")
            elif data_type == "enmo":
                if len(data_columns) != 1:
                    raise HTTPException(status_code=400, detail=f"ENMO data requires exactly 1 column, but {len(data_columns)} were selected")
                logger.info(f"Processing ENMO data with column: {data_columns[0]}")
            elif data_type == "alternative_counts":
                if len(data_columns) != 1:
                    raise HTTPException(status_code=400, detail=f"Alternative counts data requires exactly 1 column, but {len(data_columns)} were selected")
                logger.info(f"Processing alternative counts data with column: {data_columns[0]}")
            
            handler = GenericDataHandler(
                file_path=file_data["file_path"],
                data_format="csv",
                data_type=data_type,
                time_format=time_format,
                time_column=time_column,
                data_columns=data_columns,
                preprocess_args=request.preprocess_args,
                verbose=True
            )
        else:
            if "child_dir" not in file_data:
                raise HTTPException(status_code=400, detail="No child directory found")
            
            # Ensure the path ends with a forward slash
            child_dir = file_data["child_dir"]
            if not child_dir.endswith('/'):
                child_dir = child_dir + '/'
            
            logger.info(f"Using GalaxyDataHandler with directory: {child_dir}")
            handler = GalaxyDataHandler(
                galaxy_file_path=child_dir, 
                preprocess_args=request.preprocess_args,
                verbose=False,
                data_format='binary',
                data_type='accelerometer',
                time_column='unix_timestamp_in_ms',
                data_columns=['acceleration_x', 'acceleration_y', 'acceleration_z']
            )
        
        logger.info(f"Using preprocessing args: {request.preprocess_args}")
        logger.info(f"Using features args: {request.features_args}")
        
        # Get metadata
        metadata = handler.get_meta_data()
        
        # Extract features using WearableFeatures with provided parameters
        wf = WearableFeatures(handler, features_args=request.features_args)
        features = wf.get_features()
        df = wf.get_ml_data()
        df = df.reset_index()
        df = df.rename(columns={'timestamp': 'TIMESTAMP', 'enmo': 'ENMO'})
        logger.info(f"ML data: {df.head()}")
        
        # Keep all columns as they are, just ensure TIMESTAMP is the index name
        df = df.rename(columns={'index': 'TIMESTAMP'})
        
        df_json = df.to_dict(orient='records')

        cosinor_features = features['cosinor']
        non_parametric_features = features['nonparam']
        physical_activity_features = features['physical_activity']
        sleep_features = features['sleep']

        # Log the processed data summary
        logger.info(f"=== PROCESSING RESULTS ===")
        logger.info(f"Data points processed: {len(df_json)}")
        logger.info(f"Metadata: {metadata}")
        logger.info(f"Cosinor features keys: {list(cosinor_features.keys()) if cosinor_features else 'None'}")
        logger.info(f"Non-parametric features keys: {list(non_parametric_features.keys()) if non_parametric_features else 'None'}")
        logger.info(f"Physical activity features keys: {list(physical_activity_features.keys()) if physical_activity_features else 'None'}")
        logger.info(f"Sleep features keys: {list(sleep_features.keys()) if sleep_features else 'None'}")
        
        # Store all the processed data in uploaded_data
        uploaded_data[file_id].update({
            'handler': handler,
            'data': df_json,
            'features': {
                'cosinor': cosinor_features,
                'nonparam': non_parametric_features,
                'physical_activity': physical_activity_features,
                'sleep': sleep_features
            },
            'metadata': {
                'raw_data_frequency': metadata.get('raw_data_frequency'),
                'raw_start_datetime': metadata.get('raw_start_datetime'),
                'raw_end_datetime': metadata.get('raw_end_datetime'),
                'raw_data_type': metadata.get('raw_data_type'),
                'raw_data_unit': metadata.get('raw_data_unit'),
                'raw_n_datapoints': metadata.get('raw_n_datapoints')
            }
        })
        
        return {
            "message": "Data processed successfully",
            "data": df_json,
            "features": {
                "cosinor": cosinor_features,
                "nonparam": non_parametric_features,
                "physical_activity": physical_activity_features,
                "sleep": sleep_features
            },
            "metadata": {
                "raw_data_frequency": metadata.get('raw_data_frequency'),
                "raw_start_datetime": metadata.get('raw_start_datetime'),
                "raw_end_datetime": metadata.get('raw_end_datetime'),
                "raw_data_type": metadata.get('raw_data_type'),
                "raw_data_unit": metadata.get('raw_data_unit'),
                "raw_n_datapoints": metadata.get('raw_n_datapoints')
            }
        }

    except Exception as e:
        logger.error(f"Error processing data: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    return {"status": "healthy"}

@app.on_event("shutdown")
async def cleanup():
    """
    Clean up all temporary and extracted files, and clear in-memory state when the application shuts down
    """
    # Clean up temporary directories
    for temp_dir in temp_dirs.values():
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)
    
    # Clean up extracted files directory
    if os.path.exists(EXTRACTED_FILES_DIR):
        shutil.rmtree(EXTRACTED_FILES_DIR)
        os.makedirs(EXTRACTED_FILES_DIR, exist_ok=True)
    
    # Clear in-memory state
    uploaded_data.clear()
    temp_dirs.clear()
    
    logger.info("Application state cleaned up successfully")

class ColumnSelectionRequest(BaseModel):
    time_column: str
    data_columns: list[str]

class AgePredictionRequest(BaseModel):
    chronological_age: float
    gender: str

@app.post("/update_columns/{file_id}")
async def update_column_selections(file_id: str, request: ColumnSelectionRequest):
    """
    Update column selections for the uploaded file
    """
    try:
        if file_id not in uploaded_data:
            raise HTTPException(status_code=404, detail="File not found")
        
        file_info = uploaded_data[file_id]
        
        # Update the column selections
        file_info["time_column"] = request.time_column
        file_info["data_columns"] = request.data_columns
        
        logger.info(f"Updated column selections for file {file_id}: time_column={request.time_column}, data_columns={request.data_columns}")
        
        return {
            "message": "Column selections updated successfully",
            "time_column": request.time_column,
            "data_columns": request.data_columns
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating column selections: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict_age/{file_id}")
async def predict_age(file_id: str, request: AgePredictionRequest):
    """
    Predict biological age based on cosinor features and demographic information.
    """
    try:
        logger.info(f"=== AGE PREDICTION REQUEST ===")
        logger.info(f"File ID: {file_id}")
        logger.info(f"Chronological age: {request.chronological_age}")
        logger.info(f"Gender: {request.gender}")
        
        # Get the processed data
        if file_id not in uploaded_data:
            logger.error(f"File ID {file_id} not found in uploaded_data")
            raise HTTPException(status_code=404, detail="File not found or not processed")
        
        data = uploaded_data[file_id]
        if 'handler' not in data:
            logger.error(f"Data handler not available for file ID {file_id}")
            raise HTTPException(status_code=400, detail="Data handler not available")
        
        # Log the data we're working with
        logger.info(f"Handler type: {type(data['handler'])}")
        logger.info(f"Available data keys: {list(data.keys())}")
        if 'features' in data:
            logger.info(f"Available features: {list(data['features'].keys())}")
            if 'cosinor' in data['features']:
                logger.info(f"Cosinor features: {data['features']['cosinor']}")
        
        # Create record in the correct format
        record = [{
            'handler': data['handler'],  # Use the stored GalaxyDataHandler object
            'age': request.chronological_age,
            'gender': request.gender
        }]
        
        logging.info(f"Created record: {record}")
        
        # Create CosinorAge object and predict
        try:
            cosinor_age = CosinorAge(record)
            logging.info("Successfully created CosinorAge object")
        except Exception as e:
            logging.error(f"Error creating CosinorAge object: {str(e)}")
            raise
        
        try:
            predictions = cosinor_age.get_predictions()
            logging.info(f"Got predictions: {predictions}")
        except Exception as e:
            logging.error(f"Error getting predictions: {str(e)}")
            raise
        
        if not predictions or not isinstance(predictions, list) or len(predictions) == 0:
            raise HTTPException(status_code=500, detail="Failed to get prediction from CosinorAge")
        
        # Get the first prediction result
        prediction = predictions[0]
        if 'cosinorage' not in prediction:
            raise HTTPException(status_code=500, detail="Prediction result missing cosinor age")
        
        return {
            "predicted_age": prediction['cosinorage'],
            "chronological_age": request.chronological_age,
            "gender": request.gender,
            "features": {
                "mesor": prediction.get('mesor'),
                "amplitude": prediction.get('amp1'),
                "acrophase": prediction.get('phi1')
            }
        }
        
    except ValueError as e:
        logging.error(f"ValueError in predict_age: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logging.error(f"Error predicting age: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error predicting age: {str(e)}")

@app.post("/clear_state/{file_id}")
async def clear_state(file_id: str):
    """
    Clear the state for a specific file
    """
    try:
        if file_id in uploaded_data:
            file_data = uploaded_data[file_id]
            
            # Clean up temporary directory
            if "temp_dir" in file_data and os.path.exists(file_data["temp_dir"]):
                shutil.rmtree(file_data["temp_dir"])
            
            # Clean up permanent directory
            if "permanent_dir" in file_data and os.path.exists(file_data["permanent_dir"]):
                shutil.rmtree(file_data["permanent_dir"])
            
            # Remove from memory
            del uploaded_data[file_id]
            if file_id in temp_dirs:
                del temp_dirs[file_id]
            
            return {"message": f"State cleared for file {file_id}"}
        else:
            raise HTTPException(status_code=404, detail="File not found")
            
    except Exception as e:
        logger.error(f"Error clearing state: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

# Documentation API endpoints
@app.get("/docs/content/{page_path:path}")
async def get_docs_content(page_path: str = ""):
    """
    Get documentation content for a specific page
    """
    try:
        return docs_service.get_page_content(page_path)
    except Exception as e:
        logger.error(f"Error fetching docs content: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/docs/sitemap")
async def get_docs_sitemap():
    """
    Get the sitemap of all documentation pages
    """
    try:
        return {"pages": docs_service.get_sitemap()}
    except Exception as e:
        logger.error(f"Error fetching docs sitemap: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/docs/search")
async def search_docs(query: str):
    """Search documentation content."""
    return {"results": []}

@app.get("/download/sample")
async def download_sample_data():
    """Download sample data file."""
    sample_file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "sample", "sample_data2.csv")
    if not os.path.exists(sample_file_path):
        raise HTTPException(status_code=404, detail="Sample file not found")
    
    return FileResponse(
        path=sample_file_path,
        filename="sample_data2.csv",
        media_type="text/csv"
    )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 