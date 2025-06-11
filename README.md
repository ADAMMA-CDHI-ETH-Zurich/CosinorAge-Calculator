# Accelerometer Data Analyzer

A web application for analyzing accelerometer data with drag-and-drop functionality and interactive visualizations.

## Features

- Drag and drop interface for file upload
- Support for CSV and JSON files
- Interactive data visualization
- Real-time data processing
- Modern, responsive UI

## Demo Video

<video width="100%" controls>
  <source src="media/CosinorLab_Demo_v1.0.mov" type="video/quicktime">
  Your browser does not support the video tag.
</video>

## Setup

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

1. Open your browser and navigate to http://localhost:3000
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