# backend/apps/users/apps.py
from django.apps import AppConfig

class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField' # Or your SemanticIDField if it were not PK
    name = 'apps.users'
    
    def ready(self):
        """Import signals when the app is ready"""
        import apps.users.signals