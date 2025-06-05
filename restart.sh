#!/bin/bash

# Kill any existing frontend and backend processes
pkill -f 'npm start' || true
pkill -f 'uvicorn' || true

# Kill processes on ports 3000 and 8000
lsof -ti:3000 | xargs kill -9 || true
lsof -ti:8000 | xargs kill -9 || true

# Wait a moment to ensure processes are fully terminated
sleep 2

# Start the frontend server
cd frontend && npm start &

# Start the backend server
cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000 &

echo "Frontend and backend servers have been restarted." 