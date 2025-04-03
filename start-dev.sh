#!/bin/bash

# =====================================================
# start-dev.sh - Development Environment Launcher
# =====================================================
# This script starts both the frontend and backend services
# in development mode, displays their status, and handles
# graceful shutdown when the user presses Ctrl+C.
# =====================================================

# ANSI color codes for prettier output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Backend and frontend ports
BACKEND_PORT=3000
FRONTEND_PORT=5173

# Parse command line arguments
KILL_EXISTING=false
ALTERNATIVE_PORTS=false

while [[ "$#" -gt 0 ]]; do
    case $1 in
        -k|--kill) KILL_EXISTING=true ;;
        -a|--alternative-ports) ALTERNATIVE_PORTS=true ;;
        -h|--help)
            echo "Usage: $0 [options]"
            echo "Options:"
            echo "  -k, --kill                Kill existing processes using the required ports"
            echo "  -a, --alternative-ports   Use alternative ports if the default ones are in use"
            echo "  -h, --help                Show this help message"
            exit 0
            ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

# Function to display a formatted message
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to display a section header
print_header() {
    local message=$1
    echo -e "\n${BLUE}=== ${message} ===${NC}"
}

# Function to check if a port is in use
is_port_in_use() {
    local port=$1
    if command -v lsof >/dev/null 2>&1; then
        lsof -i :$port >/dev/null 2>&1
        return $?
    elif command -v netstat >/dev/null 2>&1; then
        netstat -tuln | grep -q ":$port "
        return $?
    else
        # If neither lsof nor netstat is available, assume port is free
        return 1
    fi
}

# Function to kill process using a specific port
kill_process_on_port() {
    local port=$1
    local pid
    
    if command -v lsof >/dev/null 2>&1; then
        pid=$(lsof -t -i :$port)
    elif command -v netstat >/dev/null 2>&1 && command -v grep >/dev/null 2>&1 && command -v awk >/dev/null 2>&1; then
        pid=$(netstat -tuln | grep ":$port " | awk '{print $7}' | cut -d'/' -f1)
    else
        print_message "$RED" "Cannot find process using port $port. Missing required tools (lsof or netstat)."
        return 1
    fi
    
    if [[ -n $pid ]]; then
        print_message "$YELLOW" "Killing process $pid using port $port..."
        kill -15 $pid 2>/dev/null || kill -9 $pid 2>/dev/null
        sleep 1
        if is_port_in_use $port; then
            print_message "$RED" "Failed to kill process using port $port"
            return 1
        else
            print_message "$GREEN" "Successfully killed process using port $port"
            return 0
        fi
    else
        print_message "$RED" "No process found using port $port"
        return 1
    fi
}

# Function to find an available port starting from the given port
find_available_port() {
    local port=$1
    local max_attempts=10
    local attempts=0
    
    while is_port_in_use $port && [[ $attempts -lt $max_attempts ]]; do
        port=$((port + 1))
        attempts=$((attempts + 1))
    done
    
    if [[ $attempts -lt $max_attempts ]]; then
        echo $port
    else
        echo ""
    fi
}

# Function to handle script exit and cleanup
cleanup() {
    print_header "Shutting down services"
    
    # Kill the backend process if it's running
    if [[ -n $BACKEND_PID ]] && kill -0 $BACKEND_PID 2>/dev/null; then
        print_message "$YELLOW" "Stopping backend service (PID: $BACKEND_PID)..."
        kill -TERM $BACKEND_PID
        wait $BACKEND_PID 2>/dev/null
        print_message "$GREEN" "Backend service stopped successfully"
    fi
    
    # Kill the frontend process if it's running
    if [[ -n $FRONTEND_PID ]] && kill -0 $FRONTEND_PID 2>/dev/null; then
        print_message "$YELLOW" "Stopping frontend service (PID: $FRONTEND_PID)..."
        kill -TERM $FRONTEND_PID
        wait $FRONTEND_PID 2>/dev/null
        print_message "$GREEN" "Frontend service stopped successfully"
    fi
    
    print_message "$PURPLE" "All services have been stopped. Goodbye!"
    exit 0
}

# Register the cleanup function to be called on script exit
trap cleanup EXIT INT TERM

# Display welcome message
print_header "Starting Development Environment"
print_message "$CYAN" "Starting backend and frontend services..."

