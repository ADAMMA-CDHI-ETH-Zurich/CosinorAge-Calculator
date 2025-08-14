#!/bin/bash

set -e

echo "🚀 Starting CosinorLab Redeployment Script..."

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

# Function to install certbot if needed
install_certbot() {
    print_status "Checking certbot installation..."
    
    if command_exists "certbot"; then
        print_success "Certbot found"
    else
        print_warning "Certbot not found. Installing..."
        
        # Install certbot based on OS
        if command_exists "yum"; then
            # Amazon Linux 2 / CentOS / RHEL
            sudo yum update -y
            sudo yum install -y certbot
        elif command_exists "apt-get"; then
            # Ubuntu / Debian
            sudo apt-get update
            sudo apt-get install -y certbot
        else
            print_error "Unsupported package manager. Please install certbot manually."
            exit 1
        fi
        
        print_success "Certbot installed successfully"
    fi
}

# Function to generate SSL certificates
generate_ssl_certificates() {
    local force_regeneration=${1:-false}
    
    print_status "Handling SSL certificates..."
    
    cd /home/ec2-user/cosinorlab
    
    # Create ssl directory
    mkdir -p ssl
    
    # If force regeneration is requested, skip backup restoration AND existing certificate check
    if [ "$force_regeneration" = true ]; then
        print_status "Force regeneration requested. Skipping backup restoration and existing certificate check."
        cleanup_ssl_backup
        # Skip the existing certificate check entirely and proceed directly to generation
    else
        # First, try to restore existing certificates from backup
        if restore_ssl_certificates; then
            print_success "Using restored SSL certificates"
            return 0
        fi
        
        # If no backup or invalid certificates, check if certificates already exist and are valid
        if [ -f "ssl/cert.pem" ] && [ -f "ssl/key.pem" ]; then
            print_status "SSL certificates found. Checking validity..."
            
            # Check if certificates are still valid (not expired)
            if openssl x509 -checkend 86400 -noout -in ssl/cert.pem >/dev/null 2>&1; then
                print_success "SSL certificates are still valid"
                return 0
            else
                print_warning "SSL certificates are expired or will expire soon"
            fi
        fi
    fi
    
    # Stop any running containers to free up port 80
    print_status "Stopping containers to free up port 80..."
    $DOCKER_COMPOSE down 2>/dev/null || true
    
    # Wait a moment for port to be available
    sleep 5
    
    # Generate new certificates
    print_status "Generating new SSL certificates..."
    
    # Get email from user or use default
    EMAIL=${SSL_EMAIL:-"admin@cosinoragelab.app"}
    
    if sudo certbot certonly --standalone \
        --email "$EMAIL" \
        --agree-tos \
        --no-eff-email \
        -d cosinoragelab.app \
        -d www.cosinoragelab.app; then
        
        # Copy certificates to project directory
        print_status "Copying certificates to project directory..."
        sudo cp /etc/letsencrypt/live/cosinoragelab.app/fullchain.pem ssl/cert.pem
        sudo cp /etc/letsencrypt/live/cosinoragelab.app/privkey.pem ssl/key.pem
        
        # Set proper permissions
        sudo chown ec2-user:ec2-user ssl/cert.pem ssl/key.pem
        chmod 644 ssl/cert.pem
        chmod 600 ssl/key.pem
        
        print_success "SSL certificates generated and installed successfully"
    else
        print_error "Failed to generate SSL certificates"
        print_warning "Continuing without SSL certificates. Application will use HTTP only."
        
        # Create self-signed certificates as fallback
        print_status "Creating self-signed certificates as fallback..."
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout ssl/key.pem \
            -out ssl/cert.pem \
            -subj "/C=US/ST=State/L=City/O=CosinorLab/CN=localhost" 2>/dev/null || true
        
        if [ -f "ssl/cert.pem" ] && [ -f "ssl/key.pem" ]; then
            chmod 644 ssl/cert.pem
            chmod 600 ssl/key.pem
            print_success "Self-signed certificates created as fallback"
        fi
    fi
}

# Function to update nginx configuration for domain
update_nginx_config() {
    print_status "Updating nginx configuration for domain..."
    
    cd /home/ec2-user/cosinorlab
    
    # Backup original config
    cp frontend/nginx.conf frontend/nginx.conf.backup
    
    # Update server names in nginx config
    sed -i 's/server_name localhost;/server_name cosinoragelab.app www.cosinoragelab.app;/g' frontend/nginx.conf
    
    print_success "Nginx configuration updated for domain"
}



# Function to backup SSL certificates
backup_ssl_certificates() {
    print_status "Backing up SSL certificates..."
    
    cd /home/ec2-user
    
    if [ -d "cosinorlab/ssl" ] && [ -f "cosinorlab/ssl/cert.pem" ] && [ -f "cosinorlab/ssl/key.pem" ]; then
        print_status "SSL certificates found. Creating backup..."
        
        # Create backup directory
        mkdir -p /home/ec2-user/ssl_backup
        
        # Copy certificates to backup
        cp cosinorlab/ssl/cert.pem /home/ec2-user/ssl_backup/cert.pem
        cp cosinorlab/ssl/key.pem /home/ec2-user/ssl_backup/key.pem
        
        # Set proper permissions
        chmod 644 /home/ec2-user/ssl_backup/cert.pem
        chmod 600 /home/ec2-user/ssl_backup/key.pem
        
        print_success "SSL certificates backed up successfully"
        return 0
    else
        print_warning "No SSL certificates found to backup"
        return 1
    fi
}

