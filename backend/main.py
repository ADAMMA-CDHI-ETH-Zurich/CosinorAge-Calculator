from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
from typing import Dict, Any, List
from cosinorage.bioages.cosinorage import CosinorAge
from cosinorage.datahandlers.galaxydatahandler import GalaxyDataHandler
import json
from io import BytesIO
import os
import shutil
import tempfile
from pathlib import Path
import logging
import zipfile
from datetime import datetime
from cosinorage.features.features import WearableFeatures

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
async def upload_file(file: UploadFile = File(...)) -> Dict[str, Any]:
    """
    Handle file upload and extraction
    """
    try:
        logger.info(f"Received file upload request for file: {file.filename}")
        
        # Create a temporary directory to store the uploaded files
        temp_dir = tempfile.mkdtemp()  # Create a temporary directory that won't be automatically deleted
        temp_dirs[str(len(uploaded_data))] = temp_dir  # Store the temp directory path
        
        # Save the uploaded file
        file_path = os.path.join(temp_dir, file.filename)
        logger.info(f"Saving file to temporary directory: {file_path}")
        
        with open(file_path, "wb") as buffer:
            contents = await file.read()
            buffer.write(contents)
        
        # If the file is a ZIP file, extract it
        if file.filename.endswith('.zip'):
            logger.info("File is a ZIP file, extracting...")
            extract_dir = os.path.join(temp_dir, "extracted")
            os.makedirs(extract_dir, exist_ok=True)
            with zipfile.ZipFile(file_path, 'r') as zip_ref:
                zip_ref.extractall(extract_dir)
            logger.info(f"Extracted ZIP file to: {extract_dir}")
            
            # Create directory tree
            directory_tree = create_directory_tree(extract_dir)
            
            # Store the extracted directory path
            file_id = str(len(uploaded_data))
            uploaded_data[file_id] = {
                "filename": file.filename,
                "extracted_dir": extract_dir,
                "temp_dir": temp_dir
            }
            
            return {
                "file_id": file_id,
                "filename": file.filename,
                "directory_tree": directory_tree
            }
        else:
            raise HTTPException(status_code=400, detail="Only ZIP files are supported")
                
    except Exception as e:
        logger.error(f"Error processing file: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/extract/{file_id}")
async def extract_files(file_id: str) -> Dict[str, Any]:
    """
    Extract files from the uploaded ZIP to a permanent directory
    """
    try:
        if file_id not in uploaded_data:
            raise HTTPException(status_code=404, detail="File not found")
        
        file_data = uploaded_data[file_id]
        if "extracted_dir" not in file_data:
            raise HTTPException(status_code=400, detail="No extracted directory found")
        
        # Create a new directory with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        new_dir = os.path.join(EXTRACTED_FILES_DIR, f"extracted_{timestamp}")
        os.makedirs(new_dir, exist_ok=True)
        
        # Copy files from temporary directory to permanent directory
        shutil.copytree(file_data["extracted_dir"], new_dir, dirs_exist_ok=True)
        
        # Find the child directory (first subdirectory)
        child_dirs = [d for d in os.listdir(new_dir) if os.path.isdir(os.path.join(new_dir, d))]
        if not child_dirs:
            raise HTTPException(status_code=400, detail="No subdirectories found in extracted files")
        
        child_dir = os.path.join(new_dir, child_dirs[0])
        logger.info(f"Files extracted successfully. Child directory for processing: {child_dir}")
        
        # Store the directory information
        file_data.update({
            "permanent_dir": new_dir,
            "child_dir": child_dir + '/'
        })
        
        # Clean up the temporary directory
        if file_data.get("temp_dir") and os.path.exists(file_data["temp_dir"]):
            shutil.rmtree(file_data["temp_dir"])
            del temp_dirs[file_id]
        
        return {
            "message": "Files extracted successfully",
            "directory": new_dir
        }
    except Exception as e:
        logger.error(f"Error extracting files: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/process/{file_id}")
