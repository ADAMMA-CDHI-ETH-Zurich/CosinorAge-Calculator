# 🧬 Accelerometer & ENMO Data Analyzer

<div align="center">

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![React](https://img.shields.io/badge/React-18.0+-61dafb.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.68+-009688.svg)](https://fastapi.tiangolo.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)

</div>

A web application for analyzing accelerometer and ENMO data with drag-and-drop functionality and interactive visualizations.

## ✨ Features

- 📁 Drag and drop interface for file upload
- 📊 Support for CSV and JSON files
- 📈 Interactive data visualization
- ⚡ Real-time data processing
- 🎨 Modern, responsive UI

## 🎥 Demo Video

<div align="center">

<video src="https://github.com/user-attachments/assets/23af4e84-fdd7-416c-9bd4-4cc82258fa27" controls="controls">Your browser does not support playing this video!</video>

*Watch our demo showcasing the application's features and capabilities*

</div>

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
./cosinorlab.sh restart-dev      # 🔄 Restart development containers and open browser
./cosinorlab.sh restart-prod     # 🔄 Restart production containers and open browser
./cosinorlab.sh stop             # ⏹️ Stop all containers
./cosinorlab.sh status           # 📊 Show container status
./cosinorlab.sh open             # 🌐 Open frontend in browser
```

## Manual Setup

### Backend Setup

1. **Create a virtual environment** (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies**:
```bash
pip install -r requirements.txt
```

3. **Start the backend server**:
```bash
cd backend
uvicorn main:app --reload
```

**Backend URL**: http://localhost:8000

### Frontend Setup

1. **Install dependencies**:
```bash
cd frontend
npm install
```

2. **Start the development server**:
```bash
npm start
```

**Frontend URL**: http://localhost:3000

## Usage

1. **Open your browser** and navigate to http://localhost (Docker) or http://localhost:3000 (manual setup)
2. **Drag and drop** your accelerometer data file (CSV or JSON) onto the upload area
3. **View the processed data** and visualizations
4. **Interact with the charts** to explore your data

## 📋 File Format

The application expects accelerometer data in CSV or JSON format. The data should contain columns for the accelerometer readings (typically x, y, z axes).

## Development

| Component | Technology |
|-----------|------------|
| **Backend** | FastAPI |
| **Frontend** | React with Material-UI |
| **Visualization** | Recharts |
| **File handling** | react-dropzone | 