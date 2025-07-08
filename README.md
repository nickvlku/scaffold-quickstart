# Scaffold Quickstart

A production-ready, full-stack web application scaffold built with Django REST Framework and Next.js, featuring advanced authentication, semantic IDs, server-side rendering, and comprehensive development tooling.

## Tech Stack

- **Backend**: Django + Django REST Framework
- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS v4
- **Database**: SQLite (development) / PostgreSQL (production)
- **Authentication**: Custom user model with email login, JWT tokens, social auth
- **Testing**: Jest unit tests + Playwright E2E tests
- **Development**: tmux-based development environment + automation scripts
- **Security**: Server-side authentication, semantic IDs, email verification

## Quick Start

### Prerequisites

- Python 3.12+
- Node.js 18+
- npm or yarn
- tmux (optional, for enhanced development experience)

### Automated Setup (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd scaffold-quickstart

# Run the setup script (handles everything)
./setup.sh

# Start development environment
./start-dev.sh              # Basic concurrent startup
# OR
./start-dev-ui.sh           # Advanced tmux environment
```

### Manual Setup

For those who prefer manual setup or want to understand the process:

#### 1. Backend Setup (Django)

#### Create Python Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate
```

#### Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

#### Environment Configuration

```bash
# Copy example environment file
cp .env.django.example .env.django
```

Edit `.env.django` with your settings:

```env
DEBUG=True
SECRET_KEY='your-development-secret-key-here-generate-a-proper-one'
SQLITE_DB_NAME='db.sqlite3'
ALLOWED_HOSTS='localhost,127.0.0.1'

# Email settings (console backend for development)
EMAIL_BACKEND='django.core.mail.backends.console.EmailBackend'

# Email verification (none, optional, or mandatory)
ACCOUNT_EMAIL_VERIFICATION='none'

# CORS settings
CORS_ALLOWED_ORIGINS='http://localhost:3000,http://127.0.0.1:3000'

# Optional: Google OAuth (uncomment and configure for social auth)
# GOOGLE_OAUTH_CLIENT_ID=your_google_client_id
# GOOGLE_OAUTH_SECRET_KEY=your_google_secret_key
```

#### Database Setup

```bash
# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser
```

#### Start Backend Server

```bash
python manage.py runserver
```

Backend will be available at `http://localhost:8000`

#### 2. Frontend Setup (Next.js)

#### Install Dependencies

```bash
cd frontend
npm install
```

#### Environment Configuration

Create `.env.local` in the frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000

# Authentication Configuration
NEXT_PUBLIC_LOGIN_ON_REGISTRATION=true
```

#### Start Frontend Server

```bash
npm run dev
```

Frontend will be available at `http://localhost:3000`

## Development Workflow

### Quick Start Scripts (Recommended)

```bash
# Start both servers concurrently with logging
./start-dev.sh

# Start advanced tmux development environment
./start-dev-ui.sh
```

### Manual Server Startup

1. **Terminal 1** - Backend:
   ```bash
   cd backend
   source venv/bin/activate  # Activate virtual environment
   python manage.py runserver
   ```

2. **Terminal 2** - Frontend:
   ```bash
   cd frontend
   npm run dev
   ```

### tmux Development Environment

The `./start-dev-ui.sh` script creates a professional development environment with:
- Multi-pane terminal layout
- Backend server in one pane
- Frontend server in another pane
- Live log monitoring
- Helpful keyboard shortcuts
- Easy navigation between services

### Available Scripts

#### Root Directory Scripts
```bash
./setup.sh           # Complete environment setup
./start-dev.sh       # Start both servers concurrently
./start-dev-ui.sh    # Start tmux development environment
./detach-from-scaffold.sh # Transform into independent project
```

#### Backend (Django)
```bash
cd backend
source venv/bin/activate        # Activate virtual environment
python manage.py runserver     # Start development server
python manage.py migrate       # Apply database migrations
python manage.py makemigrations # Create new migrations
python manage.py test          # Run tests
python manage.py shell         # Django shell
python manage.py createsuperuser # Create admin user
```

