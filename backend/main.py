from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from typing import Dict, Any, Optional, List
from cosinorage.bioages.cosinorage import CosinorAge
from cosinorage.datahandlers import GalaxyDataHandler
from cosinorage.datahandlers.genericdatahandler import GenericDataHandler
import os
import shutil
import tempfile
import logging
import zipfile
from datetime import datetime, timedelta
import asyncio
from cosinorage.features.features import WearableFeatures
from cosinorage.features.bulk_features import BulkWearableFeatures
from pydantic import BaseModel
import pandas as pd
import numpy as np
import pytz
try:
    from docs_service import setup_docs_routes
except ImportError:
    from backend.docs_service import setup_docs_routes
import uvicorn


# Configure logging
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Create a permanent directory for extracted files
EXTRACTED_FILES_DIR = os.path.join(os.path.dirname(
    os.path.abspath(__file__)), "extracted_files")
os.makedirs(EXTRACTED_FILES_DIR, exist_ok=True)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000",
                   "http://localhost", "http://localhost:80"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup documentation routes
setup_docs_routes(app)

# Store uploaded data in memory (in a real app, you'd want to use a proper database)
uploaded_data = {}
temp_dirs = {}  # Store temporary directories
file_upload_times = {}  # Track when files were uploaded

# Cleanup configuration
CLEANUP_INTERVAL_MINUTES = 10  # Run cleanup every 10 minutes
FILE_AGE_LIMIT_MINUTES = 10    # Delete files older than 30 minutes
CLEANUP_TASK_RUNNING = False


async def scheduled_cleanup():
    """
    Background task that runs every 10 minutes to clean up old files
    """
    global CLEANUP_TASK_RUNNING
    
    while True:
        try:
            if not CLEANUP_TASK_RUNNING:
                CLEANUP_TASK_RUNNING = True
                logger.info("Starting scheduled cleanup task")
                
                # Calculate cutoff time
                cutoff_time = datetime.now() - timedelta(minutes=FILE_AGE_LIMIT_MINUTES)
                
                # Clean up old files from uploaded_data
                files_to_remove = []
                for file_id, upload_time in file_upload_times.items():
                    if upload_time < cutoff_time:
                        files_to_remove.append(file_id)
                
                for file_id in files_to_remove:
                    try:
                        if file_id in uploaded_data:
                            file_data = uploaded_data[file_id]
                            
                            # Clean up temporary directory
                            if "temp_dir" in file_data and os.path.exists(file_data["temp_dir"]):
                                shutil.rmtree(file_data["temp_dir"])
                                logger.info(f"Cleaned up old temp directory: {file_data['temp_dir']}")
                            
                            # Clean up permanent directory
                            if "permanent_dir" in file_data and os.path.exists(file_data["permanent_dir"]):
                                shutil.rmtree(file_data["permanent_dir"])
                                logger.info(f"Cleaned up old permanent directory: {file_data['permanent_dir']}")
                            
                            # Remove from memory
                            del uploaded_data[file_id]
                            if file_id in temp_dirs:
                                del temp_dirs[file_id]
                            del file_upload_times[file_id]
                            
                            logger.info(f"Cleaned up old file: {file_id}")
                    except Exception as e:
                        logger.warning(f"Failed to clean up file {file_id}: {str(e)}")
                
                # Clean up old temporary directories that might not be tracked
                for temp_dir in list(temp_dirs.values()):
                    try:
                        if os.path.exists(temp_dir):
                            # Check if directory is old enough to be cleaned up
                            dir_time = datetime.fromtimestamp(os.path.getctime(temp_dir))
                            if dir_time < cutoff_time:
                                shutil.rmtree(temp_dir)
                                logger.info(f"Cleaned up old untracked temp directory: {temp_dir}")
                    except Exception as e:
                        logger.warning(f"Failed to clean up temp directory {temp_dir}: {str(e)}")
                
                # Clean up old files in extracted_files directory
                if os.path.exists(EXTRACTED_FILES_DIR):
                    try:
                        for item in os.listdir(EXTRACTED_FILES_DIR):
                            item_path = os.path.join(EXTRACTED_FILES_DIR, item)
                            if os.path.exists(item_path):
                                item_time = datetime.fromtimestamp(os.path.getctime(item_path))
                                if item_time < cutoff_time:
                                    if os.path.isdir(item_path):
                                        shutil.rmtree(item_path)
                                    else:
                                        os.remove(item_path)
                                    logger.info(f"Cleaned up old extracted file: {item_path}")
                    except Exception as e:
                        logger.warning(f"Failed to clean up extracted files directory: {str(e)}")
                
                logger.info(f"Scheduled cleanup completed. Removed {len(files_to_remove)} old files.")
                
            else:
                logger.info("Cleanup task already running, skipping this iteration")
                
        except Exception as e:
            logger.error(f"Error in scheduled cleanup: {str(e)}", exc_info=True)
        finally:
            CLEANUP_TASK_RUNNING = False
        
        # Wait for next cleanup cycle (10 minutes)
        await asyncio.sleep(CLEANUP_INTERVAL_MINUTES * 60)


@app.on_event("startup")
async def startup_event():
    """
    Clear all state when the server starts and start the cleanup task
    """
    # Clear in-memory state
    uploaded_data.clear()
    temp_dirs.clear()
    file_upload_times.clear()

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
            logger.warning(
                f"Could not clear extracted_files directory: {str(e)}")
            # Ensure the directory exists
            os.makedirs(EXTRACTED_FILES_DIR, exist_ok=True)
    else:
        os.makedirs(EXTRACTED_FILES_DIR, exist_ok=True)

    # Start the scheduled cleanup task
    asyncio.create_task(scheduled_cleanup())
    
    logger.info("Server started - all state cleared and cleanup task started (runs every 10 minutes)")


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
            raise HTTPException(
                status_code=404, detail="File not found on disk")

        # Read the CSV file to get column names
        try:
            # Only read first row to get headers
            df = pd.read_csv(file_path, nrows=1)
            columns = df.columns.tolist()
            return {
                "columns": columns,
                "data_type": file_info.get("data_type"),
                "data_source": file_info.get("data_source")
            }
        except Exception as e:
            logger.error(f"Error reading CSV file: {str(e)}")
            raise HTTPException(
                status_code=400, detail=f"Error reading CSV file: {str(e)}")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting columns: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/preview/{file_id}")
