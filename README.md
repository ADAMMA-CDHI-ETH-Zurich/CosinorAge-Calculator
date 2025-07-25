# Accelerometer Data Analyzer

A web application for analyzing accelerometer data with drag-and-drop functionality and interactive visualizations.

## Features

- Drag and drop interface for file upload
- Support for CSV and JSON files
- Interactive data visualization
- Real-time data processing
- Modern, responsive UI

## Demo Video
<video src="https://github.com/user-attachments/assets/23af4e84-fdd7-416c-9bd4-4cc82258fa27" controls="controls">Your browser does not support playing this video!</video>

## Quick Start (Docker - Recommended)

The easiest way to run the application is using Docker:

### Development Environment (with hot reloading)
```bash
./cosinorlab.sh deploy-dev
```

### Production Environment
```bash
./cosinorlab.sh deploy-prod
```

### Other Commands
```bash
./cosinorlab.sh restart-dev      # Restart development containers and open browser
./cosinorlab.sh restart-prod     # Restart production containers and open browser
./cosinorlab.sh stop             # Stop all containers
./cosinorlab.sh status           # Show container status
./cosinorlab.sh open             # Open frontend in browser
```

## Manual Setup

### Backend Setup

1. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Start the backend server:
```bash
cd backend
uvicorn main:app --reload
```

The backend will run on http://localhost:8000

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm start
```

The frontend will run on http://localhost:3000

## Usage

1. Open your browser and navigate to http://localhost (Docker) or http://localhost:3000 (manual setup)
2. Drag and drop your accelerometer data file (CSV or JSON) onto the upload area
3. View the processed data and visualizations
4. Interact with the charts to explore your data

## File Format

The application expects accelerometer data in CSV or JSON format. The data should contain columns for the accelerometer readings (typically x, y, z axes).

## Development

- Backend: FastAPI
- Frontend: React with Material-UI
- Visualization: Recharts
- File handling: react-dropzone 