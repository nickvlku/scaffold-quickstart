# backend/scaffold_project_config/settings.py

import os
from pathlib import Path
from dotenv import load_dotenv

# BASE_DIR should be defined here, as other settings files might need it.
# It should point to the 'backend/' directory.
# Path(__file__) is scaffold_project_config/settings.py
# .resolve() gets the absolute path
# .parent is scaffold_project_config/
# .parent again is backend/
BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env file from BASE_DIR (which is backend/)
# This should happen before importing other settings modules that might use os.getenv()
load_dotenv(BASE_DIR / '.env.django')



# Import all settings from the settings package
# The order can matter if one setting depends on another defined elsewhere.
from .settings_files.base import *
from .settings_files.installed_apps import *
from .settings_files.middleware import *
from .settings_files.databases import *
from .settings_files.i18n import *                 # Templates, Languages, Timezone
from .settings_files.static_media import *         # Static files, Media files
from .settings_files.auth_settings import *        # Allauth, dj_rest_auth, simple_jwt
from .settings_files.api_settings import *         # DRF settings

# Any settings that absolutely must be at the end or are too small to split
# For example, if you had local_settings.py import logic:
# try:
#     from .local_settings import *
# except ImportError:
#     pass