#### Frontend (Next.js)
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix linting issues
npm run format       # Format code with Prettier
npm run test         # Run Jest tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
npm run test:e2e     # Run Playwright E2E tests
```

## Project Structure

```
scaffold-quickstart/
├── setup.sh                   # Complete environment setup script
├── start-dev.sh              # Concurrent server startup
├── start-dev-ui.sh           # tmux development environment
├── detach-from-scaffold.sh   # Project customization tool
├── backend/                   # Django backend
│   ├── apps/                 # Django apps
│   │   ├── common/          # Shared utilities (SemanticIDField)
│   │   └── users/           # Custom user model with email verification
│   ├── scaffold_project_config/ # Django project settings
│   │   ├── settings.py      # Main settings
│   │   ├── settings_files/  # Modular settings architecture
│   │   │   ├── auth_settings.py    # Authentication config
│   │   │   ├── api_settings.py     # DRF config
│   │   │   ├── databases.py        # Database config
│   │   │   └── ...
│   │   └── urls.py         # URL configuration
│   ├── templates/           # Django templates
│   ├── manage.py           # Django management script
│   └── requirements.txt    # Python dependencies
├── frontend/                # Next.js frontend
│   ├── src/
│   │   ├── app/            # Next.js App Router pages
│   │   │   ├── (auth)/     # Authentication pages
│   │   │   ├── protected/  # Protected page demo
│   │   │   └── page.tsx    # Homepage
│   │   ├── components/     # React components
│   │   │   ├── layout/     # Layout components (Navbar)
│   │   │   └── ui/         # UI components (Toast)
│   │   ├── contexts/       # React contexts (Auth, Toast)
│   │   ├── services/       # API client and services
│   │   └── middleware.ts   # Server-side authentication
│   ├── tests/              # Test files
│   │   └── e2e/           # Playwright E2E tests
│   ├── public/             # Static assets
│   └── package.json       # Node.js dependencies
└── README.md               # This file
```

## Key Features

### Advanced Authentication System
- **Zero-Flicker Authentication**: Server-side validation eliminates auth state flicker
- **Email-Based Login**: Custom user model with email as primary identifier
- **JWT Cookies**: Secure HttpOnly cookies prevent XSS attacks
- **Auto-Login**: Configurable auto-login after registration
- **Social Authentication**: Google OAuth2 ready for configuration
- **Password Reset**: Complete forgot password flow with secure tokens
- **Email Verification**: Advanced system with automatic token invalidation
- **Protected Routes**: Middleware-based route protection with automatic redirection

### Server-Side Rendering Features
- **Next.js 15**: Latest App Router with server components
- **Zero-Flicker Auth**: Server-side authentication state resolution
- **Middleware Protection**: Route protection without client-side redirects
- **SEO-Friendly**: Proper meta tags and server-side rendering

### Development Experience
- **Setup Automation**: One-command environment setup with `./setup.sh`
- **Development Scripts**: `./start-dev.sh` and `./start-dev-ui.sh` for easy startup
- **tmux Environment**: Professional multi-pane development interface
- **Project Detachment**: Transform scaffold into independent project
- **Hot Reloading**: Both frontend and backend support hot reloading

### Protected Page Demo
- `/protected` - Demonstration of authentication-protected content
- Displays complete user profile data (excluding sensitive information)
- Beautiful responsive UI with user status indicators
- Automatically redirects unauthenticated users to login
- Real-time data fetching from secure API endpoint

### Toast Notifications
- Success notifications for login/signup events
- Warning notifications for authentication requirements
- Error handling with user-friendly messages
- Dismissible notifications with smooth animations
- Consistent design matching the application theme

### Semantic IDs
- All models use semantic IDs as primary keys
- Format: 2-character prefix + 30 random alphanumeric characters
- Example: `US1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p`

### API Endpoints

#### Authentication
- `POST /api/auth/registration/` - User registration
- `POST /api/auth/custom-registration/` - Custom registration with auto-login
- `POST /api/auth/login/` - Login
- `POST /api/auth/logout/` - Logout
- `POST /api/auth/password/reset/` - Password reset request
- `POST /api/auth/password/reset/confirm/` - Password reset confirmation
- `GET /api/auth/user/` - Get current user

#### Email Verification
- `POST /api/auth/custom-registration/resend-email/` - Resend verification email

#### Protected Resources
- `GET /api/users/protected/` - Get detailed user data (requires authentication)

#### Admin
- `http://localhost:8000/admin/` - Django admin interface