# Function to restore SSL certificates
restore_ssl_certificates() {
    print_status "Restoring SSL certificates..."
    
    cd /home/ec2-user/cosinorlab
    
    if [ -f "/home/ec2-user/ssl_backup/cert.pem" ] && [ -f "/home/ec2-user/ssl_backup/key.pem" ]; then
        print_status "SSL backup found. Restoring certificates..."
        
        # Create ssl directory
        mkdir -p ssl
        
        # Copy certificates from backup
        cp /home/ec2-user/ssl_backup/cert.pem ssl/cert.pem
        cp /home/ec2-user/ssl_backup/key.pem ssl/key.pem
        
        # Set proper permissions
        chmod 644 ssl/cert.pem
        chmod 600 ssl/key.pem
        
        # Check if certificates are still valid
        if openssl x509 -checkend 86400 -noout -in ssl/cert.pem >/dev/null 2>&1; then
            print_success "SSL certificates restored and are still valid"
            return 0
        else
            print_warning "Restored SSL certificates are expired or will expire soon"
            return 1
        fi
    else
        print_warning "No SSL backup found"
        return 1
    fi
}

# Function to clean up SSL backup
cleanup_ssl_backup() {
    print_status "Cleaning up SSL backup..."
    
    if [ -d "/home/ec2-user/ssl_backup" ]; then
        rm -rf /home/ec2-user/ssl_backup
        print_success "SSL backup cleaned up"
    fi
}

# Function to completely remove cosinorage from server
remove_cosinorage() {
    print_status "Removing cosinorage from server..."
    
    cd /home/ec2-user
    
    # Backup SSL certificates before removal
    backup_ssl_certificates
    
    # Stop and remove all containers
    print_status "Stopping all containers..."
    if [ -d "cosinorlab" ]; then
        cd cosinorlab
        if [ -f "docker-compose.yml" ]; then
            $DOCKER_COMPOSE down --volumes --remove-orphans 2>/dev/null || true
        fi
        if [ -f "docker-compose.dev.yml" ]; then
            $DOCKER_COMPOSE -f docker-compose.dev.yml down --volumes --remove-orphans 2>/dev/null || true
        fi
        cd ..
    fi
    
    # Remove all Docker containers, images, and volumes related to cosinorage
    print_status "Removing Docker containers and images..."
    docker ps -a | grep -i cosinor | awk '{print $1}' | xargs -r docker rm -f 2>/dev/null || true
    docker images | grep -i cosinor | awk '{print $3}' | xargs -r docker rmi -f 2>/dev/null || true
    
    # Remove Docker volumes
    print_status "Removing Docker volumes..."
    docker volume ls | grep -i cosinor | awk '{print $2}' | xargs -r docker volume rm 2>/dev/null || true
    
    # Remove Docker networks
    print_status "Removing Docker networks..."
    docker network ls | grep -i cosinor | awk '{print $1}' | xargs -r docker network rm 2>/dev/null || true
    
    # Remove the entire cosinorlab directory
    print_status "Removing cosinorlab directory..."
    rm -rf cosinorlab 2>/dev/null || true
    
    # Clean up any dangling images and volumes
    print_status "Cleaning up dangling Docker resources..."
    docker system prune -f 2>/dev/null || true
    docker volume prune -f 2>/dev/null || true
    
    print_success "Cosinorage completely removed from server"
}

# Function to clone repository
clone_repository() {
    print_status "Cloning CosinorLab repository..."
    
    cd /home/ec2-user
    
    # Check if git is available
    if ! command_exists "git"; then
        print_warning "Git not found. Installing..."
        sudo yum update -y
        sudo yum install -y git
    fi
    
    # Clone the repository
    git clone git@github.com:jlohunecke/CosinorLab.git cosinorlab
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
    sleep 15
    
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
    sleep 20
    
    # Test frontend HTTP
    print_status "Testing frontend HTTP..."
    if curl -s http://localhost > /dev/null; then
        print_success "Frontend is accessible at http://localhost"
    else
        print_warning "Frontend HTTP not accessible yet"
    fi
    
    # Test frontend HTTPS
    print_status "Testing frontend HTTPS..."
    if curl -s -k https://localhost > /dev/null; then
        print_success "Frontend is accessible at https://localhost"
    else
        print_warning "Frontend HTTPS not accessible yet"
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
    print_success "Your application should be accessible at:"
    print_success "  HTTP: http://$PUBLIC_IP"
    print_success "  HTTPS: https://$PUBLIC_IP"
    print_success "  Domain: https://www.cosinoragelab.app"
}

