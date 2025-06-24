#!/bin/bash

# CosinorLab Docker Deployment Script
# This script builds and runs the CosinorLab application using Docker Compose

set -e  # Exit on any error

echo "🚀 Starting CosinorLab Docker Deployment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Function to cleanup on exit
cleanup() {
    echo "🧹 Cleaning up..."
    docker compose down
}

# Set trap to cleanup on script exit
trap cleanup EXIT

# Build and start the services
echo "🔨 Building Docker images..."
docker compose build --no-cache

echo "🚀 Starting services..."
docker compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
echo "🏥 Checking service health..."
if docker compose ps | grep -q "healthy"; then
    echo "✅ All services are healthy!"
else
    echo "⚠️  Some services may not be fully ready yet. Check with 'docker compose ps'"
fi

echo ""
echo "🎉 CosinorLab is now running!"
echo ""
echo "📱 Frontend: http://localhost"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 API Documentation: http://localhost:8000/docs"
echo ""
echo "📋 Useful commands:"
echo "  - View logs: docker compose logs -f"
echo "  - Stop services: docker compose down"
echo "  - Restart services: docker compose restart"
echo "  - View service status: docker compose ps"
echo ""
echo "Press Ctrl+C to stop the services"

# Keep the script running and show logs
docker compose logs -f 