# backend/scaffold_project_config/settings_files/static_media.py
import os
# Assumes BASE_DIR is available.
from scaffold_project_config.settings import BASE_DIR

STATIC_URL = 'static/'
# STATIC_ROOT = BASE_DIR / 'staticfiles' # For collectstatic in production
# MEDIA_URL = 'media/'
# MEDIA_ROOT = BASE_DIR / 'mediafiles'   # For user-uploaded files