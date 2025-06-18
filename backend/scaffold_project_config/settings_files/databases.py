# backend/scaffold_project_config/settings_files/databases.py
import os
# Assumes BASE_DIR is available from main settings.py or base.py via wildcard import
# If not, redefine: from pathlib import Path; BASE_DIR = Path(__file__).resolve().parent.parent.parent
# For simplicity, let's assume BASE_DIR from the main settings.py import is working.
# If settings.py imports `from .settings.base import BASE_DIR` first, it's available.
# Let's ensure BASE_DIR is accessible. It was defined in the main settings.py.

# To be absolutely safe if this file were imported independently (it's not here):
from scaffold_project_config.settings import BASE_DIR # Access BASE_DIR from the top-level settings.py

SQLITE_DB_NAME = os.getenv('SQLITE_DB_NAME', 'db.sqlite3')
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / SQLITE_DB_NAME,
    }
}
# We'll enhance this later for DATABASE_URL and PostgreSQL