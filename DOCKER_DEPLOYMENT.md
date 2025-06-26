# CosinorLab Docker Deployment Guide

This guide explains how to deploy CosinorLab using Docker containers. The application is split into two containers:
- **Backend**: FastAPI service running on port 8000
- **Frontend**: React app served by Nginx on port 80

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)
- At least 4GB of available RAM
- At least 10GB of available disk space

## Quick Start

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd CosinorLab
   ```

2. **Run the deployment script**:
   ```bash
   ./deploy.sh
   ```

   This script will:
   - Build both Docker images
   - Start the services
   - Check service health
   - Display access URLs

3. **Access the application**:
   - Frontend: http://localhost
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## Manual Deployment

If you prefer to run commands manually:

### Build and Start Services
```bash
# Build the images
docker-compose build

# Start services in background
docker-compose up -d

# View logs
docker-compose logs -f
```

### Stop Services
```bash
docker-compose down
```

### Restart Services
```bash
docker-compose restart
```

## Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │
│   (Nginx)       │◄──►│   (FastAPI)     │
│   Port 80       │    │   Port 8000     │
└─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
   ┌─────────────────────────────────────┐
   │         Docker Network              │
   └─────────────────────────────────────┘
```

### Container Details

#### Frontend Container
- **Base Image**: Node.js 18 Alpine (build) → Nginx Alpine (production)
- **Port**: 80
- **Features**:
  - Serves React app
  - Proxies API calls to backend
  - Handles static file caching
  - Rate limiting
  - Security headers

#### Backend Container
- **Base Image**: Python 3.10 Slim
- **Port**: 8000
- **Features**:
  - FastAPI application
  - File processing and analysis
  - Health check endpoint
  - Persistent volume for extracted files

## Configuration

### Environment Variables

You can customize the deployment by setting environment variables:

```bash
# Frontend API URL (default: /api)
export REACT_APP_API_URL=http://your-backend-url

# Backend settings
export PYTHONUNBUFFERED=1
```

### Port Configuration

To change the exposed ports, modify `docker-compose.yml`:

```yaml
services:
  frontend:
    ports:
      - "8080:80"  # Change 8080 to your desired port
  backend:
    ports:
      - "8001:8000"  # Change 8001 to your desired port
```

### Volume Configuration

The backend uses a persistent volume for extracted files:

```yaml
volumes:
  backend_data:
    driver: local
```

To use a different storage location:
```yaml
volumes:
  backend_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /path/to/your/storage
```

## Production Deployment

For production deployment, consider the following:

### 1. Environment-Specific Configuration
Create environment-specific docker-compose files:

```bash
# Development
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
```

### 2. Reverse Proxy
Use a reverse proxy (like Traefik or Nginx) for SSL termination and load balancing:

```yaml
# docker-compose.prod.yml
services:
  frontend:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.frontend.rule=Host(`your-domain.com`)"
      - "traefik.http.routers.frontend.tls.certresolver=letsencrypt"
```

### 3. Database Integration
For production, consider adding a database:

```yaml
services:
  database:
    image: postgres:13
    environment:
      POSTGRES_DB: cosinorlab
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

### 4. Monitoring
Add monitoring services:

```yaml
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
  
  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
```

## Troubleshooting

### Common Issues

1. **Port already in use**:
   ```bash
   # Check what's using the port
   lsof -i :80
   lsof -i :8000
   
   # Change ports in docker-compose.yml
   ```

2. **Container won't start**:
   ```bash
   # Check logs
   docker-compose logs backend
   docker-compose logs frontend
   
   # Check container status
   docker-compose ps
   ```

3. **Memory issues**:
   ```bash
   # Increase Docker memory limit
   # In Docker Desktop: Settings → Resources → Memory
   ```

4. **Build failures**:
   ```bash
   # Clean build
   docker-compose build --no-cache
   
   # Remove old images
   docker system prune -a
   ```

### Health Checks

Monitor service health:

```bash
# Check health status
docker-compose ps

# Manual health check
curl http://localhost/health
curl http://localhost:8000/health
```

### Logs

View logs for debugging:

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Last 100 lines
docker-compose logs --tail=100 backend
```

## Security Considerations

1. **Network Security**: Services communicate over a private Docker network
2. **File Upload Limits**: Configured to handle up to 2GB files
3. **Rate Limiting**: API endpoints have rate limiting enabled
4. **Security Headers**: Nginx adds security headers to responses
5. **Container Isolation**: Each service runs in its own container

## Performance Optimization

1. **Caching**: Static assets are cached for 1 year
2. **Compression**: Gzip compression enabled for text-based files
3. **Multi-stage Build**: Frontend uses multi-stage build for smaller image
4. **Health Checks**: Automatic health monitoring and restart

## Backup and Recovery

### Backup Data
```bash
# Backup extracted files
docker run --rm -v cosinorlab_backend_data:/data -v $(pwd):/backup alpine tar czf /backup/backend_data_backup.tar.gz -C /data .
```

### Restore Data
```bash
# Restore extracted files
docker run --rm -v cosinorlab_backend_data:/data -v $(pwd):/backup alpine tar xzf /backup/backend_data_backup.tar.gz -C /data
```

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the logs: `docker-compose logs`
3. Check service health: `docker-compose ps`
4. Create an issue in the repository

## License

This deployment configuration is part of the CosinorLab project and follows the same license terms. 