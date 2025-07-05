#!/bin/bash

# Scaffold Quickstart - Start Frontend Development Server
# This script starts the Next.js development server

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "\n${BLUE}=== $1 ===${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "CLAUDE.md" ] || [ ! -d "frontend" ]; then
    print_error "This script must be run from the scaffold-quickstart root directory"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "frontend/node_modules" ]; then
    print_error "Node modules not found. Please run ./setup.sh first"
    exit 1
fi

# Check if environment file exists
if [ ! -f "frontend/.env.local" ]; then
    print_warning "Frontend environment file not found. Creating basic one..."
    cat > frontend/.env.local << EOF
# Next.js Environment Variables
NEXT_PUBLIC_API_URL=http://localhost:8000
EOF
    print_success "Basic environment file created"
fi

print_header "Starting Next.js Frontend Server"

# Change to frontend directory
cd frontend

# Check if dependencies are up to date
echo "Checking dependencies..."
if [ package.json -nt package-lock.json ]; then
    print_warning "Dependencies may be outdated. Running npm install..."
    npm install
    print_success "Dependencies updated"
else
    print_success "Dependencies are up to date"
fi

# Start the development server
print_success "Starting Next.js development server..."
echo -e "${GREEN}🚀 Frontend server starting at http://localhost:3000${NC}"
echo -e "${GREEN}⚡ Hot reload enabled${NC}"
echo -e "${GREEN}🔗 API connection to http://localhost:8000${NC}"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
npm run dev