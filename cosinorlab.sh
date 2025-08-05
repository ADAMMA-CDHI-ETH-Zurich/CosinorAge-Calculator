#!/bin/bash

set -e

usage() {
  echo "Usage: $0 {deploy-prod|deploy-dev|deploy-web|restart-prod|restart-dev|stop|status|open}"
  exit 1
}

case "$1" in
  deploy-prod)
    echo "🚀 Deploying production environment..."
    docker compose down
    docker compose build --no-cache
    docker compose up -d
    echo "✅ Production environment deployed!"
    echo "📱 Frontend: http://localhost"
    echo "🔧 Backend API: http://localhost:8000"
    ;;
  deploy-dev)
    echo "🚀 Deploying development environment..."
    docker compose -f docker-compose.dev.yml down
    docker compose -f docker-compose.dev.yml build --no-cache
    docker compose -f docker-compose.dev.yml up -d
    echo "✅ Development environment deployed!"
    echo "📱 Frontend: http://localhost (with hot reloading)"
    echo "🔧 Backend API: http://localhost:8000 (with auto-reload)"
    ;;
  deploy-web)
    echo "🚀 Deploying web environment using docker-compose..."
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    echo "✅ Web environment deployed!"
    ;;
  restart-prod)
    echo "🔄 Restarting production containers..."
    docker compose restart
    echo "✅ Production containers restarted!"
    echo "🌐 Opening frontend in browser..."
    open http://localhost
    ;;
  restart-dev)
    echo "🔄 Restarting development containers..."
    docker compose -f docker-compose.dev.yml restart
    echo "✅ Development containers restarted!"
    echo "🌐 Opening frontend in browser..."
    open http://localhost
    ;;
  stop)
    echo "🛑 Stopping all containers..."
    docker compose down
    docker compose -f docker-compose.dev.yml down
    echo "✅ All containers stopped!"
    ;;
  status)
    echo "📋 Production status:"
    docker compose ps
    echo ""
    echo "📋 Development status:"
    docker compose -f docker-compose.dev.yml ps
    ;;
  open)
    echo "🌐 Opening frontend in browser..."
    open http://localhost
    ;;
  *)
    usage
    ;;
esac 