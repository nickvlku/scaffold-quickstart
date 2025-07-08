# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Development Partnership

We're building production-quality code together. Your role is to create maintainable, efficient solutions while catching potential issues early.

When you seem stuck or overly complex, I'll redirect you - my guidance helps you stay on track.

## 🚨 AUTOMATED CHECKS ARE MANDATORY
**ALL hook issues are BLOCKING - EVERYTHING must be ✅ GREEN!**  
No errors. No formatting issues. No linting problems. Zero tolerance.  
These are not suggestions. Fix ALL issues before continuing.

## CRITICAL WORKFLOW - ALWAYS FOLLOW THIS!

### Research → Plan → Implement
**NEVER JUMP STRAIGHT TO CODING!** Always follow this sequence:
1. **Research**: Explore the codebase, understand existing patterns
2. **Plan**: Create a detailed implementation plan and verify it with me  
3. **Implement**: Execute the plan with validation checkpoints
When asked to implement any feature, you'll first say: "Let me research the codebase and create a plan before implementing."

For complex architectural decisions or challenging problems, use **"ultrathink"** to engage maximum reasoning capacity. Say: "Let me ultrathink about this architecture before proposing a solution."

### USE MULTIPLE AGENTS!
*Leverage subagents aggressively* for better results:

* Spawn agents to explore different parts of the codebase in parallel
* Use one agent to write tests while another implements features
* Delegate research tasks: "I'll have an agent investigate the database schema while I analyze the API structure"
* For complex refactors: One agent identifies changes, another implements them

Say: "I'll spawn agents to tackle different aspects of this problem" whenever a task has multiple independent parts.

### Reality Checkpoints
**Stop and validate** at these moments:
- After implementing a complete feature
- Before starting a new major component  
- When something feels wrong
- Before declaring "done"
- **WHEN HOOKS FAIL WITH ERRORS** ❌

### Final Validation
**ALWAYS** run final validation:
- Run `npm run lint:fix`
- Run `npm run format`
- Run `npm run test`
- Run `npm run test:coverage`
- Run `python manage.py test`

### 🚨 CRITICAL: Hook Failures Are BLOCKING
**When hooks report ANY issues (exit code 2), you MUST:**
1. **STOP IMMEDIATELY** - Do not continue with other tasks
2. **FIX ALL ISSUES** - Address every ❌ issue until everything is ✅ GREEN
3. **VERIFY THE FIX** - Re-run the failed command to confirm it's fixed
4. **CONTINUE ORIGINAL TASK** - Return to what you were doing before the interrupt
5. **NEVER IGNORE** - There are NO warnings, only requirements

Your code must be 100% clean. No exceptions.

**Recovery Protocol:**
- When interrupted by a hook failure, maintain awareness of your original task
- After fixing all issues and verifying the fix, continue where you left off
- Use the todo list to track both the fix and your original task

## Working Memory Management

### When context gets long:
- Re-read this CLAUDE.md file
- Summarize progress in a PROGRESS.md file
- Document current state before major changes

### Maintain TODO.md:
```
## Current Task
- [ ] What we're doing RIGHT NOW

## Completed  
- [x] What's actually done and tested

## Next Steps
- [ ] What comes next

### Our code is complete when:
- ? All linters pass with zero issues
- ? All tests pass  
- ? Feature works end-to-end
- ? Old code is deleted
- ? Godoc on all exported symbols


### Testing Strategy
- Complex business logic ? Write tests first
- Simple CRUD ? Write tests after
- Hot paths ? Add benchmarks
- Skip tests for main() and simple CLI parsing

## Problem-Solving Together

When you're stuck or confused:
1. **Stop** - Don't spiral into complex solutions
2. **Delegate** - Consider spawning agents for parallel investigation
3. **Ultrathink** - For complex problems, say "I need to ultrathink through this challenge" to engage deeper reasoning
4. **Step back** - Re-read the requirements
5. **Simplify** - The simple solution is usually correct
6. **Ask** - "I see two approaches: [A] vs [B]. Which do you prefer?"

My insights on better approaches are valued - please ask for them!

## Project Overview

This is a production-ready, reusable full-stack web application scaffold built with:
- **Backend**: Django + Django REST Framework with custom authentication
- **Frontend**: Next.js 15 with TypeScript, Tailwind CSS, and App Router
- **Database**: PostgreSQL (with SQLite fallback)
- **Authentication**: Custom user model with email-based login, social auth (Google), and JWT tokens via HttpOnly cookies
- **Testing**: Comprehensive E2E testing with Playwright + Jest unit tests
- **Development**: Advanced workflow scripts and tmux-based development environment
- **Security**: Server-side authentication with zero-flicker, semantic IDs, email verification with token invalidation

## Development Commands

### Quick Start Scripts (Recommended)
```bash
# Complete setup (first time)
./setup.sh

# Start both servers concurrently
./start-dev.sh

# Start with tmux UI (advanced)
./start-dev-ui.sh

