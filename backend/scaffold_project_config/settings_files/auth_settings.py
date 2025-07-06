# backend/scaffold_project_config/settings_files/auth_settings.py
import os
import warnings
from datetime import timedelta
# Assumes DEBUG and SECRET_KEY are available from main/base settings.
from scaffold_project_config.settings import DEBUG, SECRET_KEY

# Suppress dj-rest-auth deprecation warnings for cleaner output
# These warnings are from the library itself, not our configuration
warnings.filterwarnings('ignore', message='app_settings.USERNAME_REQUIRED is deprecated')
warnings.filterwarnings('ignore', message='app_settings.EMAIL_REQUIRED is deprecated')


AUTH_USER_MODEL = 'users.User'

AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
)

# django-allauth specific settings
ACCOUNT_LOGIN_METHODS = ['email']
ACCOUNT_UNIQUE_EMAIL = True
ACCOUNT_USER_MODEL_USERNAME_FIELD = None
ACCOUNT_EMAIL_VERIFICATION = os.getenv('ACCOUNT_EMAIL_VERIFICATION', 'none') # e.g. 'mandatory'
ACCOUNT_LOGIN_ON_EMAIL_CONFIRMATION = True
ACCOUNT_EMAIL_SUBJECT_PREFIX = os.getenv('ACCOUNT_EMAIL_SUBJECT_PREFIX', '[MyScaffoldApp] ')

# Frontend URL for email confirmation links
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')
ACCOUNT_CONFIRM_EMAIL_ON_GET = False  # Changed to False to use allauth POST-based confirmation

# Use database-stored email confirmations instead of HMAC tokens
ACCOUNT_EMAIL_CONFIRMATION_HMAC = False

# Custom adapter to send email confirmation links to frontend
ACCOUNT_ADAPTER = 'apps.users.adapters.CustomAccountAdapter'

ACCOUNT_SIGNUP_FORM_CLASS = None # Use default allauth form
# ACCOUNT_SIGNUP_PASSWORD_ENTER_TWICE is deprecated - password confirmation is handled by ACCOUNT_SIGNUP_FIELDS

ACCOUNT_SIGNUP_FIELDS = ['email*', 'password1*', 'password2*']
ACCOUNT_LOGIN_ON_REGISTRATION = True 

# Note: Deprecated allauth settings removed to eliminate warnings.
# Modern equivalents are already configured above:
# - ACCOUNT_AUTHENTICATION_METHOD → ACCOUNT_LOGIN_METHODS = ['email']
# - ACCOUNT_EMAIL_REQUIRED → ACCOUNT_SIGNUP_FIELDS = ['email*', ...]
# - ACCOUNT_USERNAME_REQUIRED → ACCOUNT_SIGNUP_FIELDS (no username field)


# Social Auth settings (example for Google)
# Ensure GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_SECRET_KEY are in your .env.django
GOOGLE_OAUTH_CLIENT_ID = os.getenv('GOOGLE_OAUTH_CLIENT_ID')
GOOGLE_OAUTH_SECRET_KEY = os.getenv('GOOGLE_OAUTH_SECRET_KEY')

SOCIALACCOUNT_PROVIDERS = {} # Initialize as empty dict

if GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_SECRET_KEY:
    SOCIALACCOUNT_PROVIDERS['google'] = {
        'APP': {
            'client_id': GOOGLE_OAUTH_CLIENT_ID,
            'secret': GOOGLE_OAUTH_SECRET_KEY,
            'key': '' # if any, usually not needed for Google
        },
        'SCOPE': [
            'profile',
            'email',
        ],
        'AUTH_PARAMS': {
            'access_type': 'online',
        }
    }
else:
    print("Warning: Google OAuth Client ID or Secret Key not configured. Google login will not be available.")


# dj_rest_auth Settings
REST_AUTH = {
    'USE_JWT': True,
    'JWT_AUTH_COOKIE': 'my-app-auth',
    'JWT_AUTH_REFRESH_COOKIE': 'my-app-refresh-token',
    'JWT_AUTH_HTTPONLY': True,
    'JWT_AUTH_SAMESITE': 'Lax',
    'JWT_AUTH_SECURE': not DEBUG, # True if not DEBUG (i.e., in production over HTTPS)
    'JWT_AUTH_RETURN_EXPIRATION': True,
    'OLD_PASSWORD_FIELD_ENABLED': True,
    'LOGOUT_ON_PASSWORD_CHANGE': True,
    'REGISTER_SERIALIZER': 'apps.users.serializers.CustomRegisterSerializer', 
    'SESSION_LOGIN': False,
    'PASSWORD_RESET_SERIALIZER': 'apps.users.serializers.CustomPasswordResetSerializer',
    'PASSWORD_RESET_CONFIRM_TEMPLATE': 'example_message.txt',

    # If you customize serializers, point to them here
    # 'USER_DETAILS_SERIALIZER': 'apps.users.serializers.CustomUserDetailsSerializer',
}

# djangorestframework-simplejwt Settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=int(os.getenv('JWT_ACCESS_TOKEN_LIFETIME_MINUTES', '60'))),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=int(os.getenv('JWT_REFRESH_TOKEN_LIFETIME_DAYS', '7'))),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,

    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUDIENCE': None,
    'ISSUER': None,
    'JWK_URL': None,
    'LEEWAY': 0,

    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'USER_AUTHENTICATION_RULE': 'rest_framework_simplejwt.authentication.default_user_authentication_rule',

    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
    'TOKEN_USER_CLASS': 'rest_framework_simplejwt.models.TokenUser',

    'JTI_CLAIM': 'jti',

    'SLIDING_TOKEN_REFRESH_EXP_CLAIM': 'refresh_exp',
    'SLIDING_TOKEN_LIFETIME': timedelta(minutes=5),
    'SLIDING_TOKEN_REFRESH_LIFETIME': timedelta(days=1),

    'JWT_COOKIE_SAMESITE': 'Lax', # Or 'Strict' or 'None' (if 'Secure' is True)
    'JWT_COOKIE_SECURE': False,   # Set to True in production (HTTPS)
    'JWT_COOKIE_HTTPONLY': True,
}