## Database Configuration

### SQLite (Default)
The project uses SQLite by default for development. The database file will be created automatically when you run migrations.

### PostgreSQL (Production)
To use PostgreSQL, update your `.env.django` file:

```env
DATABASE_URL=postgres://username:password@localhost:5432/database_name
```

And install PostgreSQL dependencies:
```bash
pip install psycopg2-binary
```

## Email Configuration

### Development (Console Backend)
By default, emails are printed to the console. Check your terminal running the Django server to see sent emails.

### Email Verification Settings

Control email verification behavior by setting `ACCOUNT_EMAIL_VERIFICATION` in your `.env.django` file:

#### Option 1: No Email Verification (Default)
```env
ACCOUNT_EMAIL_VERIFICATION='none'
```
- Users can register and login immediately
- No email verification required
- Best for development and testing

#### Option 2: Optional Email Verification
```env
ACCOUNT_EMAIL_VERIFICATION='optional'
```
- Users can login before verifying email
- Verification email is sent but not required
- Users can verify later to unlock additional features

#### Option 3: Mandatory Email Verification
```env
ACCOUNT_EMAIL_VERIFICATION='mandatory'
```
- Users must verify email before logging in
- Registration creates account but requires email confirmation
- Users are redirected to email verification page after signup

### Production Email
Update `.env.django` with your email provider settings:

```env
EMAIL_BACKEND='django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST='smtp.gmail.com'
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER='your-email@gmail.com'
EMAIL_HOST_PASSWORD='your-app-password'
DEFAULT_FROM_EMAIL='your-email@gmail.com'

# Set email verification mode for production
ACCOUNT_EMAIL_VERIFICATION='mandatory'
```

## Social Authentication Setup

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:8000/accounts/google/login/callback/`
6. Update `.env.django`:
   ```env
   GOOGLE_OAUTH_CLIENT_ID=your_google_client_id
   GOOGLE_OAUTH_SECRET_KEY=your_google_secret_key
   ```

## Testing

### Comprehensive Testing Suite

#### E2E Tests (Playwright)
```bash
cd frontend
npm run test:e2e          # Run all E2E tests
npm run test:e2e -- --ui  # Run with Playwright UI
```

**E2E Test Coverage:**
- Complete authentication flows (registration, login, logout)
- Email verification process
- Password reset functionality
- Protected route access
- Cross-browser compatibility

#### Frontend Unit Tests (Jest)
```bash
cd frontend
npm run test              # Run tests once
npm run test:watch        # Run in watch mode
npm run test:coverage     # Run with coverage report
```

#### Backend Tests (Django)
```bash
cd backend
source venv/bin/activate
python manage.py test     # Run Django tests
```

### Testing Strategy
- **E2E Tests**: Critical user flows and authentication
- **Unit Tests**: Component logic and API endpoints
- **Integration Tests**: Database models and authentication flows
- **Coverage**: Maintain high test coverage for core features

### Testing Authentication Flow

1. **Registration Flow**:
   - Visit `http://localhost:3000/signup`
   - Create a new account
   - If `ACCOUNT_EMAIL_VERIFICATION='none'`, you'll be logged in immediately
   - If email verification is enabled, check your console for verification email

2. **Login Flow**:
   - Visit `http://localhost:3000/login`
   - Login with existing credentials
   - Success toast notification should appear
   - You'll be redirected to the home page

3. **Protected Page Access**:
   - When logged in, click "Go to Protected Page" on home page
   - View your complete user profile data
   - Try accessing `/protected` when logged out to test authentication

