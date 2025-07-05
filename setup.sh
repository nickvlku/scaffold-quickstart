#!/bin/bash

# Scaffold Quickstart - Development Environment Setup Script
# This script sets up the complete development environment for the Django + Next.js scaffold
# Usage: ./setup.sh [--clean]

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "\n${BLUE}=== $1 ===${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

ask_yes_no() {
    local prompt="$1"
    local default="$2"
    local response
    
    if [ "$default" = "y" ]; then
        prompt="$prompt [Y/n]: "
    else
        prompt="$prompt [y/N]: "
    fi
    
    read -p "$prompt" response
    
    if [ -z "$response" ]; then
        response="$default"
    fi
    
    case "$response" in
        [Yy]|[Yy][Ee][Ss]) return 0 ;;
        *) return 1 ;;
    esac
}

# Cleanup function
cleanup_environment() {
    print_header "🧹 Cleaning Up Development Environment"
    echo "This will remove generated files and directories:"
    echo "  • Python virtual environment (backend/venv/)"
    echo "  • Node.js dependencies (frontend/node_modules/)"
    echo "  • Build artifacts (.next/, coverage/, *.log)"
    echo ""
    echo "The following items will have separate confirmations:"
    echo "  • SQLite database (contains your data)"
    echo "  • Environment files (contain your configuration)"
    echo ""
    
    if ! ask_yes_no "Are you sure you want to clean up the development environment?" "n"; then
        echo "Cleanup cancelled."
        exit 0
    fi
    
    echo ""
    print_warning "⚠️  FINAL WARNING: This will permanently delete all development setup files!"
    if ! ask_yes_no "Type 'y' to confirm cleanup" "n"; then
        echo "Cleanup cancelled."
        exit 0
    fi
    
    # Remove Python virtual environment
    if [ -d "backend/venv" ]; then
        echo "Removing Python virtual environment..."
        rm -rf backend/venv
        print_success "Python virtual environment removed"
    fi
    
    # Remove Node.js dependencies
    if [ -d "frontend/node_modules" ]; then
        echo "Removing Node.js dependencies..."
        rm -rf frontend/node_modules
        print_success "Node.js dependencies removed"
    fi
    
    # Remove package-lock.json
    if [ -f "frontend/package-lock.json" ]; then
        echo "Removing package-lock.json..."
        rm -f frontend/package-lock.json
        print_success "package-lock.json removed"
    fi
    
    # Remove SQLite database with specific confirmation
    db_files=()
    [ -f "backend/scaffold_project_config/db.sqlite3" ] && db_files+=("backend/scaffold_project_config/db.sqlite3")
    [ -f "backend/db.sqlite3" ] && db_files+=("backend/db.sqlite3")
    
    if [ ${#db_files[@]} -gt 0 ]; then
        echo ""
        print_warning "⚠️  SQLite database found:"
        for db_file in "${db_files[@]}"; do
            echo "  • $db_file"
        done
        echo "This contains all your application data including:"
        echo "  • User accounts and profiles"
        echo "  • All database records"
        echo "  • Any uploaded content"
        if ask_yes_no "Delete SQLite database(s)? This will permanently erase all data" "n"; then
            for db_file in "${db_files[@]}"; do
                echo "Removing SQLite database: $db_file..."
                rm -f "$db_file"
                print_success "SQLite database removed: $db_file"
            done
        else
            print_warning "SQLite database(s) preserved"
        fi
    fi
    
    # Remove environment files with specific confirmation
    if [ -f "backend/.env.django" ] || [ -f "frontend/.env.local" ]; then
        echo ""
        print_warning "⚠️  Environment files found"
        echo "These contain your configuration settings including:"
        echo "  • API keys and secrets"
        echo "  • Database connection strings"
        echo "  • Custom environment variables"
        
        if [ -f "backend/.env.django" ] && [ -f "frontend/.env.local" ]; then
            echo "  • backend/.env.django"
            echo "  • frontend/.env.local"
        elif [ -f "backend/.env.django" ]; then
            echo "  • backend/.env.django"
        elif [ -f "frontend/.env.local" ]; then
            echo "  • frontend/.env.local"
        fi
        
        if ask_yes_no "Delete environment files? You'll need to reconfigure settings" "n"; then
            if [ -f "backend/.env.django" ]; then
                echo "Removing backend environment file..."
                rm -f backend/.env.django
                print_success "Backend environment file removed"
            fi
            
            if [ -f "frontend/.env.local" ]; then
                echo "Removing frontend environment file..."
                rm -f frontend/.env.local
                print_success "Frontend environment file removed"
            fi
        else
            print_warning "Environment files preserved"
        fi
    fi
    
    # Remove build artifacts
    if [ -d "frontend/.next" ]; then
        echo "Removing Next.js build artifacts..."
        rm -rf frontend/.next
        print_success "Next.js build artifacts removed"
    fi
    
    # Remove coverage reports
    if [ -d "frontend/coverage" ]; then
        echo "Removing test coverage reports..."
        rm -rf frontend/coverage
        print_success "Test coverage reports removed"
    fi
    
    # Remove log files
    if [ -f "backend.log" ]; then
        rm -f backend.log
        print_success "Backend log file removed"
    fi
    
    if [ -f "frontend.log" ]; then
        rm -f frontend.log
        print_success "Frontend log file removed"
    fi
    
    # Remove Python cache files
    echo "Removing Python cache files..."
    find backend -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
    find backend -name "*.pyc" -delete 2>/dev/null || true
    print_success "Python cache files removed"
    
    print_header "✅ Cleanup Complete!"
    echo "Development environment cleanup finished."
    echo ""
    echo "To set up again, run: ./setup.sh"
    echo ""
    preserved_files=()
    [ -f "backend/scaffold_project_config/db.sqlite3" ] && preserved_files+=("SQLite database: backend/scaffold_project_config/db.sqlite3")
    [ -f "backend/db.sqlite3" ] && preserved_files+=("SQLite database: backend/db.sqlite3")
    [ -f "backend/.env.django" ] && preserved_files+=("Backend environment: backend/.env.django")
    [ -f "frontend/.env.local" ] && preserved_files+=("Frontend environment: frontend/.env.local")
    
    if [ ${#preserved_files[@]} -gt 0 ]; then
        print_warning "Note: Some files were preserved based on your choices:"
        for file in "${preserved_files[@]}"; do
            echo "  • $file"
        done
    fi
    exit 0
}

# Check if we're in the right directory
if [ ! -f "CLAUDE.md" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    print_error "This script must be run from the scaffold-quickstart root directory"
    exit 1
fi

# Check for help flag
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "Scaffold Quickstart Development Setup Script"
    echo ""
    echo "Usage:"
    echo "  ./setup.sh              Set up development environment"
    echo "  ./setup.sh --clean      Clean up development environment"
    echo "  ./setup.sh --help       Show this help message"
    echo ""
    echo "Setup will create:"
    echo "  • Python virtual environment"
    echo "  • Install Python and Node.js dependencies"
    echo "  • Create environment files"
    echo "  • Run database migrations"
    echo ""
    echo "Clean will remove:"
    echo "  • Virtual environment and dependencies"
    echo "  • Database and environment files"
    echo "  • Build artifacts and cache files"
    exit 0
fi

# Check for cleanup flag
if [ "$1" = "--clean" ] || [ "$1" = "-c" ]; then
    cleanup_environment
fi

# Check for invalid arguments
if [ ! -z "$1" ] && [ "$1" != "--clean" ] && [ "$1" != "-c" ] && [ "$1" != "--help" ] && [ "$1" != "-h" ]; then
    print_error "Invalid argument: $1"
    echo "Run './setup.sh --help' for usage information."
    exit 1
fi

print_header "Scaffold Quickstart Development Setup"
echo "This script will set up your complete development environment."
echo "It will:"
echo "  • Create Python virtual environment"
echo "  • Install Python dependencies"
echo "  • Set up environment files"
echo "  • Install Node.js dependencies"
echo "  • Run database migrations"
echo "  • Create Django superuser (optional)"
echo ""

if ! ask_yes_no "Continue with setup?" "y"; then
    echo "Setup cancelled."
    exit 0
fi

# Check dependencies
print_header "Checking Dependencies"

# Check Python
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is required but not installed"
    exit 1
fi
print_success "Python 3 found: $(python3 --version)"

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is required but not installed"
    exit 1
fi
print_success "Node.js found: $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is required but not installed"
    exit 1
fi
print_success "npm found: $(npm --version)"

# Backend Setup
print_header "Setting Up Backend (Django)"

# Create virtual environment
if [ ! -d "backend/venv" ]; then
    echo "Creating Python virtual environment..."
    cd backend
    python3 -m venv venv
    cd ..
    print_success "Virtual environment created"
else
    print_warning "Virtual environment already exists"
fi

# Activate virtual environment and install dependencies
echo "Installing Python dependencies..."
cd backend
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
cd ..
print_success "Python dependencies installed"

# Set up backend environment file
if [ ! -f "backend/.env.django" ]; then
    if [ -f "backend/.env.django.example" ]; then
        echo "Setting up backend environment file..."
        cp backend/.env.django.example backend/.env.django
        print_success "Environment file created from template"
        print_warning "Please edit backend/.env.django to configure your settings"
    else
        print_warning "No environment template found, creating basic .env.django"
        cat > backend/.env.django << EOF
# Django Settings
DEBUG=True
SECRET_KEY=your-secret-key-here

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
else
    print_warning "Backend environment file already exists"
fi

# Frontend Setup
print_header "Setting Up Frontend (Next.js)"

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
cd frontend
npm install
cd ..
print_success "Node.js dependencies installed"

# Set up frontend environment file
if [ ! -f "frontend/.env.local" ]; then
    echo "Setting up frontend environment file..."
    cat > frontend/.env.local << EOF
# Next.js Environment Variables
NEXT_PUBLIC_API_URL=http://localhost:8000
EOF
    print_success "Frontend environment file created"
else
    print_warning "Frontend environment file already exists"
fi

# Database Setup
print_header "Setting Up Database"

echo "Running database migrations..."
cd backend
source venv/bin/activate
python manage.py migrate
cd ..
print_success "Database migrations completed"

# Create superuser
if ask_yes_no "Create Django superuser?" "y"; then
    echo "Creating Django superuser..."
    cd backend
    source venv/bin/activate
    python manage.py createsuperuser
    cd ..
    print_success "Django superuser created"
fi

# Final checks
print_header "Final Setup"

echo "Running code quality checks..."
cd frontend
npm run lint:fix
npm run format
cd ..
print_success "Code formatting completed"

# Success message
print_header "Setup Complete!"
echo -e "${GREEN}🎉 Your development environment is ready!${NC}"
echo ""
echo "Next steps:"
echo "  • Start the backend:    ./start-backend.sh"
echo "  • Start the frontend:   ./start-frontend.sh"
echo "  • Start both:           ./start-dev.sh"
echo ""
echo "URLs:"
echo "  • Frontend: http://localhost:3000"
echo "  • Backend API: http://localhost:8000"
echo "  • Django Admin: http://localhost:8000/admin"
echo ""
echo "Other commands:"
echo "  • Clean environment:    ./setup.sh --clean"
echo "  • Show help:            ./setup.sh --help"
echo ""
print_warning "Don't forget to configure your environment variables in:"
print_warning "  • backend/.env.django"
print_warning "  • frontend/.env.local"