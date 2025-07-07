#!/bin/bash

# detach-from-scaffold.sh
# Script to detach this project from the scaffold and make it your own

set -e  # Exit on any error

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

# Function to prompt for user input
prompt_input() {
    local prompt="$1"
    local var_name="$2"
    local default_value="$3"
    
    # Check if this is an optional field (has default value, even if empty)
    if [ $# -eq 3 ]; then
        read -p "$prompt [$default_value]: " input
        if [ -z "$input" ]; then
            input="$default_value"
        fi
    else
        read -p "$prompt: " input
        while [ -z "$input" ]; do
            echo "This field is required."
            read -p "$prompt: " input
        done
    fi
    
    eval $var_name="'$input'"
}

# Function to confirm action
confirm_action() {
    local message="$1"
    echo -e "${YELLOW}$message${NC}"
    read -p "Are you sure you want to continue? (y/N): " confirm
    case $confirm in
        [Yy]* ) return 0;;
        * ) return 1;;
    esac
}

# Check if we're in the right directory
if [ ! -f "detach-from-scaffold.sh" ]; then
    print_error "This script must be run from the project root directory."
    exit 1
fi

# Welcome message
echo
echo "==================================================================="
echo "        📦 Scaffold Detachment Tool"
echo "==================================================================="
echo
echo "This script will help you detach this project from the scaffold"
echo "and make it your own independent application."
echo
echo "The script will:"
echo "  ✅ Rename your project"
echo "  ✅ Update all references and configurations"
echo "  ✅ Remove git history and create a fresh repo"
echo "  ✅ Update documentation"
echo "  ✅ Clean up scaffold-specific files"
echo
print_warning "⚠️  This action is IRREVERSIBLE! Make sure you have backups."
echo

# Confirm user wants to proceed
if ! confirm_action "🚨 This will permanently modify your project structure."; then
    print_status "Operation cancelled."
    exit 0
fi

echo
echo "Let's gather some information about your new project..."
echo

# Gather project information
prompt_input "🏷️  What is your new project name? (e.g., 'my-awesome-app')" NEW_PROJECT_NAME
prompt_input "📝 What is your project display name? (e.g., 'My Awesome App')" NEW_DISPLAY_NAME "$NEW_PROJECT_NAME"
prompt_input "📄 Brief description of your project" NEW_DESCRIPTION "A full-stack web application"
prompt_input "👤 Your name/organization" AUTHOR_NAME
prompt_input "📧 Your email" AUTHOR_EMAIL
prompt_input "🌐 Your website/GitHub (optional)" AUTHOR_URL ""

# Convert project name to different formats
NEW_PROJECT_SNAKE=$(echo "$NEW_PROJECT_NAME" | tr '-' '_' | tr '[:upper:]' '[:lower:]')
NEW_PROJECT_PASCAL=$(echo "$NEW_PROJECT_NAME" | sed -r 's/(^|-)([a-z])/\u\2/g' | tr -d '-')
NEW_PROJECT_UPPER=$(echo "$NEW_PROJECT_NAME" | tr '[:lower:]' '[:upper:]' | tr '-' '_')

echo
echo "==================================================================="
echo "📋 Project Configuration Summary"
echo "==================================================================="
echo "Project Name:     $NEW_PROJECT_NAME"
echo "Display Name:     $NEW_DISPLAY_NAME"
echo "Description:      $NEW_DESCRIPTION"
echo "Author:           $AUTHOR_NAME <$AUTHOR_EMAIL>"
if [ -n "$AUTHOR_URL" ]; then
    echo "Website:          $AUTHOR_URL"
fi
echo "Snake Case:       $NEW_PROJECT_SNAKE"
echo "Pascal Case:      $NEW_PROJECT_PASCAL"
echo "Upper Case:       $NEW_PROJECT_UPPER"
echo

# Final confirmation
if ! confirm_action "🎯 Ready to transform your project with these settings?"; then
    print_status "Operation cancelled."
    exit 0
fi

echo
print_status "🚀 Starting project transformation..."

# Step 1: Update package.json files
print_status "📦 Updating package.json files..."

