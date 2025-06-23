#!/bin/bash

# CosinorLab Render Deployment Helper
echo "🚀 Preparing CosinorLab for Render Deployment"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "render.yaml" ]; then
    echo "❌ Error: render.yaml not found. Please run this script from the project root."
    exit 1
fi

echo "✅ Found render.yaml configuration"

# Test frontend build
echo "📦 Testing frontend build..."
cd frontend
if npm run build; then
    echo "✅ Frontend builds successfully"
else
    echo "❌ Frontend build failed"
    exit 1
fi
cd ..

# Test backend imports
echo "🐍 Testing backend imports..."
if python -c "from backend.main import app; print('✅ Backend imports successfully')"; then
    echo "✅ Backend imports successfully"
else
    echo "❌ Backend import failed"
    exit 1
fi

# Check required files
echo "📋 Checking required files..."
required_files=("requirements.txt" "cosinorage-0.1.4.tar.gz" "frontend/package.json" "backend/main.py")
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ Found $file"
    else
        echo "❌ Missing $file"
        exit 1
    fi
done

echo ""
echo "🎉 Your project is ready for Render deployment!"
echo ""
echo "Next steps:"
echo "1. Push your code to GitHub"
echo "2. Go to https://render.com"
echo "3. Create a new Blueprint"
echo "4. Connect your GitHub repository"
echo "5. Render will automatically detect render.yaml"
echo "6. Click 'Apply' to deploy"
echo ""
echo "Your services will be deployed as:"
echo "- Backend: https://cosinorlab-backend.onrender.com"
echo "- Frontend: https://cosinorlab-frontend.onrender.com"
echo ""
echo "For detailed instructions, see RENDER_DEPLOYMENT.md" 