async def get_csv_preview(file_id: str) -> Dict[str, Any]:
    """
    Get preview data (first 2 rows) from the uploaded CSV file
    """
    try:
        if file_id not in uploaded_data:
            raise HTTPException(status_code=404, detail="File not found")

        file_info = uploaded_data[file_id]
        file_path = file_info.get("file_path")

        if not file_path or not os.path.exists(file_path):
            raise HTTPException(
                status_code=404, detail="File not found on disk")

        # Read the CSV file to get preview data
        try:
            df = pd.read_csv(file_path, nrows=2)  # Read first 2 rows
            preview_data = df.to_dict(orient='records')
            return {
                "preview": preview_data
            }
        except Exception as e:
            logger.error(f"Error reading CSV file for preview: {str(e)}")
            raise HTTPException(
                status_code=400, detail=f"Error reading CSV file for preview: {str(e)}")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting preview: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    data_source: str = Form(...),
    data_type: str = Form(None),
    data_unit: str = Form(None),
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
        logger.info(f"Data type: {data_type}")
        logger.info(f"Data unit: {data_unit}")
        logger.info(
            f"File size: {file.size if hasattr(file, 'size') else 'Unknown'}")

        # Create a temporary directory to store the uploaded files
        # Create a temporary directory that won't be automatically deleted
        temp_dir = tempfile.mkdtemp()
        # Store the temp directory path
        temp_dirs[str(len(uploaded_data))] = temp_dir

        # Save the uploaded file
        file_path = os.path.join(temp_dir, file.filename)
        logger.info(f"Saving file to temporary directory: {file_path}")

        with open(file_path, "wb") as buffer:
            contents = await file.read()
            buffer.write(contents)
            logger.info(
                f"File saved successfully. File size on disk: {len(contents)} bytes")

        file_id = str(len(uploaded_data))
        
        # Track upload time for cleanup
        file_upload_times[file_id] = datetime.now()

        # Handle based on data source
        if data_source == "samsung_galaxy_binary":
            if not file.filename.endswith('.zip'):
                raise HTTPException(
                    status_code=400, detail="Only ZIP files are supported for binary data")

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
                raise HTTPException(
                    status_code=400, detail="Only CSV files are supported for CSV data")

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
                "data_unit": data_unit,
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
        extracted_dir = os.path.join(
            "extracted_files", f"extracted_{timestamp}")
        os.makedirs(extracted_dir, exist_ok=True)

        # Extract the ZIP file
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extracted_dir)

        # Find the actual data directory (skip __MACOSX)
        child_dirs = [d for d in os.listdir(extracted_dir)
                      if os.path.isdir(os.path.join(extracted_dir, d))
                      and not d.startswith('__MACOSX')]

        if not child_dirs:
            raise HTTPException(
                status_code=400, detail="No valid data directory found in ZIP file")

        child_dir = os.path.join(extracted_dir, child_dirs[0])

        # Update the uploaded_data with the permanent directory
        uploaded_data[file_id]["permanent_dir"] = extracted_dir
        uploaded_data[file_id]["child_dir"] = child_dir

        logger.info(
            f"Files extracted successfully. Child directory for processing: {child_dir}")
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
    time_zone: Optional[str] = None


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
                logger.info(
                    f"Using GalaxyCSVDataHandler for CSV file: {file_data['file_path']} with selected columns: time_column={time_column}, data_columns={data_columns}")
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
                logger.info(
                    f"Using GalaxyCSVDataHandler for CSV file: {file_data['file_path']} with hardcoded parameters for Samsung Galaxy CSV")
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
            # Validate that data_type is available for processing
            if not file_data.get("data_type"):
                raise HTTPException(
                    status_code=400, detail="data_type is required for processing 'other' data source. Please complete column selection first.")

            # Set parameters based on data type and selected columns
            # The frontend sends the combined data_type (e.g., "accelerometer-g")
            # If data_type already contains a hyphen, use it as is
            # Otherwise, combine data_type and data_unit
            if file_data["data_type"] and '-' in file_data["data_type"]:
                data_type = file_data["data_type"]
            elif file_data["data_type"] and file_data.get("data_unit"):
                data_type = file_data["data_type"] + \
                    '-' + file_data["data_unit"]
            else:
                data_type = file_data["data_type"] or "unknown"

            time_column = file_data["time_column"]
            data_columns = file_data["data_columns"]
            time_format = file_data["time_format"]

            # Log the parameters being used
            logger.info(
                f"Using GenericDataHandler for CSV file: {file_data['file_path']}")
            logger.info(f"Data type: {data_type}")
            logger.info(f"Time format: {time_format}")
            logger.info(f"Time column: {time_column}")
            logger.info(f"Data columns: {data_columns}")

            # Validate column selections based on data type
            if data_type == "accelerometer":
                if len(data_columns) != 3:
                    raise HTTPException(
                        status_code=400, detail=f"Accelerometer data requires exactly 3 columns (X, Y, Z), but {len(data_columns)} were selected")
                logger.info(
                    f"Processing accelerometer data with columns: {data_columns}")
            elif data_type == "enmo":
                if len(data_columns) != 1:
                    raise HTTPException(
                        status_code=400, detail=f"ENMO data requires exactly 1 column, but {len(data_columns)} were selected")
                logger.info(
                    f"Processing ENMO data with column: {data_columns[0]}")
            elif data_type == "alternative_counts":
                if len(data_columns) != 1:
                    raise HTTPException(
                        status_code=400, detail=f"Alternative counts data requires exactly 1 column, but {len(data_columns)} were selected")
                logger.info(
                    f"Processing alternative counts data with column: {data_columns[0]}")

            # Get timezone from request first, then from file data, default to UTC
            time_zone = request.time_zone or file_data.get("time_zone", "UTC")
            logger.info(f"Using timezone for file {file_id}: {time_zone}")
            logger.info(f"Request timezone: {request.time_zone}")
            logger.info(f"Request timezone type: {type(request.time_zone) if request.time_zone else 'None'}")
            logger.info(f"Stored timezone: {file_data.get('time_zone', 'NOT_SET')}")
            logger.info(f"Stored timezone type: {type(file_data.get('time_zone')) if file_data.get('time_zone') else 'None'}")
            logger.info(f"File data keys: {list(file_data.keys())}")
            logger.info(f"File data time_zone field: {file_data.get('time_zone', 'NOT_SET')}")
            logger.info(f"Full file_data content: {file_data}")
            
            # Handle timezone-aware data issue by using None for timezone if data might be timezone-aware
            # This prevents the cosinorage library from trying to localize already timezone-aware data
            if time_format in ['datetime', 'iso']:
                logger.info(f"Using timezone=None for {time_format} format to avoid timezone-aware data conflicts")
                time_zone = None
            
            # Handle timezone-aware data by setting time_zone to None if data might already be timezone-aware
            # This prevents the "Already tz-aware" error in cosinorage
            if time_format in ["datetime", "iso"]:
                logger.info(f"Detected datetime/iso format, setting time_zone to None to avoid tz-aware conflict")
                time_zone = None
            
            handler = GenericDataHandler(
                file_path=file_data["file_path"],
                data_format="csv",
                data_type=data_type,
                time_format=time_format,
                time_column=time_column,
                time_zone=time_zone,
                data_columns=data_columns,
                preprocess_args=request.preprocess_args,
                verbose=True
            )
        else:
            if "child_dir" not in file_data:
                raise HTTPException(
                    status_code=400, detail="No child directory found")

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
                data_columns=['acceleration_x',
                              'acceleration_y', 'acceleration_z']
            )

        # Accept any valid numeric value for all preprocess_args
        default_preprocess = {
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
        for k, v in request.preprocess_args.items():
            if isinstance(v, (int, float)):
                continue
            try:
                request.preprocess_args[k] = float(v)
            except (ValueError, TypeError):
                logger.warning(
                    f"Invalid value for {k}: {v}, setting to default {default_preprocess.get(k)}")
                request.preprocess_args[k] = default_preprocess.get(k)

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

        # Extract ENMO timeseries data (similar to bulk processing)
        enmo_timeseries = []
        try:
            # Resample to hourly data for better performance
            df['TIMESTAMP'] = pd.to_datetime(df['TIMESTAMP'])
            df.set_index('TIMESTAMP', inplace=True)

            # Resample to hourly and take the mean
            hourly_df = df.resample('1H').mean()

            # Create data structure with timestamp and ENMO values
            for timestamp, row in hourly_df.iterrows():
                if pd.notna(row['ENMO']):
                    enmo_timeseries.append({
                        'timestamp': timestamp.isoformat(),
                        'enmo': float(row['ENMO'])
                    })

            logger.info(
                f"Extracted {len(enmo_timeseries)} hourly ENMO values (from {len(df)} original points)")
        except Exception as e:
            logger.warning(f"Error extracting ENMO timeseries data: {e}")
            enmo_timeseries = []

        cosinor_features = features['cosinor']
        non_parametric_features = features['nonparam']
        physical_activity_features = features['physical_activity']
        sleep_features = features['sleep']

        # Log the processed data summary
        logger.info(f"=== PROCESSING RESULTS ===")
        logger.info(f"Data points processed: {len(df_json)}")
        logger.info(f"Metadata: {metadata}")
        logger.info(
            f"Cosinor features keys: {list(cosinor_features.keys()) if cosinor_features else 'None'}")
        logger.info(
            f"Non-parametric features keys: {list(non_parametric_features.keys()) if non_parametric_features else 'None'}")
        logger.info(
            f"Physical activity features keys: {list(physical_activity_features.keys()) if physical_activity_features else 'None'}")
        logger.info(
            f"Sleep features keys: {list(sleep_features.keys()) if sleep_features else 'None'}")

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
            },
            "enmo_timeseries": enmo_timeseries
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


