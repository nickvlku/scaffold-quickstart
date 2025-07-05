# backend/scaffold_project_config/settings_files/installed_apps.py
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',

    # Our apps
    'apps.users.apps.UsersConfig',
    'apps.common.apps.CommonConfig',

    # Third-party apps for API and Auth
    'rest_framework',
    'rest_framework.authtoken',
    'dj_rest_auth',
    'dj_rest_auth.registration',

    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google', # Example provider

    'corsheaders',
    'django.contrib.auth',
]