# backend/apps/users/serializers.py
from dj_rest_auth.registration.serializers import RegisterSerializer
from dj_rest_auth.serializers import PasswordResetSerializer
from django.conf import settings # To check allauth settings if needed
from .forms import ScaffoldPasswordResetForm

class CustomRegisterSerializer(RegisterSerializer):
    # The default RegisterSerializer might add 'username' based on some conditions.
    # We explicitly remove it from the serializer's fields if present.
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Fields that should not be on our email-only registration
        fields_to_remove = []
        if hasattr(settings, 'ACCOUNT_USER_MODEL_USERNAME_FIELD') and \
           settings.ACCOUNT_USER_MODEL_USERNAME_FIELD is None:
            # If allauth is set to no username model field, remove username from serializer
            fields_to_remove.append('username')

        # You could also add logic here if, for example, first_name/last_name were
        # part of the default serializer but you didn't want them at registration.

        for field_name in fields_to_remove:
            if field_name in self.fields:
                del self.fields[field_name]

    # The parent RegisterSerializer's save method should respect that USERNAME_FIELD
    # on your custom User model is 'email', so it will use the email to populate
    # what would have been the username.

class CustomPasswordResetSerializer(PasswordResetSerializer):
    
    @property
    def password_reset_form_class(self):
       return ScaffoldPasswordResetForm
    
    def get_email_options(self):
        
        def node_url_generator(request, user, temp_key):
            return "http://localhost:3000/reset-password?uidb64={{uid}}&token={{token}}"

        return {
            'subject_template_name': 'example_message.txt',
            'email_template_name': 'example_message.txt',
            'html_email_template_name': 'example_message.txt',
            'url_generator': node_url_generator
        }