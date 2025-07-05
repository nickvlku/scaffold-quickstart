# Scaffold Quickstart

A full-stack web application scaffold built with Django REST Framework and Next.js, featuring custom authentication, semantic IDs, and modern development practices.

## Tech Stack

- **Backend**: Django + Django REST Framework
- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Database**: SQLite (development) / PostgreSQL (production)
- **Authentication**: Custom user model with email login, JWT tokens, social auth

## Quick Start

### Prerequisites

- Python 3.8+
- Node.js 18+
- npm or yarn

### 1. Clone and Setup

```bash
git clone <repository-url>
cd scaffold-quickstart
```

### 2. Backend Setup (Django)

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

### 3. Frontend Setup (Next.js)

#### Install Dependencies

```bash
cd frontend
npm install
```

#### Environment Configuration

Create `.env.local` in the frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### Start Frontend Server

```bash
npm run dev
```

Frontend will be available at `http://localhost:3000`

## Development Workflow

### Running Both Servers

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

### Available Scripts

#### Backend (Django)
```bash
python manage.py runserver     # Start development server
python manage.py migrate       # Apply database migrations
python manage.py makemigrations # Create new migrations
python manage.py test          # Run tests
python manage.py shell         # Django shell
python manage.py createsuperuser # Create admin user
```

#### Frontend (Next.js)
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix linting issues
npm run format       # Format code with Prettier
npm run test         # Run Jest tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

## Project Structure

```
scaffold-quickstart/
├── backend/                    # Django backend
│   ├── apps/                   # Django apps
│   │   ├── common/            # Shared utilities (SemanticIDField)
│   │   └── users/             # Custom user model
│   ├── scaffold_project_config/ # Django project settings
│   │   ├── settings.py        # Main settings
│   │   ├── settings_files/    # Modular settings
│   │   └── urls.py           # URL configuration
│   ├── templates/             # Django templates
│   ├── manage.py             # Django management script
│   └── requirements.txt      # Python dependencies
├── frontend/                  # Next.js frontend
│   ├── src/
│   │   ├── app/              # Next.js App Router pages
│   │   │   ├── (auth)/       # Authentication pages
│   │   │   └── page.tsx      # Homepage
│   │   ├── components/       # React components
│   │   └── contexts/         # React contexts
│   ├── public/               # Static assets
│   └── package.json         # Node.js dependencies
└── README.md                 # This file
```

## Key Features

### Custom Authentication
- Email-based user registration and login
- JWT tokens stored in HttpOnly cookies
- Social authentication (Google) ready for configuration
- Password reset functionality
- Email verification

### Semantic IDs
- All models use semantic IDs as primary keys
- Format: 2-character prefix + 30 random alphanumeric characters
- Example: `US1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p`

### API Endpoints

#### Authentication
- `POST /api/auth/registration/` - User registration
- `POST /api/auth/login/` - Login
- `POST /api/auth/logout/` - Logout
- `POST /api/auth/password/reset/` - Password reset request
- `POST /api/auth/password/reset/confirm/` - Password reset confirmation
- `GET /api/auth/user/` - Get current user

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

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## Production Deployment

### Backend
1. Set `DEBUG=False` in `.env.django`
2. Configure production database
3. Set up proper email backend
4. Configure static files serving
5. Set secure `SECRET_KEY`

### Frontend
1. Build the application: `npm run build`
2. Start production server: `npm run start`
3. Or deploy to Vercel/Netlify

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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run tests and linting
6. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).