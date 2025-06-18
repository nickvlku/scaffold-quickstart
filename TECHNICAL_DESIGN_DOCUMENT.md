# Technical Design Document: Reusable Web Application Scaffold

**Version:** 0.1
**Date:** 06/17/2025
**Author(s):** Nick Vlku
**Status:** Draft

## 1. Introduction & Goals

This document outlines the technical design for a reusable scaffolding application. The primary goal is to provide a robust starting point for new web application ideas, minimizing setup time and enforcing best practices.

**Key Features:**

*   **Backend:** Django / Django REST Framework (DRF)
*   **Frontend:** Next.js (App Router)
*   **Styling:** Tailwind CSS
*   **Language (Frontend):** TypeScript
*   **Database:** PostgreSQL (default for development, with SQLite as a simpler option)
*   **Custom Extendable User Model:**
    *   Login via email and password.
    *   No separate "username" field; email is the primary identifier.
*   **Semantic IDs:** All primary keys for models will be semantic IDs (e.g., `US` prefix for User, `PR` for Product, etc.) with a format of `PRFX` + 30 random alphanumeric characters (`[A-Za-z0-9]`).
*   **Authentication Features:**
    *   Email & Password Login
    *   Social Authentication (Google as initial provider)
    *   Forgot Password Functionality
    *   Magic Email Links (for email verification, password reset confirmation)
*   **Frontend Pages:**
    *   Homepage (logged-in/out accessible) with dynamic navigation.
    *   Protected Page (requires login).
    *   Signup Page.
    *   Login Page (with social auth option).
    *   Forgot Password Page.
    *   Confirm/Validate Forgot Password Token Page.
    *   Logout functionality.
*   **Development Environment:** Docker & Docker Compose for consistency.

## 2. Architectural Decisions

### 2.1. Backend (Django)

*   **Framework:** Django with Django REST Framework (DRF) for API development.
*   **Database:** PostgreSQL is the recommended database for development (via Docker) and production. SQLite can be used for simpler local setups if preferred, though the scaffold will be configured for Postgres.
*   **Custom User Model:**
    *   Inherit from `django.contrib.auth.models.AbstractUser`.
    *   `USERNAME_FIELD` will be set to `email`.
    *   `email` will be unique and required. The `username` field will be removed or made non-functional.
    *   Primary Key: `SemanticIDField` (see below).
*   **Semantic IDs:**
    *   A custom Django model field (`SemanticIDField`) will be implemented.
    *   Format: 2-character prefix (model-specific) followed by 30 cryptographically secure random characters from the Base62 set (`[A-Za-z0-9]`). Total length: 32 characters.
    *   The field will handle generation and ensure uniqueness within its table, with a retry mechanism for rare collisions.
*   **API Authentication:**
    *   Libraries: `dj_rest_auth` for handling authentication endpoints, integrated with `django-allauth`.
    *   Tokens: JSON Web Tokens (JWTs) managed by `djangorestframework-simplejwt`.
    *   Token Transmission: JWTs (access and refresh) will be sent to the frontend via `HttpOnly` cookies to mitigate XSS risks. Refresh tokens will be used for session persistence.
    *   Cookie Settings: `Secure` (in production), `HttpOnly`, `SameSite='Lax'` (or 'Strict').
*   **Core Authentication Logic:**
    *   `django-allauth` will be used for:
        *   User registration (email as username).
        *   Email/Password login.
        *   Social authentication (Google initial setup).
        *   Password reset flow.
        *   Email confirmation.
