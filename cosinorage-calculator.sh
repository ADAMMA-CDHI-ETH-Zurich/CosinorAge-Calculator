#!/bin/bash

set -e

# Use "docker compose" (plugin) if available, else "docker-compose" (standalone)
if docker compose version &>/dev/null; then
  DOCKER_COMPOSE="docker compose"
else
  DOCKER_COMPOSE="docker-compose"
fi

usage() {
  echo "Usage: $0 {deploy-prod|deploy-dev|deploy-web|restart-prod|restart-dev|stop|status|open}"
  exit 1
}

case "$1" in
  deploy-prod)
    echo "🚀 Deploying production environment..."
    $DOCKER_COMPOSE down
    $DOCKER_COMPOSE build --no-cache
    $DOCKER_COMPOSE up -d
    echo "✅ Production environment deployed!"
    echo "📱 Frontend: http://localhost"
    echo "🔧 Backend API: http://localhost:8000"
    ;;
  deploy-dev)
    echo "🚀 Deploying development environment..."
    $DOCKER_COMPOSE -f docker-compose.dev.yml down
    $DOCKER_COMPOSE -f docker-compose.dev.yml build --no-cache
    $DOCKER_COMPOSE -f docker-compose.dev.yml up -d
    echo "✅ Development environment deployed!"
    echo "📱 Frontend: http://localhost (with hot reloading)"
    echo "🔧 Backend API: http://localhost:8000 (with auto-reload)"
    ;;
  deploy-web)
    echo "🚀 Deploying web environment using docker-compose..."
    $DOCKER_COMPOSE down
    $DOCKER_COMPOSE build --no-cache
    $DOCKER_COMPOSE up -d
    echo "✅ Web environment deployed!"
    ;;
  restart-prod)
    echo "🔄 Restarting production containers..."
    $DOCKER_COMPOSE restart
    echo "✅ Production containers restarted!"
    echo "🌐 Opening frontend in browser..."
    open http://localhost
    ;;
  restart-dev)
    echo "🔄 Restarting development containers..."
    $DOCKER_COMPOSE -f docker-compose.dev.yml restart
    echo "✅ Development containers restarted!"
    echo "🌐 Opening frontend in browser..."
    open http://localhost
    ;;
  stop)
    echo "🛑 Stopping all containers..."
    $DOCKER_COMPOSE down
    $DOCKER_COMPOSE -f docker-compose.dev.yml down
    echo "✅ All containers stopped!"
    ;;
  status)
    echo "📋 Production status:"
    $DOCKER_COMPOSE ps
    echo ""
    echo "📋 Development status:"
    $DOCKER_COMPOSE -f docker-compose.dev.yml ps
    ;;
  open)
    echo "🌐 Opening frontend in browser..."
    open http://localhost
    ;;
  *)
    usage
    ;;
esac 