4. **Logout Flow**:
   - Click "Logout" in the navigation bar
   - You'll be redirected to home page
   - Protected pages should no longer be accessible

## Project Scaffolding

### Creating Your Own Project

This scaffold is designed to be transformed into your own independent project:

```bash
# Transform scaffold into your project
./detach-from-scaffold.sh
```

**The detachment script will:**
- Rename the project to your specifications
- Update all references and configurations
- Rename Django project directories
- Create fresh git repository
- Generate custom documentation
- Create project-specific environment files

### Development Workflow Scripts

#### Complete Setup
```bash
./setup.sh
```
- Checks and installs all dependencies
- Creates Python virtual environment
- Installs Python and Node.js dependencies
- Creates environment files
- Runs database migrations
- Optionally creates superuser

#### Development Environments
```bash
# Basic concurrent startup
./start-dev.sh

# Advanced tmux environment
./start-dev-ui.sh
```

**tmux Environment Features:**
- Multi-pane terminal layout
- Backend and frontend servers in separate panes
- Live log monitoring
- Keyboard shortcuts for navigation
- Professional development experience

## Production Deployment

### Backend
1. Set `DEBUG=False` in `.env.django`
2. Configure production database (PostgreSQL recommended)
3. Set up proper email backend (SMTP)
4. Configure static files serving
5. Set secure `SECRET_KEY`
6. Configure `ALLOWED_HOSTS` for your domain

### Frontend
1. Build the application: `npm run build`
2. Start production server: `npm run start`
3. Or deploy to Vercel/Netlify/other platforms

### Environment Variables for Production
```bash
# Backend (.env.django)
DEBUG=False
SECRET_KEY=your-super-secure-secret-key
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
ACCOUNT_EMAIL_VERIFICATION=mandatory

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_EMAIL_VERIFICATION=mandatory
```

## Troubleshooting

### Common Issues

1. **Virtual environment not activated**
   - Always activate your virtual environment before running Django commands
   - `source venv/bin/activate` (macOS/Linux) or `venv\Scripts\activate` (Windows)

2. **Port already in use**
   - Change ports in the commands:
   - Backend: `python manage.py runserver 8001`
   - Frontend: `npm run dev -- --port 3001`

3. **Database migration errors**
   - Delete `db.sqlite3` file and run migrations again
   - Or reset migrations: `python manage.py migrate --fake-initial`

4. **CORS errors**
   - Verify `CORS_ALLOWED_ORIGINS` in `.env.django` includes your frontend URL
   - Check that both servers are running on expected ports

5. **Authentication not working**
   - Verify JWT settings in Django settings
   - Check that cookies are being set properly
   - Ensure `CORS_ALLOW_CREDENTIALS = True` in settings
   - Check `NEXT_PUBLIC_LOGIN_ON_REGISTRATION` is set to `true` in frontend `.env.local`

6. **Email verification not working**
   - Check `ACCOUNT_EMAIL_VERIFICATION` setting in `.env.django`
   - Verify email backend configuration
   - For development, check console output for verification emails
   - Ensure email templates are properly configured

7. **Protected page not accessible**
   - Verify user is properly authenticated (check browser cookies)
   - Check API endpoint `/api/users/protected/` returns 200 when authenticated
   - Ensure JWT tokens are being sent with API requests

8. **tmux environment issues**
   - Install tmux: `brew install tmux` (macOS) or `apt-get install tmux` (Ubuntu)
   - If panes don't start correctly, check that both `venv` exists and dependencies are installed
   - Use `Ctrl-b` + `d` to detach from tmux session

9. **Setup script failures**
   - Ensure you have proper permissions to install packages
   - Check that Python 3.12+ and Node.js 18+ are installed
   - Run `./setup.sh` from the project root directory

10. **E2E test failures**
    - Install Playwright browsers: `npx playwright install`
    - Ensure both backend and frontend are running during tests
    - Check that test URLs match your local development setup

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run tests and linting
6. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).