# Function to show final status
show_final_status() {
    print_status "Final deployment status:"
    echo ""
    echo "📋 Container Status:"
    $DOCKER_COMPOSE ps
    echo ""
    echo "🌐 Access URLs:"
    echo "   Frontend HTTP: http://localhost"
    echo "   Frontend HTTPS: https://localhost"
    echo "   Backend API: http://localhost:8000"
    echo "   External HTTP: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
    echo "   External HTTPS: https://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
    echo "   Domain: https://www.cosinoragelab.app"
    echo ""
    echo "🔒 SSL Certificate Status:"
    if [ -f "ssl/cert.pem" ]; then
        echo "   Certificate: ✅ Installed"
        echo "   Expires: $(openssl x509 -enddate -noout -in ssl/cert.pem | cut -d= -f2)"
    else
        echo "   Certificate: ❌ Not installed"
    fi
    echo ""
    echo " Useful Commands:"
    echo "   Check status: $DOCKER_COMPOSE ps"
    echo "   View logs: $DOCKER_COMPOSE logs"
    echo "   Stop services: $DOCKER_COMPOSE down"
    echo "   Restart services: $DOCKER_COMPOSE restart"
    echo ""
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --remove-only    Only remove cosinorage without redeploying"
    echo "  --clone-only     Only clone the repository without deploying"
    echo "  --deploy-only    Only deploy (assumes repo is already cloned)"
    echo "  --no-ssl         Skip SSL certificate generation"
    echo "  --force-ssl      Force regeneration of SSL certificates (ignore backup)"
    echo "  --ssl-email EMAIL Set email for SSL certificate notifications"
    echo "  --help           Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  SSL_EMAIL        Email address for SSL certificate notifications"
    echo ""
    echo "SSL Certificate Strategy:"
    echo "  - SSL certificates are automatically backed up before removal"
    echo "  - On redeployment, existing valid certificates are restored from backup"
    echo "  - New certificates are only generated if backup is missing or invalid"
    echo "  - Use --force-ssl to always generate new certificates"
    echo ""
    echo "Default behavior: Remove cosinorage, clone repo, restore/generate SSL, and deploy"
}

# Main deployment function
main() {
    local REMOVE_ONLY=false
    local CLONE_ONLY=false
    local DEPLOY_ONLY=false
    local NO_SSL=false
    local FORCE_SSL=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --remove-only)
                REMOVE_ONLY=true
                shift
                ;;
            --clone-only)
                CLONE_ONLY=true
                shift
                ;;
            --deploy-only)
                DEPLOY_ONLY=true
                shift
                ;;
            --no-ssl)
                NO_SSL=true
                shift
                ;;
            --force-ssl)
                FORCE_SSL=true
                shift
                ;;
            --ssl-email)
                SSL_EMAIL="$2"
                shift 2
                ;;
            --help)
                show_usage
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    print_status "Starting CosinorLab redeployment process..."
    
    # Check if running as ec2-user
    if [ "$(whoami)" != "ec2-user" ]; then
        print_error "This script should be run as ec2-user"
        exit 1
    fi
    
    # Install Docker Compose
    install_docker_compose
    
    if [ "$REMOVE_ONLY" = true ]; then
        print_status "Remove-only mode selected"
        remove_cosinorage
        print_success " Cosinorage removal completed!"
        exit 0
    fi
    
    if [ "$CLONE_ONLY" = true ]; then
        print_status "Clone-only mode selected"
        remove_cosinorage
        clone_repository
        fix_deployment_script
        print_success "🎉 Repository cloned successfully!"
        exit 0
    fi
    
    if [ "$DEPLOY_ONLY" = true ]; then
        print_status "Deploy-only mode selected"
        if [ ! -d "/home/ec2-user/cosinorlab" ]; then
            print_error "Repository not found. Please clone first or run without --deploy-only"
            exit 1
        fi
        cd /home/ec2-user/cosinorlab
        
        # Handle SSL if not skipped
        if [ "$NO_SSL" = false ]; then
            install_certbot
            generate_ssl_certificates "$FORCE_SSL"
            update_nginx_config
        fi
        
        deploy_application
        check_deployment
        test_application
        show_final_status
        cleanup_ssl_backup
        print_success "🎉 CosinorLab deployment completed successfully!"
        exit 0
    fi
    
    # Full redeployment (default behavior)
    print_status "Full redeployment mode selected"
    
    # Remove cosinorage
    remove_cosinorage
    
    # Clone repository
    clone_repository
    
    # Fix deployment script
    fix_deployment_script
    
    # Handle SSL if not skipped
    if [ "$NO_SSL" = false ]; then
        install_certbot
        generate_ssl_certificates "$FORCE_SSL"
        update_nginx_config
    fi
    
    # Deploy application
    deploy_application
    
    # Check deployment status
    check_deployment
    
    # Test application
    test_application
    
    # Show final status
    show_final_status
    
    # Clean up SSL backup after successful deployment
    cleanup_ssl_backup
    
    print_success "🎉 CosinorLab redeployment completed successfully!"
}

# Run main function
main "$@"