async def process_data(file_id: str) -> Dict[str, Any]:
    """
    Process the extracted data using GalaxyDataHandler
    """
    try:
        if file_id not in uploaded_data:
            raise HTTPException(status_code=404, detail="File not found")
        
        file_data = uploaded_data[file_id]
        if "child_dir" not in file_data:
            raise HTTPException(status_code=400, detail="No child directory found")
        
        # Ensure the path ends with a forward slash
        child_dir = file_data["child_dir"]
        if not child_dir.endswith('/'):
            child_dir = child_dir + '/'
        
        # Log the directory being used
        logger.info(f"Initializing GalaxyDataHandler with directory: {child_dir}")

        preprocess_args = {
            'autocalib_sd_criter': 0.00013,
            'autocalib_sphere_crit': 0.02,
            'filter_type': 'lowpass',
            'filter_cutoff': 2,
            'wear_sd_crit': 0.00013,
            'wear_range_crit': 0.00067,
            'wear_window_length': 45,
            'wear_window_skip': 7,
        }
        
        # Initialize GalaxyDataHandler with the child directory
        handler = GalaxyDataHandler(galaxy_file_dir=child_dir, preprocess_args=preprocess_args)
        
        # Get the processed data
        df = handler.get_ml_data()
        print(df.head())
        
        df = df.reset_index()
        df.columns = ['TIMESTAMP', 'ENMO', 'wear']

        df_json = df.to_dict(orient='records')
        
        # Get metadata
        metadata = handler.get_meta_data()
        
        # Extract features using WearableFeatures
        features_args = {
            'sleep_ck_sf': 0.01,
            'sleep_rescore': True,
            'pa_cutpoint_sl': 15,
            'pa_cutpoint_lm': 35,
            'pa_cutpoint_mv': 70,
        }

        features = WearableFeatures(handler, features_args=features_args).get_features()

        cosinor_features = features['cosinor']
        non_parametric_features = features['nonparam']
        physical_activity_features = features['physical_activity']
        sleep_features = features['sleep']

        
        return {
            "message": "Data processed successfully",
            "data": df_json,
            "metadata": {
                "raw_data_frequency": metadata.get('raw_data_frequency'),
                "raw_start_datetime": metadata.get('raw_start_datetime'),
                "raw_end_datetime": metadata.get('raw_end_datetime'),
                "raw_data_type": metadata.get('raw_data_type'),
                "raw_data_unit": metadata.get('raw_data_unit'),
                "raw_n_datapoints": metadata.get('raw_n_datapoints')
            },
            "cosinor_features": {
                "MESOR": cosinor_features.get('MESOR'),
                "amplitude": cosinor_features.get('amplitude'),
                "acrophase": cosinor_features.get('acrophase'),
                "acrophase_time": cosinor_features.get('acrophase_time')
            },
            "non_parametric_features": {
                "IS": non_parametric_features.get('IS'),
                "IV": non_parametric_features.get('IV'),
                "L5": non_parametric_features.get('L5'),
                "M10": non_parametric_features.get('M10'),
                "L5_start": non_parametric_features.get('L5_start'),
                "M10_start": non_parametric_features.get('M10_start')
            },
            "physical_activity_features": {
                "sedentary": physical_activity_features.get('sedentary'),
                "light": physical_activity_features.get('light'),
                "moderate": physical_activity_features.get('moderate'),
                "vigorous": physical_activity_features.get('vigorous')
            },
            "sleep_features": {
                "TST": sleep_features.get('TST'),
                "WASO": sleep_features.get('WASO'),
                "PTA": sleep_features.get('PTA'),
                "NWB": sleep_features.get('NWB'),
                "SOL": sleep_features.get('SOL'),
                "SRI": sleep_features.get('SRI')
            },
            "rows": len(df)
        }
    except Exception as e:
        logger.error(f"Error processing data: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze/{file_id}")
async def analyze_data(file_id: str) -> Dict[str, Any]:
    """
    Run cosinor analysis on processed data
    """
    try:
        if file_id not in uploaded_data:
            raise HTTPException(status_code=404, detail="File not found")
        
        # Get the stored data
        file_data = uploaded_data[file_id]
        if "data" not in file_data:
            raise HTTPException(status_code=400, detail="No processed data found")
        
        # Convert the stored data back to a DataFrame
        raw_data = file_data["data"]["raw_data"]
        df = pd.DataFrame(raw_data)
        
        # Convert timestamp strings back to datetime and set as index
        df['TIMESTAMP'] = pd.to_datetime(df['TIMESTAMP'])
        df.set_index('TIMESTAMP', inplace=True)
        
        # Initialize CosinorAge with the data
        cosinor = CosinorAge(
            time=df.index.values,
            data=df[['ENMO']].values  # Use ENMO data for analysis
        )
        
        # Perform the analysis
        results = cosinor.analyze()
        
        # Return the analysis results
        return {
            "analysis": {
                "mesor": float(results.mesor),
                "amplitude": float(results.amplitude),
                "acrophase": float(results.acrophase),
                "period": float(results.period),
                "r_squared": float(results.r_squared)
            }
        }
    except Exception as e:
        logger.error(f"Error analyzing data: {str(e)}", exc_info=True)
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
    Clean up temporary directories when the application shuts down
    """
    for temp_dir in temp_dirs.values():
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir) 