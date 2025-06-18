# backend/apps/users/apps.py
from django.apps import AppConfig

class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField' # Or your SemanticIDField if it were not PK
    name = 'apps.users'