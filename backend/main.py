from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any
from cosinorage.bioages.cosinorage import CosinorAge
from cosinorage.datahandlers.galaxydatahandler import GalaxyDataHandler
from cosinorage.datahandlers.galaxycsvdatahandler import GalaxyCSVDataHandler
import os
import shutil
import tempfile
import logging
import zipfile
from datetime import datetime
from cosinorage.features.features import WearableFeatures
from pydantic import BaseModel


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create a permanent directory for extracted files
EXTRACTED_FILES_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "extracted_files")
os.makedirs(EXTRACTED_FILES_DIR, exist_ok=True)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    
    # Clean up extracted files directory
    if os.path.exists(EXTRACTED_FILES_DIR):
        shutil.rmtree(EXTRACTED_FILES_DIR)
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

@app.post("/upload")
async def upload_file(file: UploadFile = File(...), data_source: str = Form(...)) -> Dict[str, Any]:
    """
    Handle file upload and extraction
    """
    try:
        logger.info(f"Received file upload request for file: {file.filename} with data source: {data_source}")
        
        # Create a temporary directory to store the uploaded files
        temp_dir = tempfile.mkdtemp()  # Create a temporary directory that won't be automatically deleted
        temp_dirs[str(len(uploaded_data))] = temp_dir  # Store the temp directory path
        
        # Save the uploaded file
        file_path = os.path.join(temp_dir, file.filename)
        logger.info(f"Saving file to temporary directory: {file_path}")
        
        with open(file_path, "wb") as buffer:
            contents = await file.read()
            buffer.write(contents)
        
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
            uploaded_data[file_id] = {
                "filename": file.filename,
                "file_path": file_path,
                "temp_dir": temp_dir,
                "data_source": "samsung_galaxy_csv"
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
        
        # Skip extraction for CSV files
        if file_data.get("data_source") == "samsung_galaxy_csv":
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
        if file_id not in uploaded_data:
            raise HTTPException(status_code=404, detail="File not found")
        
        file_data = uploaded_data[file_id]
        
        # Choose the appropriate data handler based on data source
        if file_data.get("data_source") == "samsung_galaxy_csv":
            logger.info(f"Using GalaxyCSVDataHandler for CSV file: {file_data['file_path']}")
            handler = GalaxyCSVDataHandler(file_data["file_path"], preprocess_args=request.preprocess_args)
        else:
            if "child_dir" not in file_data:
                raise HTTPException(status_code=400, detail="No child directory found")
            
            # Ensure the path ends with a forward slash
            child_dir = file_data["child_dir"]
            if not child_dir.endswith('/'):
                child_dir = child_dir + '/'
            
            logger.info(f"Using GalaxyDataHandler with directory: {child_dir}")
            handler = GalaxyDataHandler(galaxy_file_dir=child_dir, preprocess_args=request.preprocess_args)
        
        logger.info(f"Using preprocessing args: {request.preprocess_args}")
        logger.info(f"Using features args: {request.features_args}")
        
        # Get metadata
        metadata = handler.get_meta_data()
        
        # Extract features using WearableFeatures with provided parameters
        wf = WearableFeatures(handler, features_args=request.features_args)
        features = wf.get_features()
        df = wf.get_ml_data()
        df = df.reset_index()
        
        # Keep all columns as they are, just ensure TIMESTAMP is the index name
        df = df.rename(columns={'index': 'TIMESTAMP'})
        
        df_json = df.to_dict(orient='records')

        cosinor_features = features['cosinor']
        non_parametric_features = features['nonparam']
        physical_activity_features = features['physical_activity']
        sleep_features = features['sleep']

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

class AgePredictionRequest(BaseModel):
    chronological_age: float
    gender: str

@app.post("/predict_age/{file_id}")
async def predict_age(file_id: str, request: AgePredictionRequest):
    """
    Predict biological age based on cosinor features and demographic information.
    """
    try:
        # Get the processed data
        if file_id not in uploaded_data:
            raise HTTPException(status_code=404, detail="File not found or not processed")
        
        data = uploaded_data[file_id]
        if 'handler' not in data:
            raise HTTPException(status_code=400, detail="Data handler not available")
        
        # Log the data we're working with
        logging.info(f"Handler type: {type(data['handler'])}")
        logging.info(f"Age: {request.chronological_age}")
        logging.info(f"Gender: {request.gender}")
        
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
    Clear state for a specific file_id or all files if file_id is 'all'
    """
    try:
        if file_id == "all":
            # Clean up all temporary directories
            for temp_dir in temp_dirs.values():
                if os.path.exists(temp_dir):
                    shutil.rmtree(temp_dir)
            temp_dirs.clear()
            
            # Clean up all permanent directories
            for file_data in uploaded_data.values():
                if "permanent_dir" in file_data and os.path.exists(file_data["permanent_dir"]):
                    shutil.rmtree(file_data["permanent_dir"])
            
            # Clear all uploaded data
            uploaded_data.clear()
            
            logger.info("Cleared all state")
            return {"message": "All state cleared successfully"}
        elif file_id in uploaded_data:
            # Clean up any temporary directories
            if file_id in temp_dirs and os.path.exists(temp_dirs[file_id]):
                shutil.rmtree(temp_dirs[file_id])
                del temp_dirs[file_id]
            
            # Clean up any permanent directories
            file_data = uploaded_data[file_id]
            if "permanent_dir" in file_data and os.path.exists(file_data["permanent_dir"]):
                shutil.rmtree(file_data["permanent_dir"])
            
            # Remove from uploaded_data
            del uploaded_data[file_id]
            
            logger.info(f"Cleared state for file_id: {file_id}")
            return {"message": "State cleared successfully"}
        else:
            # Instead of raising an error, just return success if the file doesn't exist
            logger.info(f"File {file_id} not found, but clearing state anyway")
            return {"message": "State cleared successfully"}
    except Exception as e:
        logger.error(f"Error clearing state: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e)) 