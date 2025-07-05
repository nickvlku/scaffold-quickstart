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

This is a reusable full-stack web application scaffold built with:
- **Backend**: Django + Django REST Framework with custom authentication
- **Frontend**: Next.js 15 with TypeScript, Tailwind CSS, and App Router
- **Database**: PostgreSQL (with SQLite fallback)
- **Authentication**: Custom user model with email-based login, social auth (Google), and JWT tokens via HttpOnly cookies

## Development Commands

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
```

### Backend (Django)
```bash
cd backend
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
- JWT tokens stored in HttpOnly cookies for security
- Uses `django-allauth` for registration/login
- `dj-rest-auth` for API endpoints
- `djangorestframework-simplejwt` for token management
- Social authentication with Google configured

### Frontend Structure
- App Router with route groups in `src/app/(auth)/`
- Protected routes use middleware authentication
- AuthContext provides global authentication state
- Components organized by feature in `src/components/`

### API Endpoints
Key authentication endpoints:
- `POST /api/auth/registration/` - User registration
- `POST /api/auth/login/` - Login
- `POST /api/auth/logout/` - Logout
- `POST /api/auth/password/reset/` - Password reset
- `GET /api/auth/user/` - Get current user

### Database Models
- All models use semantic IDs as primary keys
- Custom `SemanticIDField` in `backend/apps/common/fields.py`
- User model in `backend/apps/users/models.py`

### Settings Architecture
Django settings are split into modules in `backend/scaffold_project_config/settings_files/`:
- `base.py` - Core Django settings
- `installed_apps.py` - App configuration
- `auth_settings.py` - Authentication configuration
- `api_settings.py` - DRF configuration
- `databases.py` - Database configuration

## Testing

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

## Security Notes

- JWT tokens are HttpOnly cookies to prevent XSS
- CORS configured for frontend development server
- Social authentication uses secure OAuth flow
- Custom user model prevents username enumeration
- Semantic IDs prevent ID guessing attacks