# Frontend package.json
if [ -f "frontend/package.json" ]; then
    sed -i.bak \
        -e "s/\"name\": \"frontend\"/\"name\": \"$NEW_PROJECT_NAME-frontend\"/" \
        -e "s/\"description\": \".*\"/\"description\": \"$NEW_DESCRIPTION - Frontend\"/" \
        frontend/package.json
    rm frontend/package.json.bak
    print_success "Updated frontend/package.json"
fi

# Step 2: Update Django settings
print_status "🐍 Updating Django configuration..."

# Update Django project name in settings
find backend -name "*.py" -type f -exec sed -i.bak \
    -e "s/scaffold_project_config/${NEW_PROJECT_SNAKE}_config/g" \
    -e "s/scaffold-quickstart/$NEW_PROJECT_NAME/g" \
    -e "s/My Scaffold App/$NEW_DISPLAY_NAME/g" \
    -e "s/A reusable web application scaffold/$NEW_DESCRIPTION/g" \
    {} +

# Clean up backup files
find backend -name "*.bak" -delete

# Rename Django project directory
if [ -d "backend/scaffold_project_config" ]; then
    mv "backend/scaffold_project_config" "backend/${NEW_PROJECT_SNAKE}_config"
    print_success "Renamed Django project directory"
fi

# Update manage.py
if [ -f "backend/manage.py" ]; then
    sed -i.bak "s/scaffold_project_config/${NEW_PROJECT_SNAKE}_config/g" backend/manage.py
    rm backend/manage.py.bak
    print_success "Updated manage.py"
fi

# Step 3: Update frontend configuration
print_status "⚛️  Updating frontend configuration..."

# Update Next.js metadata
find frontend/src -name "*.tsx" -o -name "*.ts" -type f -exec sed -i.bak \
    -e "s/My Scaffold App/$NEW_DISPLAY_NAME/g" \
    -e "s/A reusable web application scaffold/$NEW_DESCRIPTION/g" \
    {} +

# Clean up backup files
find frontend/src -name "*.bak" -delete

# Step 4: Update documentation
print_status "📚 Updating documentation..."

# Update README.md
cat > README.md << EOF
# $NEW_DISPLAY_NAME

$NEW_DESCRIPTION

A modern full-stack web application built with Django and Next.js.

## 🚀 Features

- **Backend**: Django + Django REST Framework with custom authentication
- **Frontend**: Next.js 15 with TypeScript, Tailwind CSS, and App Router
- **Database**: PostgreSQL (with SQLite fallback)
- **Authentication**: Custom user model with email-based login, social auth (Google), and JWT tokens via HttpOnly cookies
- **Email Verification**: Complete email verification flow with token invalidation
- **Server-Side Rendering**: Zero-flicker authentication with Next.js middleware
- **Testing**: Comprehensive E2E tests with Playwright

## 🛠️ Quick Start

### Prerequisites

- Python 3.12+
- Node.js 18+
- PostgreSQL (optional, SQLite works for development)

### Backend Setup

