# Deploying CosinorLab to Render

This guide will walk you through deploying your CosinorLab application to Render.

## Prerequisites

1. **GitHub Repository**: Your code should be pushed to a GitHub repository
2. **Render Account**: Sign up at [render.com](https://render.com)

## Step-by-Step Deployment

### 1. Prepare Your Repository

Make sure your repository contains:
- `render.yaml` - Render configuration file
- `requirements.txt` - Python dependencies
- `cosinorage-0.1.4.tar.gz` - cosinorage package
- `frontend/` - React frontend
- `backend/` - FastAPI backend

### 2. Connect to Render

1. Go to [render.com](https://render.com) and sign in
2. Click "New +" and select "Blueprint"
3. Connect your GitHub repository
4. Render will automatically detect the `render.yaml` file

### 3. Configure Services

The `render.yaml` file will create two services:

#### Backend Service (`cosinorlab-backend`)
- **Type**: Web Service
- **Environment**: Python
- **Build Command**: 
  ```bash
  pip install -r requirements.txt
  pip install cosinorage-0.1.4.tar.gz
  ```
- **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
- **Health Check**: `/health`

#### Frontend Service (`cosinorlab-frontend`)
- **Type**: Static Site
- **Build Command**: 
  ```bash
  cd frontend
  npm install
  npm run build
  ```
- **Publish Directory**: `frontend/build`
- **Environment Variable**: `REACT_APP_API_URL` set to your backend URL

### 4. Deploy

1. Click "Apply" to start the deployment
2. Render will build and deploy both services
3. Monitor the build logs for any errors

### 5. Get Your URLs

After successful deployment, you'll get:
- **Backend URL**: `https://cosinorlab-backend.onrender.com`
- **Frontend URL**: `https://cosinorlab-frontend.onrender.com`

## Environment Variables

### Backend Environment Variables
- `PYTHONPATH`: `/opt/render/project/src` (set automatically)
- `PORT`: `8000` (set automatically by Render)

### Frontend Environment Variables
- `REACT_APP_API_URL`: `https://cosinorlab-backend.onrender.com` (set automatically)

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check that all dependencies are in `requirements.txt`
   - Ensure `cosinorage-0.1.4.tar.gz` is in the repository
   - Verify Python version compatibility

2. **Frontend Can't Connect to Backend**
   - Check that `REACT_APP_API_URL` is set correctly
   - Verify the backend service is running
   - Check CORS configuration in backend

3. **Health Check Failures**
   - Ensure the `/health` endpoint exists in your backend
   - Check that the backend starts successfully

### Debug Commands

```bash
# Check backend health
curl https://cosinorlab-backend.onrender.com/health

# Check frontend build
cd frontend && npm run build

# Test locally before deploying
uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

## Manual Deployment (Alternative)

If you prefer to deploy services manually:

### Backend Service
1. Create a new "Web Service"
2. Connect your GitHub repository
3. Set build command: `pip install -r requirements.txt && pip install cosinorage-0.1.4.tar.gz`
4. Set start command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
5. Set health check path: `/health`

### Frontend Service
1. Create a new "Static Site"
2. Connect your GitHub repository
3. Set build command: `cd frontend && npm install && npm run build`
4. Set publish directory: `frontend/build`
5. Add environment variable: `REACT_APP_API_URL` = your backend URL

## Cost

- **Static Sites**: Free tier available
- **Web Services**: $7/month per service (free tier discontinued)

## Next Steps

After deployment:
1. Test all functionality
2. Set up custom domain (optional)
3. Configure monitoring and alerts
4. Set up automatic deployments

## Support

- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com)
- Check build logs for specific error messages 