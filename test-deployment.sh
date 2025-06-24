#!/bin/bash

# Test script for CosinorLab Docker deployment
# This script tests the health and functionality of the deployed services

set -e

echo "🧪 Testing CosinorLab Docker Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        exit 1
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Test 1: Check if containers are running
echo "📋 Test 1: Checking container status..."
if docker compose ps | grep -q "Up"; then
    print_status 0 "Containers are running"
else
    print_status 1 "Containers are not running"
fi

# Test 2: Check backend health
echo "🔧 Test 2: Testing backend health..."
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    print_status 0 "Backend health check passed"
else
    print_status 1 "Backend health check failed"
fi

# Test 3: Check frontend health
echo "📱 Test 3: Testing frontend health..."
if curl -f http://localhost/health > /dev/null 2>&1; then
    print_status 0 "Frontend health check passed"
else
    print_status 1 "Frontend health check failed"
fi

# Test 4: Check API documentation
echo "📚 Test 4: Testing API documentation..."
if curl -f http://localhost:8000/docs > /dev/null 2>&1; then
    print_status 0 "API documentation is accessible"
else
    print_status 1 "API documentation is not accessible"
fi

# Test 5: Check frontend loads
echo "🌐 Test 5: Testing frontend page load..."
if curl -f http://localhost/ > /dev/null 2>&1; then
    print_status 0 "Frontend page loads successfully"
else
    print_status 1 "Frontend page does not load"
fi

# Test 6: Check API proxy
echo "🔗 Test 6: Testing API proxy..."
if curl -f http://localhost/api/health > /dev/null 2>&1; then
    print_status 0 "API proxy is working"
else
    print_status 1 "API proxy is not working"
fi

# Test 7: Check container logs for errors
echo "📝 Test 7: Checking container logs for errors..."
BACKEND_ERRORS=$(docker compose logs backend 2>&1 | grep -i "error\|exception\|traceback" | wc -l)
FRONTEND_ERRORS=$(docker compose logs frontend 2>&1 | grep -i "error\|exception\|failed" | wc -l)

if [ $BACKEND_ERRORS -eq 0 ]; then
    print_status 0 "No errors found in backend logs"
else
    print_warning "Found $BACKEND_ERRORS potential errors in backend logs"
fi

if [ $FRONTEND_ERRORS -eq 0 ]; then
    print_status 0 "No errors found in frontend logs"
else
    print_warning "Found $FRONTEND_ERRORS potential errors in frontend logs"
fi

# Test 8: Check resource usage
echo "💾 Test 8: Checking resource usage..."
BACKEND_MEMORY=$(docker stats --no-stream --format "table {{.MemUsage}}" cosinorlab-backend | tail -1 | awk '{print $1}')
FRONTEND_MEMORY=$(docker stats --no-stream --format "table {{.MemUsage}}" cosinorlab-frontend | tail -1 | awk '{print $1}')

echo "Backend memory usage: $BACKEND_MEMORY"
echo "Frontend memory usage: $FRONTEND_MEMORY"

# Test 9: Check network connectivity
echo "🌐 Test 9: Testing inter-container communication..."
if docker exec cosinorlab-frontend wget -q --spider http://backend:8000/health; then
    print_status 0 "Inter-container communication is working"
else
    print_status 1 "Inter-container communication failed"
fi

# Test 10: Check file upload endpoint (basic test)
echo "📤 Test 10: Testing file upload endpoint..."
UPLOAD_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:8000/upload)
if [ "$UPLOAD_RESPONSE" = "422" ] || [ "$UPLOAD_RESPONSE" = "400" ]; then
    print_status 0 "File upload endpoint is responding (expected error for missing file)"
else
    print_warning "File upload endpoint returned unexpected status: $UPLOAD_RESPONSE"
fi

echo ""
echo "🎉 All tests completed!"
echo ""
echo "📊 Summary:"
echo "  - Frontend: http://localhost"
echo "  - Backend API: http://localhost:8000"
echo "  - API Documentation: http://localhost:8000/docs"
echo ""
echo "📋 Useful commands:"
echo "  - View logs: docker compose logs -f"
echo "  - Stop services: docker compose down"
echo "  - Restart services: docker compose restart"
echo "  - Check status: docker compose ps" 