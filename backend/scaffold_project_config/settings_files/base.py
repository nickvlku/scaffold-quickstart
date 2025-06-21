# backend/scaffold_project_config/settings_files/base.py
import os
from pathlib import Path

# BASE_DIR is defined in the main settings.py and imported via `from .settings.base import *`
# but if this file needs it directly and you're not sure about import order effects:
# BASE_DIR = Path(__file__).resolve().parent.parent.parent # settings/ -> scaffold_project_config/ -> backend/

# Use BASE_DIR from the main settings.py that's already loaded .env
# We assume main settings.py has defined BASE_DIR and loaded dotenv.

SECRET_KEY = os.getenv('SECRET_KEY')
DEBUG = os.getenv('DEBUG', 'False').lower() in ('true', '1', 't')

ALLOWED_HOSTS_STRING = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1,*.ngrok-free.app')
ALLOWED_HOSTS = [host.strip() for host in ALLOWED_HOSTS_STRING.split(',')]

ROOT_URLCONF = 'scaffold_project_config.urls' # Project's main urls.py
WSGI_APPLICATION = 'scaffold_project_config.wsgi.application'
ASGI_APPLICATION = 'scaffold_project_config.asgi.application'

# Default primary key field type (less relevant now we use SemanticIDField as PK for User)
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Site ID for django-allauth
SITE_ID = 1

# Email Configuration
EMAIL_BACKEND = os.getenv('EMAIL_BACKEND', 'django.core.mail.backends.console.EmailBackend')
EMAIL_HOST = os.getenv('EMAIL_HOST')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'True').lower() in ('true', '1', 't')
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'webmaster@localhost')

# CORS settings
CORS_ALLOWED_ORIGINS_STRING = os.getenv('CORS_ALLOWED_ORIGINS', 'http://localhost:3000,https://403c-140-174-75-126.ngrok-free.app')
CORS_ALLOWED_ORIGINS = [origin.strip() for origin in CORS_ALLOWED_ORIGINS_STRING.split(',')]
CORS_ALLOW_ALL_ORIGINS = True   
CORS_ALLOW_CREDENTIALS = True

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [], # Add project-level template dirs if you have any, e.g., [BASE_DIR / 'templates']
        'APP_DIRS': True, # This allows Django to find templates within app directories
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request', # `allauth` needs this
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]
