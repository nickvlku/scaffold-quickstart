#!/bin/bash

# Scaffold Quickstart - Start Both Frontend and Backend Development Servers
# This script starts both Django and Next.js servers concurrently

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
if [ ! -f "CLAUDE.md" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    print_error "This script must be run from the scaffold-quickstart root directory"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "backend/venv" ]; then
    print_error "Backend virtual environment not found. Please run ./setup.sh first"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "frontend/node_modules" ]; then
    print_error "Frontend node_modules not found. Please run ./setup.sh first"
    exit 1
fi

# Function to cleanup background processes
cleanup() {
    echo -e "\n${YELLOW}Shutting down development servers...${NC}"
    # Kill all background jobs
    jobs -p | xargs -r kill 2>/dev/null
    # Kill any remaining processes on our ports
    lsof -ti:8000 | xargs -r kill -9 2>/dev/null || true
    lsof -ti:3000 | xargs -r kill -9 2>/dev/null || true
    echo -e "${GREEN}✓ Development servers stopped${NC}"
    exit 0
}

# Set up trap to cleanup on exit
trap cleanup EXIT INT TERM

print_header "Starting Full Stack Development Environment"

# Check and create environment files if needed
if [ ! -f "backend/.env.django" ]; then
    print_warning "Backend environment file not found. Creating basic one..."
    cat > backend/.env.django << EOF
# Django Settings
DEBUG=True
SECRET_KEY=dev-secret-key-change-in-production

# Database
DATABASE_URL=sqlite:///db.sqlite3

# Email (for development)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Google OAuth (optional)
GOOGLE_OAUTH2_CLIENT_ID=
GOOGLE_OAUTH2_CLIENT_SECRET=
EOF
    print_success "Basic backend environment file created"
fi

if [ ! -f "frontend/.env.local" ]; then
    print_warning "Frontend environment file not found. Creating basic one..."
    cat > frontend/.env.local << EOF
# Next.js Environment Variables
NEXT_PUBLIC_API_URL=http://localhost:8000
EOF
    print_success "Basic frontend environment file created"
fi

# Start backend server in background
print_success "Starting Django backend server..."
cd backend
source venv/bin/activate

# Check for pending migrations
if python manage.py showmigrations --plan | grep -q "\[ \]"; then
    print_warning "Running pending migrations..."
    python manage.py migrate
    print_success "Migrations completed"
fi

# Start Django server in background
python manage.py runserver --noreload > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

# Check if backend started successfully
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    print_error "Failed to start backend server. Check backend.log for details."
    exit 1
fi

print_success "Backend server started (PID: $BACKEND_PID)"

# Start frontend server in background
print_success "Starting Next.js frontend server..."
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait a moment for frontend to start
sleep 3

# Check if frontend started successfully
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    print_error "Failed to start frontend server. Check frontend.log for details."
    exit 1
fi

print_success "Frontend server started (PID: $FRONTEND_PID)"

# Display success message
print_header "🎉 Development Environment Ready!"
echo ""
echo -e "${GREEN}🚀 Frontend:      http://localhost:3000${NC}"
echo -e "${GREEN}🔗 Backend API:   http://localhost:8000${NC}"
echo -e "${GREEN}📋 Django Admin:  http://localhost:8000/admin${NC}"
echo ""
echo -e "${BLUE}Logs:${NC}"
echo "  • Backend logs:  tail -f backend.log"
echo "  • Frontend logs: tail -f frontend.log"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"
echo ""

# Keep the script running and show combined logs
tail -f backend.log frontend.log 2>/dev/null &
TAIL_PID=$!

# Wait for user to interrupt
wait $TAIL_PID