*   **Email Handling:**
    *   Local Development: `django.core.mail.backends.console.EmailBackend` by default. Optional integration with **Mailpit** (via Docker Compose) for a web UI to view sent emails.
    *   Staging/Production: Configurable via environment variables (e.g., `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USE_TLS`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`). Ready for integration with services like SendGrid, AWS SES (e.g., using `django-anymail`).
*   **CORS:** `django-cors-headers` will be configured to allow requests from the Next.js frontend development server (`http://localhost:3000`).

### 2.2. Frontend (Next.js)

*   **Framework:** Next.js (using the App Router).
*   **Language:** TypeScript.
*   **Styling:** Tailwind CSS.
*   **State Management:** React Context API for global authentication state (user object, loading states).
*   **API Interaction:** `fetch` API or a lightweight wrapper (e.g., a custom hook or utility function) for making requests to the Django backend.
*   **Routing:** Next.js App Router for defining public and protected routes. Middleware can be used for route protection.

### 2.3. Development Environment

*   **Containerization:** Docker and Docker Compose will be used to manage services:
    *   Django backend server.
    *   Next.js development server.
    *   PostgreSQL database.
    *   (Optional) Mailpit email catching service.
*   **Environment Variables:** `.env` files for managing configuration (not committed to Git). Example files (`.env.example`) will be provided.
*   **Development URLs:**
    *   Backend (Django): `http://localhost:8000`
    *   Frontend (Next.js): `http://localhost:3000`
    *   Mailpit (if used): `http://localhost:8025` (common Mailpit port)

## 3. API Design Highlights (Conceptual Endpoints)

Standard `dj_rest_auth` and `django-allauth` endpoints will be utilized and exposed:

*   **Authentication & Registration:**
    *   `POST /api/auth/registration/`
    *   `POST /api/auth/login/`
    *   `POST /api/auth/logout/`
    *   `POST /api/auth/token/refresh/`
    *   `POST /api/auth/password/reset/`
    *   `POST /api/auth/password/reset/confirm/`
    *   `GET /api/auth/user/` (to get current authenticated user details)
    *   Email verification endpoints (provided by `django-allauth`, typically link-based, not direct API calls from SPA after initial action).
*   **Social Authentication (Google Example):**
    *   `GET /api/auth/google/` (initiates OAuth flow, redirects to Google)
    *   Callback URL handled by `django-allauth` to finalize login and issue tokens.
*   **Protected Routes:**
    *   Example: `GET /api/protected-data/` (requires authentication header/cookie).

## 4. Project Structure (High-Level)
my-scaffold-app/
├── backend/
│ ├── Dockerfile
│ ├── manage.py
│ ├── requirements.txt
│ ├── project_core/ # Django project directory (e.g., myproject_core)
│ │ ├── init.py
│ │ ├── asgi.py
│ │ ├── settings.py
│ │ ├── urls.py
│ │ └── wsgi.py
│ ├── apps/
│ │ ├── common/ # Shared utilities, e.g., SemanticIDField
│ │ │ ├── init.py
│ │ │ ├── fields.py
│ │ │ └── utils.py
│ │ └── users/ # Custom user app
│ │ ├── init.py
│ │ ├── admin.py
│ │ ├── apps.py
│ │ ├── models.py
│ │ ├── serializers.py
│ │ ├── views.py
│ │ └── urls.py
│ └── .env.example.django
├── frontend/
│ ├── Dockerfile
│ ├── next.config.mjs
│ ├── package.json
│ ├── tsconfig.json
│ ├── tailwind.config.ts
│ ├── postcss.config.js
│ ├── public/
│ ├── src/ # Or just 'app/' if preferred for Next.js App Router
│ │ ├── app/
│ │ │ ├── (auth)/ # Route group for auth pages
│ │ │ │ ├── login/page.tsx
│ │ │ │ ├── signup/page.tsx
│ │ │ │ ├── forgot-password/page.tsx
│ │ │ │ └── reset-password/[uid]/[token]/page.tsx
│ │ │ ├── protected/page.tsx
│ │ │ ├── layout.tsx # Root layout
│ │ │ └── page.tsx # Homepage
│ │ ├── components/
│ │ │ ├── auth/ # Auth related components (LoginForm, SignupForm)
│ │ │ └── layout/ # Nav, Footer
│ │ ├── contexts/
│ │ │ └── AuthContext.tsx
│ │ ├── hooks/
│ │ │ └── useAuth.ts
│ │ ├── lib/ # Or utils/, for API clients, helpers
│ │ │ └── apiClient.ts
│ │ └── middleware.ts # For route protection
│ └── .env.example.nextjs
├── docker-compose.yml
├── .gitignore
└── TECHNICAL_DESIGN_DOCUMENT.md # This file


## 5. Future Considerations / Out of Scope for Initial Scaffold

*   Specific deployment strategies beyond Docker containerization readiness (e.g., Kubernetes manifests, specific CI/CD pipeline configurations).
*   Integration of additional social authentication providers beyond Google.
*   Full "passwordless" primary authentication (where magic link is the *only* way to sign up/in without a password initially). Current magic links are for verification/reset.
*   Advanced Django Admin customizations beyond registering the custom user model.
*   Automated end-to-end testing setup.
*   Internationalization (i18n) / Localization (l10n).

## 6. Key Technology Choices & Justifications

*   **Django & DRF:** Robust, scalable, large ecosystem, "batteries included" philosophy good for rapid development.
*   **Next.js:** Powerful React framework, excellent developer experience, SSR/SSG capabilities, optimized performance.
*   **TypeScript:** Type safety for more robust frontend code.
*   **Tailwind CSS:** Utility-first CSS for rapid UI development without writing custom CSS.
*   **PostgreSQL:** Feature-rich, reliable open-source RDBMS.
*   **Docker:** Ensures consistent development, testing, and production environments.
*   **`django-allauth` & `dj_rest_auth`:** Comprehensive, well-maintained libraries for Django authentication, reducing the need to build security-sensitive features from scratch.
*   **JWTs via HttpOnly Cookies:** Secure method for SPA authentication, protecting against XSS.