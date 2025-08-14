#!/bin/bash

set -e

echo "🚀 Starting CosinorLab Deployment Script..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install Docker Compose if needed
install_docker_compose() {
    print_status "Checking Docker Compose installation..."
    
    if command_exists "/usr/local/bin/docker-compose"; then
        print_success "Docker Compose found at /usr/local/bin/docker-compose"
        DOCKER_COMPOSE="/usr/local/bin/docker-compose"
    elif command_exists "docker-compose"; then
        print_success "Docker Compose found in PATH"
        DOCKER_COMPOSE="docker-compose"
    else
        print_warning "Docker Compose not found. Installing..."
        
        # Remove any existing pip version
        sudo pip3 uninstall -y docker-compose 2>/dev/null || true
        
        # Install manually
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
        
        DOCKER_COMPOSE="/usr/local/bin/docker-compose"
        print_success "Docker Compose installed successfully"
    fi
}

# Function to clean up existing deployment
cleanup_existing() {
    print_status "Cleaning up existing deployment..."
    
    cd /home/ec2-user
    
    # Stop and remove existing containers
    if [ -d "cosinorlab" ]; then
        cd cosinorlab
        if [ -f "docker-compose.yml" ]; then
            $DOCKER_COMPOSE down 2>/dev/null || true
        fi
        cd ..
        rm -rf cosinorlab
        print_success "Removed existing cosinorlab directory"
    fi
}

# Function to clone repository
clone_repository() {
    print_status "Cloning CosinorLab repository..."
    
    cd /home/ec2-user
    git clone https://github.com/jlohunecke/CosinorLab.git cosinorlab
    cd cosinorlab
    
    print_success "Repository cloned successfully"
}

# Function to fix deployment script
fix_deployment_script() {
    print_status "Fixing deployment script..."
    
    # Fix the script to use the correct Docker Compose path
    sed -i "s|docker compose|$DOCKER_COMPOSE|g" cosinorage-calculator.sh
    chmod +x cosinorage-calculator.sh
    
    print_success "Deployment script fixed"
}

# Function to deploy application
deploy_application() {
    print_status "Deploying CosinorLab application..."
    
    # Build images
    print_status "Building Docker images..."
    $DOCKER_COMPOSE build --no-cache
    
    # Start services
    print_status "Starting services..."
    $DOCKER_COMPOSE up -d
    
    print_success "Application deployed successfully"
}

# Function to check deployment status
check_deployment() {
    print_status "Checking deployment status..."
    
    # Wait a moment for containers to start
    sleep 10
    
    # Check container status
    print_status "Container status:"
    $DOCKER_COMPOSE ps
    
    # Check if containers are running
    if $DOCKER_COMPOSE ps | grep -q "Up"; then
        print_success "Containers are running"
    else
        print_error "Some containers failed to start"
        print_status "Checking logs..."
        $DOCKER_COMPOSE logs
        return 1
    fi
}

# Function to test application
test_application() {
    print_status "Testing application..."
    
    # Wait for application to be ready
    sleep 15
    
    # Test frontend
    print_status "Testing frontend..."
    if curl -s http://localhost > /dev/null; then
        print_success "Frontend is accessible at http://localhost"
    else
        print_warning "Frontend not accessible yet"
    fi
    
    # Test backend
    print_status "Testing backend..."
    if curl -s http://localhost:8000/health > /dev/null; then
        print_success "Backend is accessible at http://localhost:8000"
    else
        print_warning "Backend not accessible yet"
    fi
    
    # Get public IP
    PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
    print_success "Your application should be accessible at: http://$PUBLIC_IP"
}

# Function to show final status
show_final_status() {
    print_status "Final deployment status:"
    echo ""
    echo "📋 Container Status:"
    $DOCKER_COMPOSE ps
    echo ""
    echo "🌐 Access URLs:"
    echo "   Frontend: http://localhost"
    echo "   Backend API: http://localhost:8000"
    echo "   External: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
    echo ""
    echo "📝 Useful Commands:"
    echo "   Check status: $DOCKER_COMPOSE ps"
    echo "   View logs: $DOCKER_COMPOSE logs"
    echo "   Stop services: $DOCKER_COMPOSE down"
    echo "   Restart services: $DOCKER_COMPOSE restart"
    echo ""
}

# Main deployment function
main() {
    print_status "Starting CosinorLab deployment process..."
    
    # Check if running as ec2-user
    if [ "$(whoami)" != "ec2-user" ]; then
        print_error "This script should be run as ec2-user"
        exit 1
    fi
    
    # Install Docker Compose
    install_docker_compose
    
    # Clean up existing deployment
    cleanup_existing
    
    # Clone repository
    clone_repository
    
    # Fix deployment script
    fix_deployment_script
    
    # Deploy application
    deploy_application
    
    # Check deployment status
    check_deployment
    
    # Test application
    test_application
    
    # Show final status
    show_final_status
    
    print_success "🎉 CosinorLab deployment completed successfully!"
}

# Run main function
main "$@" 