# Handle backend port
if is_port_in_use $BACKEND_PORT; then
    if [[ $KILL_EXISTING == true ]]; then
        print_message "$YELLOW" "Port $BACKEND_PORT is in use. Attempting to kill the process..."
        if ! kill_process_on_port $BACKEND_PORT; then
            print_message "$RED" "Failed to kill process using port $BACKEND_PORT. Exiting."
            exit 1
        fi
    elif [[ $ALTERNATIVE_PORTS == true ]]; then
        NEW_BACKEND_PORT=$(find_available_port $((BACKEND_PORT + 1)))
        if [[ -n $NEW_BACKEND_PORT ]]; then
            print_message "$YELLOW" "Port $BACKEND_PORT is in use. Using alternative port: $NEW_BACKEND_PORT"
            BACKEND_PORT=$NEW_BACKEND_PORT
            # Note: This doesn't actually change the port in the backend config
            # You would need to modify the backend code or pass the port as an env variable
            print_message "$RED" "Warning: Using alternative port requires backend configuration changes."
            print_message "$RED" "This script doesn't modify the backend configuration."
            exit 1
        else
            print_message "$RED" "Could not find an available port for the backend service. Exiting."
            exit 1
        fi
    else
        print_message "$RED" "Error: Port $BACKEND_PORT is already in use. Backend service cannot start."
        print_message "$YELLOW" "Options:"
        print_message "$YELLOW" "  - Use -k or --kill to kill the process using this port"
        print_message "$YELLOW" "  - Use -a or --alternative-ports to use an alternative port"
        print_message "$YELLOW" "  - Manually stop the process using this port and try again"
        exit 1
    fi
fi

# Handle frontend port
if is_port_in_use $FRONTEND_PORT; then
    if [[ $KILL_EXISTING == true ]]; then
        print_message "$YELLOW" "Port $FRONTEND_PORT is in use. Attempting to kill the process..."
        if ! kill_process_on_port $FRONTEND_PORT; then
            print_message "$RED" "Failed to kill process using port $FRONTEND_PORT. Exiting."
            exit 1
        fi
    elif [[ $ALTERNATIVE_PORTS == true ]]; then
        NEW_FRONTEND_PORT=$(find_available_port $((FRONTEND_PORT + 1)))
        if [[ -n $NEW_FRONTEND_PORT ]]; then
            print_message "$YELLOW" "Port $FRONTEND_PORT is in use. Using alternative port: $NEW_FRONTEND_PORT"
            FRONTEND_PORT=$NEW_FRONTEND_PORT
            # Note: Vite can accept a different port via --port flag
        else
            print_message "$RED" "Could not find an available port for the frontend service. Exiting."
            exit 1
        fi
    else
        print_message "$RED" "Error: Port $FRONTEND_PORT is already in use. Frontend service cannot start."
        print_message "$YELLOW" "Options:"
        print_message "$YELLOW" "  - Use -k or --kill to kill the process using this port"
        print_message "$YELLOW" "  - Use -a or --alternative-ports to use an alternative port"
        print_message "$YELLOW" "  - Manually stop the process using this port and try again"
        exit 1
    fi
fi

# Start the backend service
print_message "$YELLOW" "Starting backend service..."
# Check if .env file exists in backend directory
if [[ ! -f backend/.env ]]; then
    print_message "$YELLOW" "No .env file found in backend directory. Creating one..."
    # Run the create-env.sh script to create the .env file
    ./create-env.sh
fi

# Start the backend with environment variables
(cd backend && PORT=$BACKEND_PORT npm run dev) &
BACKEND_PID=$!

# Check if backend started successfully
if [[ -n $BACKEND_PID ]] && kill -0 $BACKEND_PID 2>/dev/null; then
    print_message "$GREEN" "Backend service started successfully (PID: $BACKEND_PID)"
else
    print_message "$RED" "Failed to start backend service"
    exit 1
fi

# Check if frontend environment file exists
if [[ ! -f frontend/public/env.js ]]; then
    print_message "$YELLOW" "No env.js file found in frontend directory. Creating one..."
    # Run the create-frontend-env.sh script to create the env.js file
    ./create-frontend-env.sh
fi

# Start the frontend service
print_message "$YELLOW" "Starting frontend service..."
if [[ $FRONTEND_PORT != 5173 && $ALTERNATIVE_PORTS == true ]]; then
    # If using an alternative port for frontend, pass it to Vite
    (cd frontend && npm run dev -- --port $FRONTEND_PORT) &
else
    (cd frontend && npm run dev) &
fi
FRONTEND_PID=$!

# Check if frontend started successfully
if [[ -n $FRONTEND_PID ]] && kill -0 $FRONTEND_PID 2>/dev/null; then
    print_message "$GREEN" "Frontend service started successfully (PID: $FRONTEND_PID)"
else
    print_message "$RED" "Failed to start frontend service"
    # Clean up backend before exiting
    kill -TERM $BACKEND_PID 2>/dev/null
    exit 1
fi

# Display service status
print_header "Service Status"
print_message "$CYAN" "Backend service running with PID: $BACKEND_PID (Port: $BACKEND_PORT)"
print_message "$CYAN" "Frontend service running with PID: $FRONTEND_PID (Port: $FRONTEND_PORT)"
print_message "$PURPLE" "Press Ctrl+C to stop all services and exit"

# Keep the script running until user interrupts with Ctrl+C
while true; do
    # Check if both services are still running
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        print_message "$RED" "Backend service has stopped unexpectedly"
        cleanup
    fi
    
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        print_message "$RED" "Frontend service has stopped unexpectedly"
        cleanup
    fi
    
    sleep 2
done