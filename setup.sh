#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Setting up Black-Scholes Option Pricer...${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Create a directory for configuration
mkdir -p .config

# Build the services first
echo -e "${YELLOW}Building Docker containers...${NC}"
docker-compose build

# Start the services and show logs
echo -e "${YELLOW}Starting Docker containers and showing logs...${NC}"
docker-compose up -d

# Function to wait for string in logs
wait_for_log() {
    local service=$1
    local search_string=$2
    local timeout=60
    local count=0
    
    echo -e "${YELLOW}Waiting for $service to be ready...${NC}"
    until docker-compose logs $service | grep -q "$search_string" || [ $count -eq $timeout ]; do
        sleep 1
        ((count++))
    done
    
    if [ $count -eq $timeout ]; then
        echo -e "${RED}Timeout waiting for $service to be ready${NC}"
        return 1
    fi
    return 0
}

# Wait for services to be ready
wait_for_log "backend" "Application startup complete"
wait_for_log "frontend" "Ready in"

# Get container IPs
BACKEND_CONTAINER=$(docker-compose ps -q backend)
FRONTEND_CONTAINER=$(docker-compose ps -q frontend)

BACKEND_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $BACKEND_CONTAINER)
FRONTEND_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $FRONTEND_CONTAINER)

# Save IPs to configuration file
echo "# Container IPs - Generated on $(date)" > .config/container_ips.env
echo "FRONTEND_IP=$FRONTEND_IP" >> .config/container_ips.env
echo "BACKEND_IP=$BACKEND_IP" >> .config/container_ips.env

# # Show full logs until now
# echo -e "\n${YELLOW}Container Logs:${NC}"
# docker-compose logs

echo -e "\n${GREEN}Setup completed!${NC}"
echo -e "Frontend IP: ${YELLOW}$FRONTEND_IP${NC}"
echo -e "Backend IP: ${YELLOW}$BACKEND_IP${NC}"
echo -e "\nAccess the application at:"
echo -e "Frontend: ${YELLOW}http://$FRONTEND_IP:3000${NC}"
echo -e "Backend API: ${YELLOW}http://$BACKEND_IP:8000${NC}"
echo -e "\nContainer IPs have been saved to .config/container_ips.env"
echo -e "In future we will create global variable for frontend and backend ip's\n and automatically they will be changed in application's code where needed\n right now you have to do that manually"

# Show container status
echo -e "\n${YELLOW}Container Status:${NC}"
docker-compose ps

# Optional: Show logs in real-time
echo -e "\n${YELLOW}Showing live logs (Press Ctrl+C to exit):${NC}"
docker-compose logs -f