@app.get("/timezones")
async def get_timezones():
    """
    Get all available timezones organized by continent
    """
    try:
        # Get all timezones from pytz
        all_timezones = pytz.all_timezones
        
        # Organize timezones by continent
        timezones_by_continent = {}
        for tz in all_timezones:
            continent = tz.split('/')[0]
            if continent not in timezones_by_continent:
                timezones_by_continent[continent] = []
            timezones_by_continent[continent].append(tz)
        
        # Sort continents and timezones within each continent
        sorted_continents = sorted(timezones_by_continent.keys())
        for continent in sorted_continents:
            timezones_by_continent[continent].sort()
        
        return {
            "timezones": timezones_by_continent,
            "continents": sorted_continents,
            "default": "UTC"
        }
    except Exception as e:
        logger.error(f"Error getting timezones: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


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
    data_type: Optional[str] = None
    data_unit: Optional[str] = None
    time_format: Optional[str] = None
    time_zone: Optional[str] = None


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

        # Update additional fields if provided
        if request.data_type is not None:
            file_info["data_type"] = request.data_type
        if request.data_unit is not None:
            file_info["data_unit"] = request.data_unit
        if request.time_format is not None:
            file_info["time_format"] = request.time_format
        if request.time_zone is not None:
            file_info["time_zone"] = request.time_zone
            logger.info(f"Updated timezone for file {file_id}: {request.time_zone}")
            logger.info(f"Request time_zone value: {request.time_zone}")
            logger.info(f"Request time_zone type: {type(request.time_zone)}")
        else:
            logger.warning(f"No time_zone provided in request for file {file_id}")

        logger.info(
            f"Updated column selections for file {file_id}: time_column={request.time_column}, data_columns={request.data_columns}, data_type={request.data_type}, data_unit={request.data_unit}, time_format={request.time_format}, time_zone={request.time_zone}")
        logger.info(f"File data after update: {uploaded_data[file_id]}")

        return {
            "message": "Column selections updated successfully",
            "time_column": request.time_column,
            "data_columns": request.data_columns,
            "data_type": request.data_type,
            "data_unit": request.data_unit,
            "time_format": request.time_format,
            "time_zone": request.time_zone
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"Error updating column selections: {str(e)}", exc_info=True)
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
            raise HTTPException(
                status_code=404, detail="File not found or not processed")

        data = uploaded_data[file_id]
        if 'handler' not in data:
            logger.error(f"Data handler not available for file ID {file_id}")
            raise HTTPException(
                status_code=400, detail="Data handler not available")

        # Log the data we're working with
        logger.info(f"Handler type: {type(data['handler'])}")
        logger.info(f"Available data keys: {list(data.keys())}")
        if 'features' in data:
            logger.info(f"Available features: {list(data['features'].keys())}")
            if 'cosinor' in data['features']:
                logger.info(f"Cosinor features: {data['features']['cosinor']}")

        # Create record in the correct format
        record = [{
            # Use the stored GalaxyDataHandler object
            'handler': data['handler'],
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
            raise HTTPException(
                status_code=500, detail="Failed to get prediction from CosinorAge")

        # Get the first prediction result
        prediction = predictions[0]
        if 'cosinorage' not in prediction:
            raise HTTPException(
                status_code=500, detail="Prediction result missing CosinorAge")

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
        raise HTTPException(
            status_code=500, detail=f"Error predicting age: {str(e)}")


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
            if file_id in file_upload_times:
                del file_upload_times[file_id]

            return {"message": f"State cleared for file {file_id}"}
        else:
            raise HTTPException(status_code=404, detail="File not found")

    except Exception as e:
        logger.error(f"Error clearing state: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/clear_all_state")
async def clear_all_state():
    """
    Clear all uploaded data and directories
    """
    try:
        logger.info("=== CLEARING ALL STATE ===")

        # Clean up all temporary directories
        for temp_dir in temp_dirs.values():
            if os.path.exists(temp_dir):
                try:
                    shutil.rmtree(temp_dir)
                    logger.info(f"Cleared temporary directory: {temp_dir}")
                except Exception as e:
                    logger.warning(
                        f"Failed to clear temporary directory {temp_dir}: {str(e)}")

        # Clean up all permanent directories from uploaded_data
        for file_data in uploaded_data.values():
            if "permanent_dir" in file_data and os.path.exists(file_data["permanent_dir"]):
                try:
                    shutil.rmtree(file_data["permanent_dir"])
                    logger.info(
                        f"Cleared permanent directory: {file_data['permanent_dir']}")
                except Exception as e:
                    logger.warning(
                        f"Failed to clear permanent directory {file_data['permanent_dir']}: {str(e)}")

        # Clear extracted_files directory completely
        if os.path.exists(EXTRACTED_FILES_DIR):
            try:
                for item in os.listdir(EXTRACTED_FILES_DIR):
                    item_path = os.path.join(EXTRACTED_FILES_DIR, item)
                    if os.path.isdir(item_path):
                        shutil.rmtree(item_path)
                    else:
                        os.remove(item_path)
                logger.info(
                    f"Cleared all contents from extracted_files directory: {EXTRACTED_FILES_DIR}")
            except Exception as e:
                logger.warning(
                    f"Failed to clear extracted_files directory: {str(e)}")

        # Clear in-memory state
        uploaded_data.clear()
        temp_dirs.clear()
        file_upload_times.clear()

        logger.info("All state cleared successfully")
        return {"message": "All uploaded data and directories cleared successfully"}

    except Exception as e:
        logger.error(f"Error clearing all state: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

# Documentation API endpoints


@app.get("/docs/content/{page_path:path}")
async def get_docs_content(page_path: str = ""):
    """
    Get documentation content for a specific page
    """
    try:
        # Import the function here to avoid circular imports
        from docs_service import fetch_documentation
        return {"content": fetch_documentation(page_path)}
    except Exception as e:
        logger.error(f"Error fetching docs content: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/docs/sitemap")
async def get_docs_sitemap():
    """
    Get the sitemap of all documentation pages
    """
    try:
        # Return available documentation modules
        return {
            "pages": [
                {"name": "dataloaders", "title": "Data Handlers"},
                {"name": "features", "title": "Feature Extraction"},
                {"name": "bioages", "title": "Biological Age Prediction"}
            ]
        }
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
    sample_file_path = os.path.join(os.path.dirname(
        os.path.abspath(__file__)), "data", "sample", "sample_data_single.csv")
    if not os.path.exists(sample_file_path):
        raise HTTPException(status_code=404, detail="Sample file not found")

    return FileResponse(
        path=sample_file_path,
        filename="sample_data_single.csv",
        media_type="text/csv"
    )


@app.get("/download/sample-multi")
async def download_sample_multi_data():
    """Download sample multi-individual data file."""
    sample_file_path = os.path.join(os.path.dirname(
        os.path.abspath(__file__)), "data", "sample", "sample_data_multi.zip")
    if not os.path.exists(sample_file_path):
        raise HTTPException(status_code=404, detail="Sample multi file not found")

    return FileResponse(
        path=sample_file_path,
        filename="sample_data_multi.zip",
        media_type="application/zip"
    )


@app.get("/download/resample-notebook")
async def download_resample_notebook():
    """Download resample notebook for minute-level data processing."""
    notebook_path = os.path.join(os.path.dirname(
        os.path.abspath(__file__)), "data", "sample", "resample_to_minute_level.ipynb")
    if not os.path.exists(notebook_path):
        raise HTTPException(status_code=404, detail="Resample notebook not found")

    return FileResponse(
        path=notebook_path,
        filename="resample_to_minute_level.ipynb",
        media_type="application/x-ipynb+json"
    )


class BulkProcessRequest(BaseModel):
    files: List[Dict[str, Any]]  # List of file configurations
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
    enable_cosinorage: bool = False
    cosinor_age_inputs: List[Dict[str, Any]] = []


@app.get("/get_columns/{file_id}")
async def get_columns(file_id: str) -> List[str]:
    """
    Get column names from a CSV file
    """
    try:
        if file_id not in uploaded_data:
            raise HTTPException(status_code=404, detail="File not found")

        file_data = uploaded_data[file_id]
        file_path = file_data.get("file_path")

        if not file_path or not os.path.exists(file_path):
            raise HTTPException(
                status_code=404, detail="File not found on disk")

        # Read the first few lines to get column names
        import pandas as pd
        try:
            df = pd.read_csv(file_path, nrows=1)
            return df.columns.tolist()
        except Exception as e:
            logger.error(f"Error reading CSV file: {str(e)}")
            raise HTTPException(
                status_code=500, detail=f"Error reading CSV file: {str(e)}")

    except Exception as e:
        logger.error(f"Error getting columns: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/bulk_upload")
async def bulk_upload_files(files: List[UploadFile] = File(...)) -> Dict[str, Any]:
    """
    Handle multiple file uploads for bulk processing
    """
    try:
        logger.info(f"=== BULK FILE UPLOAD REQUEST ===")
        logger.info(f"Number of files: {len(files)}")

        uploaded_files = []

        for i, file in enumerate(files):
            logger.info(f"Processing file {i+1}: {file.filename}")

            # Create a temporary directory for each file
            temp_dir = tempfile.mkdtemp()
            temp_dirs[str(len(uploaded_data))] = temp_dir

            # Save the uploaded file
            file_path = os.path.join(temp_dir, file.filename)

            with open(file_path, "wb") as buffer:
                contents = await file.read()
                buffer.write(contents)

            file_id = str(len(uploaded_data))
            
            # Track upload time for cleanup
            file_upload_times[file_id] = datetime.now()

            # Store file info
            uploaded_data[file_id] = {
                "filename": file.filename,
                "file_path": file_path,
                "temp_dir": temp_dir,
                "data_source": "bulk_csv"
            }

            uploaded_files.append({
                "file_id": file_id,
                "filename": file.filename
            })

        return {
            "message": f"Successfully uploaded {len(files)} files",
            "files": uploaded_files
        }

    except Exception as e:
        logger.error(f"Error processing bulk upload: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/validate_bulk_columns")
async def validate_bulk_columns(file_ids: List[str]) -> Dict[str, Any]:
    """
    Validate that all uploaded files have the same column names
    """
    try:
        logger.info(f"=== VALIDATING BULK COLUMNS ===")
        logger.info(f"Number of files to validate: {len(file_ids)}")

        if len(file_ids) < 2:
            return {
                "valid": True,
                "message": "Only one file uploaded, no validation needed",
                "columns": None
            }

        # Get column names for each file
        file_columns = {}
        for file_id in file_ids:
            if file_id not in uploaded_data:
                logger.error(f"File {file_id} not found in uploaded_data")
                raise HTTPException(
                    status_code=404, detail=f"File {file_id} not found")

            file_data = uploaded_data[file_id]
            file_path = file_data["file_path"]

            # Check if file still exists on disk
            if not os.path.exists(file_path):
                logger.error(
                    f"File {file_id} path no longer exists: {file_path}")
                raise HTTPException(
                    status_code=404, detail=f"File {file_id} no longer exists on disk")

            logger.info(
                f"Reading columns from file {file_id}: {file_data['filename']} at path: {file_path}")

            try:
                # Only read first row to get headers
                df = pd.read_csv(file_path, nrows=1)
                columns = df.columns.tolist()
                logger.info(f"Columns for file {file_id}: {columns}")
                file_columns[file_id] = {
                    "filename": file_data["filename"],
                    "columns": columns
                }
            except Exception as e:
                logger.error(
                    f"Error reading CSV file {file_data['filename']}: {str(e)}")
                raise HTTPException(
                    status_code=400, detail=f"Error reading CSV file {file_data['filename']}: {str(e)}")

        # Check if all files have the same columns
        first_file_id = file_ids[0]
        first_columns = set(file_columns[first_file_id]["columns"])
        logger.info(
            f"Reference columns from file {first_file_id}: {list(first_columns)}")

        mismatched_files = []
        for file_id in file_ids[1:]:
            current_columns = set(file_columns[file_id]["columns"])
            logger.info(
                f"Comparing file {file_id} columns: {list(current_columns)}")
            if current_columns != first_columns:
                missing_columns = first_columns - current_columns
                extra_columns = current_columns - first_columns
                logger.warning(
                    f"File {file_id} has mismatched columns. Missing: {list(missing_columns)}, Extra: {list(extra_columns)}")
                mismatched_files.append({
                    "file_id": file_id,
                    "filename": file_columns[file_id]["filename"],
                    "missing_columns": list(missing_columns),
                    "extra_columns": list(extra_columns)
                })
            else:
                logger.info(f"File {file_id} columns match reference")

        if mismatched_files:
            return {
                "valid": False,
                "message": "Files have different column structures",
                "reference_file": file_columns[first_file_id]["filename"],
                "reference_columns": list(first_columns),
                "mismatched_files": mismatched_files
            }
        else:
            return {
                "valid": True,
                "message": "All files have the same column structure",
                "columns": list(first_columns)
            }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error validating bulk columns: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/bulk_process")
async def bulk_process_data(request: BulkProcessRequest) -> Dict[str, Any]:
    """
    Process multiple files using BulkWearableFeatures and return distribution statistics
    """
    try:
        logger.info(f"=== BULK DATA PROCESSING REQUEST ===")
        logger.info(f"Number of files to process: {len(request.files)}")
        logger.info(f"Preprocessing arguments: {request.preprocess_args}")
        logger.info(f"Features arguments: {request.features_args}")
        logger.info(f"Cosinorage enabled: {request.enable_cosinorage}")
        if request.enable_cosinorage:
            logger.info(f"Number of cosinorage age inputs: {len(request.cosinor_age_inputs)}")
            logger.info(f"Cosinorage age inputs: {request.cosinor_age_inputs}")
        
        # Log file configurations to debug timezone issue
        for i, file_config in enumerate(request.files):
            logger.info(f"File {i} config: {file_config}")
            logger.info(f"File {i} timezone: {file_config.get('time_zone', 'NOT_SET')}")

        # Validate that all files have the same column structure
        file_ids = [file_config["file_id"] for file_config in request.files]
        logger.info(f"Files to validate: {file_ids}")
        logger.info(
            f"Available files in uploaded_data: {list(uploaded_data.keys())}")

        # Check if all files exist
        for file_id in file_ids:
            if file_id not in uploaded_data:
                logger.error(
                    f"File {file_id} not found in uploaded_data during bulk process")
                raise HTTPException(
                    status_code=404, detail=f"File {file_id} not found. Files may have been cleared from server memory.")

        validation_result = await validate_bulk_columns(file_ids)

        if not validation_result["valid"]:
            raise HTTPException(
                status_code=400,
                detail=f"Column validation failed: {validation_result['message']}. Files must have identical column structures."
            )

        handlers = []
        failed_files = []

        for file_config in request.files:
            file_id = file_config["file_id"]

            if file_id not in uploaded_data:
                failed_files.append({
                    "file_id": file_id,
                    "filename": "Unknown",
                    "error": f"File {file_id} not found in uploaded data"
                })
                logger.warning(
                    f"File {file_id} not found in uploaded_data, skipping")
                continue

            file_data = uploaded_data[file_id]

            # Create data type string
            if file_config["data_type"] and '-' in file_config["data_type"]:
                data_type = file_config["data_type"]
            elif file_config["data_type"] and file_config.get("data_unit"):
                data_type = file_config["data_type"] + \
                    '-' + file_config["data_unit"]
            else:
                data_type = file_config["data_type"] or "unknown"

            # Set default values for column names if not provided
            time_column = file_config.get("time_column")
            data_columns = file_config.get("data_columns", [])

            # If time_column is not provided, try to infer it
            if not time_column:
                # Try common time column names
                common_time_columns = ['timestamp',
                                       'time', 'datetime', 'date', 't']
                available_columns = validation_result.get("columns", [])
                for col in common_time_columns:
                    if col in available_columns:
                        time_column = col
                        break
                if not time_column and available_columns:
                    # Use the first column as fallback
                    time_column = available_columns[0]
                    logger.warning(
                        f"No time column specified for file {file_id}, using first column: {time_column}")

            # Ensure time_column is not None
            if not time_column:
                failed_files.append({
                    "file_id": file_id,
                    "filename": file_data.get("filename", "Unknown"),
                    "error": f"Could not determine time column for file {file_id}. Please specify a time column."
                })
                logger.warning(
                    f"Could not determine time column for file {file_id}, skipping")
                continue

            # If data_columns is not provided, try to infer them based on data type
            if not data_columns:
                available_columns = validation_result.get("columns", [])
                if data_type.startswith("accelerometer"):
                    # For accelerometer data, look for X, Y, Z columns
                    accel_columns = []
                    for axis in ['x', 'y', 'z']:
                        for col in available_columns:
                            if axis in col.lower() and col != time_column:
                                accel_columns.append(col)
                                break
                    if len(accel_columns) == 3:
                        data_columns = accel_columns
                    # Assuming first 3 non-time columns are X, Y, Z
                    elif len(available_columns) >= 4:
                        data_columns = [
                            col for col in available_columns if col != time_column][:3]
                elif data_type.startswith("enmo"):
                    # For ENMO data, look for ENMO column
                    for col in available_columns:
                        if 'enmo' in col.lower() and col != time_column:
                            data_columns = [col]
                            break
                    if not data_columns and len(available_columns) >= 2:
                        data_columns = [
                            col for col in available_columns if col != time_column][:1]
                else:
                    # For other data types, use all non-time columns
                    data_columns = [
                        col for col in available_columns if col != time_column]

                if not data_columns:
                    logger.warning(
                        f"No data columns found for file {file_id}, using all columns except time column")
                    data_columns = [
                        col for col in available_columns if col != time_column]

            # Set default timestamp format if not provided
            timestamp_format = file_config.get("timestamp_format", "datetime")

            logger.info(
                f"Using inferred columns for file {file_id}: time_column={time_column}, data_columns={data_columns}, timestamp_format={timestamp_format}")

            try:
                # Get timezone from stored file data first, then from file config, default to UTC
                stored_time_zone = file_data.get("time_zone")
                config_time_zone = file_config.get("time_zone")
                time_zone = stored_time_zone or config_time_zone or "UTC"
                logger.info(f"Using timezone for file {file_id}: {time_zone}")
                logger.info(f"Stored timezone: {stored_time_zone}")
                logger.info(f"Config timezone: {config_time_zone}")
                logger.info(f"File data keys: {list(file_data.keys())}")
                logger.info(f"File config keys: {list(file_config.keys())}")
                logger.info(f"File data time_zone field: {file_data.get('time_zone', 'NOT_SET')}")
                logger.info(f"File config time_zone field: {file_config.get('time_zone', 'NOT_SET')}")
                
                # Handle timezone-aware data issue by using None for timezone if data might be timezone-aware
                # This prevents the cosinorage library from trying to localize already timezone-aware data
                if timestamp_format in ['datetime', 'iso']:
                    logger.info(f"Using timezone=None for {timestamp_format} format to avoid timezone-aware data conflicts")
                    time_zone = None
                
                # Create GenericDataHandler for each file
                handler = GenericDataHandler(
                    file_path=file_data["file_path"],
                    data_format="csv",
                    data_type=data_type,
                    time_format=timestamp_format,
                    time_column=time_column,
                    time_zone=time_zone,
                    data_columns=data_columns,
                    preprocess_args=request.preprocess_args,
                    verbose=True
                )
                handlers.append(handler)
                logger.info(
                    f"Successfully created handler for file {file_id}: {file_data.get('filename', 'Unknown')}")
            except Exception as e:
                error_msg = str(e)
                logger.warning(
                    f"Error creating GenericDataHandler for file {file_id}: {error_msg}")
                failed_files.append({
                    "file_id": file_id,
                    "filename": file_data.get("filename", "Unknown"),
                    "error": error_msg
                })
                continue

        # Check if we have any valid handlers to process
        if not handlers:
            logger.warning(
                "No valid handlers created, all files failed processing")
            return {
                "message": "No files could be processed successfully",
                "successful_files": 0,
                "failed_files": failed_files,
                "distribution_stats": {},
                "individual_results": [],
                "failed_handlers": [],
                "summary_dataframe": [],
                "correlation_matrix": {}
            }

        logger.info(
            f"Successfully created {len(handlers)} handlers out of {len(request.files)} files. {len(failed_files)} files failed.")

        # Accept any valid numeric value for all preprocess_args
        default_preprocess = {
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
        for k, v in request.preprocess_args.items():
            if isinstance(v, (int, float)):
                continue
            try:
                request.preprocess_args[k] = float(v)
            except (ValueError, TypeError):
                logger.warning(
                    f"Invalid value for {k}: {v}, setting to default {default_preprocess.get(k)}")
                request.preprocess_args[k] = default_preprocess.get(k)

        logger.info(f"Using preprocessing args: {request.preprocess_args}")
        logger.info(f"Using features args: {request.features_args}")

        # Update handlers with validated parameters
        for handler in handlers:
            handler.preprocess_args = request.preprocess_args

        # Prepare cosinorage inputs for successful handlers only
        cosinor_age_inputs = []
        if request.enable_cosinorage and request.cosinor_age_inputs:
            # Only include age inputs for successfully processed handlers
            # The order should match the successful handlers
            for i, handler in enumerate(handlers):
                if i < len(request.cosinor_age_inputs):
                    cosinor_age_inputs.append(request.cosinor_age_inputs[i])
                else:
                    logger.warning(f"No cosinorage input available for handler {i}")
            
            logger.info(f"Prepared {len(cosinor_age_inputs)} cosinorage inputs for {len(handlers)} handlers")

        if request.enable_cosinorage:
            bulk_features = BulkWearableFeatures(
                handlers=handlers,
                features_args=request.features_args,
                cosinor_age_inputs=cosinor_age_inputs
            )
        else:
            bulk_features = BulkWearableFeatures(
                handlers=handlers,
                features_args=request.features_args
            )

        # Get distribution statistics
        distribution_stats = bulk_features.get_distribution_stats()

        # Get individual features
        individual_features = bulk_features.get_individual_features()

        # Get failed handlers
        failed_handlers = bulk_features.get_failed_handlers()

        # Get summary dataframe
        summary_df = bulk_features.get_summary_dataframe()

        # Get correlation matrix
        correlation_matrix = bulk_features.get_feature_correlation_matrix()

        # log the correlation matrix
        logger.info("=== CORRELATION MATRIX ===")
        logger.info(correlation_matrix)
        logger.info("=== END CORRELATION MATRIX ===")

        # Note: cosinorage predictions, summary statistics, and correlations are all handled
        # by the BulkWearableFeatures class when cosinorage is enabled
        if request.enable_cosinorage:
            logger.info("Cosinorage is enabled - all cosinorage processing is handled by BulkWearableFeatures class")

        # Extract ENMO data from each handler before processing
        # This is similar to how single individual processing works
        handler_enmo_data = []
        for i, handler in enumerate(handlers):
            try:
                # Create a WearableFeatures instance for this handler to get the processed data
                wf = WearableFeatures(
                    handler, features_args=request.features_args)
                df = wf.get_ml_data()
                df = df.reset_index()
                if 'timestamp' not in df.columns and 'index' in df.columns:
                    df = df.rename(columns={'index': 'timestamp'})
                df = df.rename(
                    columns={'timestamp': 'TIMESTAMP', 'enmo': 'ENMO'})

                # Resample to hourly data for better performance
                df['TIMESTAMP'] = pd.to_datetime(df['TIMESTAMP'])
                df.set_index('TIMESTAMP', inplace=True)

                # Resample to hourly and take the mean
                hourly_df = df.resample('1H').mean()

                # Create data structure with timestamp and ENMO values
                enmo_data = []
                for timestamp, row in hourly_df.iterrows():
                    if pd.notna(row['ENMO']):
                        enmo_data.append({
                            'timestamp': timestamp.isoformat(),
                            'enmo': float(row['ENMO'])
                        })

                handler_enmo_data.append(enmo_data)

                logger.info(
                    f"Handler {i}: extracted {len(enmo_data)} hourly ENMO values (from {len(df)} original points)")
            except Exception as e:
                logger.warning(
                    f"Error extracting ENMO data from handler {i}: {e}")
                handler_enmo_data.append([])

        logger.info(
            f"Extracted ENMO data from {len(handler_enmo_data)} handlers")

        # Clean the data to handle NaN and infinity values for JSON serialization
        def clean_for_json(obj):
            if isinstance(obj, dict):
                return {k: clean_for_json(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [clean_for_json(v) for v in obj]
            elif isinstance(obj, float):
                if pd.isna(obj) or np.isinf(obj):
                    return None
                return obj
            elif isinstance(obj, (int, str, bool)) or obj is None:
                return obj
            else:
                return str(obj)

        def safe_isinf(value):
            """Safely check if a value is infinite, handling non-numeric types"""
            try:
                if isinstance(value, (int, float, np.number)):
                    return np.isinf(value)
                return False
            except:
                return False

        # Clean the distribution stats
        cleaned_distribution_stats = clean_for_json(distribution_stats)

        # Clean the individual results
        cleaned_individual_results = []
        for i, features in enumerate(individual_features):
            if features is not None:
                # Use the pre-extracted ENMO data
                enmo_data = handler_enmo_data[i] if i < len(
                    handler_enmo_data) else None

                # Add cosinorage prediction and advance if enabled and available
                cosinorage_prediction = None
                cosinorage_advance_calculated = None
                if request.enable_cosinorage and i < len(cosinor_age_inputs):
                    try:
                        # Create individual CosinorAge object for this handler
                        age_input = cosinor_age_inputs[i]
                        record = [{
                            'handler': handlers[i],
                            'age': age_input['age'],
                            'gender': age_input['gender']
                        }]
                        
                        cosinor_age = CosinorAge(record)
                        predictions = cosinor_age.get_predictions()
                        
                        if predictions and len(predictions) > 0:
                            prediction = predictions[0]
                            if 'cosinorage' in prediction:
                                cosinorage_prediction = prediction['cosinorage']
                                chronological_age = age_input['age']
                                cosinorage_advance_calculated = cosinorage_prediction - chronological_age
                                
                                logger.info(f"Got cosinorage prediction for handler {i}: {cosinorage_prediction}")
                                logger.info(f"Calculated cosinorage advance for handler {i}: {cosinorage_advance_calculated}")
                            else:
                                logger.warning(f"Prediction result missing cosinorage for handler {i}")
                        else:
                            logger.warning(f"No predictions returned for handler {i}")
                    except Exception as e:
                        logger.warning(f"Error getting cosinorage prediction for handler {i}: {e}")

                # Add cosinorage and advance to features if available
                if cosinorage_prediction is not None:
                    if features is None:
                        features = {}
                    if 'cosinorage' not in features:
                        features['cosinorage'] = {}
                    features['cosinorage']['cosinorage'] = cosinorage_prediction
                    
                    # Add cosinorage advance
                    if cosinorage_advance_calculated is not None:
                        features['cosinorage']['cosinorage_advance'] = cosinorage_advance_calculated
                    
                    logger.info(f"Added cosinorage and advance to features for handler {i}: cosinorage={cosinorage_prediction}, advance={cosinorage_advance_calculated}")

                result_item = {
                    "file_id": request.files[i]["file_id"],
                    "filename": uploaded_data[request.files[i]["file_id"]]["filename"],
                    "features": clean_for_json(features),
                    "enmo_timeseries": enmo_data
                }
                
                # Add cosinorage prediction if available
                if cosinorage_prediction:
                    result_item["cosinorage"] = cosinorage_prediction
                
                cleaned_individual_results.append(result_item)

        # Clean the summary dataframe
        cleaned_summary_df = []
        if not summary_df.empty:
            for _, row in summary_df.iterrows():
                cleaned_row = {}
                for col, value in row.items():
                    if pd.isna(value) or safe_isinf(value):
                        cleaned_row[col] = None
                    else:
                        cleaned_row[col] = value
                cleaned_summary_df.append(cleaned_row)

        # Clean the correlation matrix
        cleaned_correlation_matrix = {}
        if not correlation_matrix.empty:
            for col in correlation_matrix.columns:
                cleaned_correlation_matrix[col] = {}
                for idx in correlation_matrix.index:
                    value = correlation_matrix.loc[idx, col]
                    if pd.isna(value) or safe_isinf(value):
                        cleaned_correlation_matrix[col][idx] = None
                    else:
                        cleaned_correlation_matrix[col][idx] = value

        return {
            "message": f"Successfully processed {len(handlers)} files out of {len(request.files)} total files",
            "successful_files": len(handlers),
            "total_files": len(request.files),
            "failed_files": failed_files,
            "distribution_stats": cleaned_distribution_stats,
            "individual_results": cleaned_individual_results,
            "failed_handlers": failed_handlers,
            "summary_dataframe": cleaned_summary_df,
            "correlation_matrix": cleaned_correlation_matrix
        }

    except Exception as e:
        logger.error(f"Error processing bulk data: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Error processing bulk data: {str(e)}")


class CleanupConfig(BaseModel):
    cleanup_interval_minutes: Optional[int] = None
    file_age_limit_minutes: Optional[int] = None


@app.get("/cleanup/config")
async def get_cleanup_config():
    """
    Get current cleanup configuration
    """
    return {
        "cleanup_interval_minutes": CLEANUP_INTERVAL_MINUTES,
        "file_age_limit_minutes": FILE_AGE_LIMIT_MINUTES,
        "files_tracked": len(file_upload_times),
        "temp_dirs_tracked": len(temp_dirs),
        "next_cleanup_in_minutes": CLEANUP_INTERVAL_MINUTES if not CLEANUP_TASK_RUNNING else 0
    }


@app.post("/cleanup/config")
async def update_cleanup_config(config: CleanupConfig):
    """
    Update cleanup configuration
    """
    global CLEANUP_INTERVAL_MINUTES, FILE_AGE_LIMIT_MINUTES
    
    if config.cleanup_interval_minutes is not None:
        if config.cleanup_interval_minutes < 1:
            raise HTTPException(status_code=400, detail="Cleanup interval must be at least 1 minute")
        CLEANUP_INTERVAL_MINUTES = config.cleanup_interval_minutes
        logger.info(f"Updated cleanup interval to {CLEANUP_INTERVAL_MINUTES} minutes")
    
    if config.file_age_limit_minutes is not None:
        if config.file_age_limit_minutes < 1:
            raise HTTPException(status_code=400, detail="File age limit must be at least 1 minute")
        FILE_AGE_LIMIT_MINUTES = config.file_age_limit_minutes
        logger.info(f"Updated file age limit to {FILE_AGE_LIMIT_MINUTES} minutes")
    
    return {
        "message": "Cleanup configuration updated successfully",
        "cleanup_interval_minutes": CLEANUP_INTERVAL_MINUTES,
        "file_age_limit_minutes": FILE_AGE_LIMIT_MINUTES
    }


@app.post("/cleanup/trigger")
async def trigger_cleanup():
    """
    Manually trigger cleanup
    """
    try:
        logger.info("Manual cleanup triggered")
        
        # Calculate cutoff time
        cutoff_time = datetime.now() - timedelta(minutes=FILE_AGE_LIMIT_MINUTES)
        
        # Clean up old files from uploaded_data
        files_to_remove = []
        for file_id, upload_time in file_upload_times.items():
            if upload_time < cutoff_time:
                files_to_remove.append(file_id)
        
        for file_id in files_to_remove:
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
                    del file_upload_times[file_id]
                    
            except Exception as e:
                logger.warning(f"Failed to clean up file {file_id}: {str(e)}")
        
        # Clean up old temporary directories
        for temp_dir in list(temp_dirs.values()):
            try:
                if os.path.exists(temp_dir):
                    dir_time = datetime.fromtimestamp(os.path.getctime(temp_dir))
                    if dir_time < cutoff_time:
                        shutil.rmtree(temp_dir)
            except Exception as e:
                logger.warning(f"Failed to clean up temp directory {temp_dir}: {str(e)}")
        
        # Clean up old files in extracted_files directory
        if os.path.exists(EXTRACTED_FILES_DIR):
            try:
                for item in os.listdir(EXTRACTED_FILES_DIR):
                    item_path = os.path.join(EXTRACTED_FILES_DIR, item)
                    if os.path.exists(item_path):
                        item_time = datetime.fromtimestamp(os.path.getctime(item_path))
                        if item_time < cutoff_time:
                            if os.path.isdir(item_path):
                                shutil.rmtree(item_path)
                            else:
                                os.remove(item_path)
            except Exception as e:
                logger.warning(f"Failed to clean up extracted files directory: {str(e)}")
        
        return {
            "message": f"Manual cleanup completed. Removed {len(files_to_remove)} old files.",
            "files_removed": len(files_to_remove)
        }
        
    except Exception as e:
        logger.error(f"Error in manual cleanup: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