\`\`\`bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
\`\`\`

### Frontend Setup

\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

### Development

Access your application:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin

## 📝 Development Commands

### Backend (Django)
\`\`\`bash
cd backend
python manage.py runserver     # Start development server
python manage.py migrate       # Run database migrations
python manage.py makemigrations # Create new migrations
python manage.py test          # Run Django tests
python manage.py createsuperuser # Create admin user
\`\`\`

### Frontend (Next.js)
\`\`\`bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm run test         # Run Jest tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
npm run test:e2e     # Run Playwright E2E tests
\`\`\`

## 🔧 Configuration

### Environment Variables

**Backend (.env.django):**
\`\`\`
SECRET_KEY=your-secret-key
DEBUG=True
DATABASE_URL=postgresql://user:password@localhost:5432/$NEW_PROJECT_SNAKE
ACCOUNT_EMAIL_VERIFICATION=mandatory
\`\`\`

**Frontend (.env.local):**
\`\`\`
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_EMAIL_VERIFICATION=mandatory
\`\`\`

## 🏗️ Architecture

### Authentication Flow
- JWT tokens stored in HttpOnly cookies for security
- Server-side authentication validation with Next.js middleware
- Zero-flicker authentication state resolution
- Email verification with token invalidation

### Key Components
- **Custom User Model**: Email-based authentication with semantic IDs
- **Next.js Middleware**: Server-side auth validation and route protection
- **AuthContext**: Client-side auth state management with SSR support
- **API Client**: Axios instance with cookie handling

## 🧪 Testing

Run the comprehensive test suite:

\`\`\`bash
# Backend tests
cd backend && python manage.py test

# Frontend unit tests
cd frontend && npm run test

# E2E tests
cd frontend && npm run test:e2e
\`\`\`

## 📄 License

Copyright (c) $(date +%Y) $AUTHOR_NAME

## 👨‍💻 Author

**$AUTHOR_NAME**
EOF

if [ -n "$AUTHOR_EMAIL" ]; then
    echo "- Email: $AUTHOR_EMAIL" >> README.md
fi

if [ -n "$AUTHOR_URL" ]; then
    echo "- Website: $AUTHOR_URL" >> README.md
fi

print_success "Created new README.md"

# Update CLAUDE.md
cat > CLAUDE.md << EOF
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# $NEW_DISPLAY_NAME

$NEW_DESCRIPTION

## Project Overview

This is a full-stack web application built with:
- **Backend**: Django + Django REST Framework with custom authentication
- **Frontend**: Next.js 15 with TypeScript, Tailwind CSS, and App Router
- **Database**: PostgreSQL (with SQLite fallback)
- **Authentication**: Custom user model with email-based login, social auth (Google), and JWT tokens via HttpOnly cookies

## Development Commands

### Frontend (Next.js)
\`\`\`bash
cd frontend
npm run dev          # Start development server (localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm run test         # Run Jest tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
npm run test:e2e     # Run Playwright E2E tests
\`\`\`

### Backend (Django)
\`\`\`bash
cd backend
python manage.py runserver     # Start development server (localhost:8000)
python manage.py migrate       # Run database migrations
python manage.py makemigrations # Create new migrations
python manage.py test          # Run Django tests
python manage.py createsuperuser # Create admin user
\`\`\`

## Architecture Overview

### Custom User Model
- Located in \`backend/apps/users/models.py\`
- Uses email as username (no separate username field)
- Implements semantic IDs: 2-character prefix + 30 random alphanumeric characters
- Inherits from \`AbstractUser\` with custom \`SemanticIDField\`

### Authentication Flow
- JWT tokens stored in HttpOnly cookies for security
- Server-side authentication validation with Next.js middleware
- Zero-flicker authentication state resolution
- Email verification with automatic token invalidation

### Frontend Structure
- App Router with route groups in \`src/app/(auth)/\`
- Server-side auth state resolution via middleware
- AuthContext provides global authentication state with SSR support
- Components organized by feature in \`src/components/\`

### API Endpoints
Key authentication endpoints:
- \`POST /api/auth/registration/\` - User registration
- \`POST /api/auth/login/\` - Login
- \`POST /api/auth/logout/\` - Logout
- \`POST /api/auth/password/reset/\` - Password reset
- \`GET /api/auth/user/\` - Get current user

### Database Models
- All models use semantic IDs as primary keys
- Custom \`SemanticIDField\` in \`backend/apps/common/fields.py\`
- User model in \`backend/apps/users/models.py\`
- Email verification tracking with \`email_verified_at\` timestamp

## Development Partnership

We're building production-quality code together. Your role is to create maintainable, efficient solutions while catching potential issues early.

### Research → Plan → Implement
**NEVER JUMP STRAIGHT TO CODING!** Always follow this sequence:
1. **Research**: Explore the codebase, understand existing patterns
2. **Plan**: Create a detailed implementation plan and verify it
3. **Implement**: Execute the plan with validation checkpoints

### Final Validation
**ALWAYS** run final validation:
- Run \`npm run lint:fix\`
- Run \`npm run format\`
- Run \`npm run test\`
- Run \`npm run test:coverage\`
- Run \`python manage.py test\`

### Testing Strategy
- Complex business logic → Write tests first
- Simple CRUD → Write tests after
- Hot paths → Add benchmarks
- Skip tests for main() and simple CLI parsing
EOF

print_success "Updated CLAUDE.md"

# Step 5: Remove scaffold-specific files
print_status "🧹 Cleaning up scaffold-specific files..."

# Remove this detach script
rm -f detach-from-scaffold.sh

# Remove any scaffold-specific documentation
rm -f SCAFFOLD.md

print_success "Removed scaffold-specific files"

# Step 6: Git operations
print_status "🗂️  Setting up fresh git repository..."

# Remove existing git history
if [ -d ".git" ]; then
    rm -rf .git
    print_success "Removed existing git history"
fi

# Initialize new git repository
git init
print_success "Initialized new git repository"

# Create initial commit
git add .
git commit -m "Initial commit: $NEW_DISPLAY_NAME

$NEW_DESCRIPTION

Generated from scaffold and customized for this project.

Features:
- Django + Next.js full-stack architecture
- Email-based authentication with JWT cookies
- Server-side rendering with zero-flicker auth
- Email verification with token invalidation
- Comprehensive test suite with Playwright
- Production-ready configuration"

print_success "Created initial commit"

# Step 7: Create project-specific files
print_status "📄 Creating project-specific configuration..."

# Create .env.example files
cat > backend/.env.django.example << EOF
# Django Configuration
SECRET_KEY=your-super-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database Configuration
# For PostgreSQL (recommended for production):
# DATABASE_URL=postgresql://username:password@localhost:5432/$NEW_PROJECT_SNAKE
# For SQLite (development only):
DATABASE_URL=sqlite:///db.sqlite3

# Email Configuration
ACCOUNT_EMAIL_VERIFICATION=mandatory
ACCOUNT_EMAIL_SUBJECT_PREFIX=[$NEW_DISPLAY_NAME] 
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend

# JWT Configuration
JWT_ACCESS_TOKEN_LIFETIME_MINUTES=60
JWT_REFRESH_TOKEN_LIFETIME_DAYS=7

# Social Authentication (optional)
# GOOGLE_OAUTH_CLIENT_ID=your-google-client-id
# GOOGLE_OAUTH_SECRET_KEY=your-google-secret-key

# Frontend URL for email confirmation links
FRONTEND_URL=http://localhost:3000
EOF

cat > frontend/.env.local.example << EOF
# Next.js Environment Variables
NEXT_PUBLIC_API_URL=http://localhost:8000

# Authentication Configuration
NEXT_PUBLIC_LOGIN_ON_REGISTRATION=true
NEXT_PUBLIC_EMAIL_VERIFICATION=mandatory
EOF

print_success "Created example environment files"

# Final success message
echo
echo "==================================================================="
print_success "🎉 Project transformation complete!"
echo "==================================================================="
echo
echo "Your project has been successfully detached from the scaffold!"
echo
echo "📋 Summary of changes:"
echo "  ✅ Project renamed to: $NEW_DISPLAY_NAME"
echo "  ✅ All references updated throughout codebase"
echo "  ✅ Fresh git repository initialized"
echo "  ✅ Documentation updated with your project details"
echo "  ✅ Example environment files created"
echo "  ✅ Scaffold-specific files removed"
echo
echo "🚀 Next steps:"
echo "  1. Copy .env.example files and configure your environment:"
echo "     cp backend/.env.django.example backend/.env.django"
echo "     cp frontend/.env.local.example frontend/.env.local"
echo
echo "  2. Set up your database:"
echo "     cd backend && python manage.py migrate"
echo
echo "  3. Create a superuser:"
echo "     python manage.py createsuperuser"
echo
echo "  4. Start your development servers:"
echo "     # Terminal 1: cd backend && python manage.py runserver"
echo "     # Terminal 2: cd frontend && npm run dev"
echo
echo "  5. Set up your remote git repository:"
echo "     git remote add origin <your-repo-url>"
echo "     git push -u origin main"
echo
print_success "Welcome to your new independent project! 🚀"
echo