# Detach from scaffold (create independent project)
./detach-from-scaffold.sh
```

### Frontend (Next.js)
```bash
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
```

### Backend (Django)
```bash
cd backend
source venv/bin/activate        # Activate virtual environment
python manage.py runserver     # Start development server (localhost:8000)
python manage.py migrate       # Run database migrations
python manage.py makemigrations # Create new migrations
python manage.py test          # Run Django tests
python manage.py createsuperuser # Create admin user
```

## Architecture Overview

### Custom User Model
- Located in `backend/apps/users/models.py`
- Uses email as username (no separate username field)
- Implements semantic IDs: 2-character prefix + 30 random alphanumeric characters
- Inherits from `AbstractUser` with custom `SemanticIDField`

### Authentication Flow
- **Zero-Flicker Authentication**: Server-side validation via Next.js middleware
- **JWT Tokens**: Stored in HttpOnly cookies for security
- **Custom Registration**: Auto-login after registration with configurable behavior
- **Email Verification**: Advanced system with automatic token invalidation
- **Token Management**: Automatic refresh and secure cookie handling
- **Social Authentication**: Google OAuth2 ready for configuration
- **Password Reset**: Complete forgot password flow with secure tokens

### Frontend Structure
- **App Router**: Route groups in `src/app/(auth)/` with server-side auth
- **Middleware Authentication**: Server-side validation prevents auth flicker
- **AuthContext**: Global authentication state with SSR support
- **Protected Routes**: Automatic redirection and query parameter preservation
- **Components**: Organized by feature in `src/components/`
- **Testing**: E2E tests in `tests/e2e/` with Playwright

### API Endpoints
Key authentication endpoints:
- `POST /api/auth/registration/` - User registration
- `POST /api/auth/custom-registration/` - Custom registration with auto-login
- `POST /api/auth/login/` - Login
- `POST /api/auth/logout/` - Logout
- `POST /api/auth/password/reset/` - Password reset request
- `POST /api/auth/password/reset/confirm/` - Password reset confirmation
- `GET /api/auth/user/` - Get current user
- `GET /api/users/protected/` - Protected user data
- `POST /api/auth/custom-registration/resend-email/` - Resend verification email

### Database Models
- **Semantic IDs**: All models use semantic IDs as primary keys
- **Custom Field**: `SemanticIDField` in `backend/apps/common/fields.py`
- **User Model**: Custom user model in `backend/apps/users/models.py`
- **Email Verification**: `email_verified_at` timestamp tracking
- **Security**: Collision detection and cryptographically secure generation

### Settings Architecture
Django settings are split into modules in `backend/scaffold_project_config/settings_files/`:
- `base.py` - Core Django settings
- `installed_apps.py` - App configuration
- `auth_settings.py` - Authentication configuration
- `api_settings.py` - DRF configuration
- `databases.py` - Database configuration
- Environment-driven configuration with `.env.django`
- Production-ready settings structure

## Advanced Features

### Server-Side Authentication (Zero-Flicker)
**Location**: `frontend/src/middleware.ts`, `frontend/src/app/layout.tsx`
- Middleware validates JWT tokens on every request
- Authentication state injected into server components
- Eliminates authentication flicker on page load
- Automatic redirection for protected routes

### Semantic ID System
**Location**: `backend/apps/common/fields.py`, `backend/apps/common/utils.py`
- Format: 2-character prefix + 30 Base62 characters (e.g., `US_ABC123...`)
- Cryptographically secure with collision detection
- Prevents ID enumeration attacks
- Human-readable and URL-safe

### Email Verification System
**Location**: `backend/apps/users/views.py`, `backend/apps/users/signals.py`
- Custom verification with automatic token invalidation
- Tracks `email_verified_at` timestamp
- Secure resend functionality that invalidates old tokens
- Django signals for verification state management

### Development Workflow Scripts
**Location**: Root directory
- `./setup.sh` - Complete environment setup
- `./start-dev.sh` - Concurrent server startup
- `./start-dev-ui.sh` - tmux multi-pane development
- `./detach-from-scaffold.sh` - Project customization tool

### tmux Development Environment
**Usage**: `./start-dev-ui.sh`
- Multi-pane terminal with backend/frontend servers
- Live log monitoring
- Helpful keyboard shortcuts
- Professional development workflow

## Testing

### E2E Testing (Playwright)
- Comprehensive user flow testing
- Located in `frontend/tests/e2e/`
- Tests authentication, registration, password reset
- Multi-browser testing support
- Run with `npm run test:e2e`

### Frontend Tests
- Jest with React Testing Library
- Configuration in `jest.config.mjs`
- Test files in `__tests__/` or `*.test.{js,ts,jsx,tsx}`
- Run with `npm run test`

### Backend Tests
- Django's built-in test framework
- Run with `python manage.py test`

## Environment Configuration

### Frontend
- Uses `.env.local` for environment variables
- Next.js automatically loads environment files

### Backend
- Uses `.env.django` for environment variables
- Loaded via `python-dotenv` in settings.py
- Database, email, and authentication settings configurable via environment

## Common Development Patterns

### Adding New Models
1. Create model in appropriate app with `SemanticIDField` as primary key
2. Set semantic ID prefix (2 characters)
3. Run `makemigrations` and `migrate`

### Adding New API Endpoints
1. Add serializers in `serializers.py`
2. Add views in `views.py`
3. Add URL patterns in `urls.py`
4. Include in main `urls.py` if needed

### Adding New Frontend Pages
1. Create page in `src/app/` directory
2. Add to route groups if authentication required
3. Update navigation in `src/components/layout/Navbar.tsx`

## Project Scaffolding Features

### Detachment Script
**Usage**: `./detach-from-scaffold.sh`
- Transforms scaffold into independent project
- Updates all references and configurations
- Renames Django project structure
- Creates fresh git repository
- Generates custom documentation
- Interactive project configuration

### Setup Automation
**Usage**: `./setup.sh`
- Dependency checking and installation
- Virtual environment creation
- Database migration automation
- Environment file generation
- Optional superuser creation

## Security Notes

- JWT tokens are HttpOnly cookies to prevent XSS
- CORS configured for frontend development server
- Social authentication uses secure OAuth flow
- Custom user model prevents username enumeration
- Semantic IDs prevent ID guessing attacks
- Server-side authentication prevents auth state manipulation
- Email verification with secure token invalidation