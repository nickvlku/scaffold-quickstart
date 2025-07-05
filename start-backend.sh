#!/bin/bash

# Scaffold Quickstart - Start Backend Development Server
# This script starts the Django development server

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
if [ ! -f "CLAUDE.md" ] || [ ! -d "backend" ]; then
    print_error "This script must be run from the scaffold-quickstart root directory"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "backend/venv" ]; then
    print_error "Virtual environment not found. Please run ./setup.sh first"
    exit 1
fi

# Check if environment file exists
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
    print_success "Basic environment file created"
fi

print_header "Starting Django Backend Server"

# Change to backend directory
cd backend

# Activate virtual environment
source venv/bin/activate

# Check if migrations are needed
echo "Checking for pending migrations..."
if python manage.py showmigrations --plan | grep -q "\[ \]"; then
    print_warning "Pending migrations detected. Running migrations..."
    python manage.py migrate
    print_success "Migrations completed"
else
    print_success "Database is up to date"
fi

# Start the development server
print_success "Starting Django development server..."
echo -e "${GREEN}🚀 Backend server starting at http://localhost:8000${NC}"
echo -e "${GREEN}📋 Django Admin available at http://localhost:8000/admin${NC}"
echo -e "${GREEN}🔗 API endpoints at http://localhost:8000/api/${NC}"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
python manage.py runserver