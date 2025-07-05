from django.conf import settings
from django.contrib.sites.shortcuts import get_current_site
from django.urls import reverse


if 'allauth' in settings.INSTALLED_APPS:
    from allauth.account import app_settings as allauth_account_settings
    from allauth.account.adapter import get_adapter
    from allauth.account.forms import ResetPasswordForm as DefaultPasswordResetForm
    from allauth.account.forms import default_token_generator
    from allauth.account.utils import (
        filter_users_by_email,
        user_pk_to_url_str,
        user_username,
    )


class ScaffoldPasswordResetForm(DefaultPasswordResetForm):
    def clean_email(self):
        """
        Invalid email should not raise error, as this would leak users
        for unit test: test_password_reset_with_invalid_email
        """
        email = self.cleaned_data["email"]
        email = get_adapter().clean_email(email)
        self.users = filter_users_by_email(email, is_active=True)
        return self.cleaned_data["email"]

    def save(self, request, **kwargs):
        current_site = get_current_site(request)
        email = self.cleaned_data['email']
        token_generator = kwargs.get('token_generator', default_token_generator)

        for user in self.users:

            temp_key = token_generator.make_token(user)

            # save it to the password reset model
            # password_reset = PasswordReset(user=user, temp_key=temp_key)
            # password_reset.save()

            # send the password reset email
            # url_generator = kwargs.get('url_generator', default_url_generator)
            # url = url_generator(request, user,     temp_key)
            uid = user_pk_to_url_str(user)

            context = {
                'current_site': current_site,
                'user': user,
                'request': request,
                'token': temp_key,
                'uid': uid,
            }
            # Check if username is needed (for non-email authentication methods)
            # Using modern allauth settings to avoid deprecation warnings
            login_methods = getattr(allauth_account_settings, 'LOGIN_METHODS', ['email'])
            if 'username' in login_methods:
                context['username'] = user_username(user)
            
            # Use the email options from the serializer if available
            template_prefix = kwargs.get('email_template_name', 'users/example_message')
            # Remove the file extension if present since allauth will add _subject.txt and _message.txt
            if template_prefix.endswith('.txt'):
                template_prefix = template_prefix[:-4]
            
            # Get URL generator from kwargs if provided
            url_generator = kwargs.get('url_generator', None)
            if url_generator:
                context['reset_url'] = url_generator(request, user, temp_key)
            
            get_adapter(request).send_mail(
                template_prefix, email, context
            )
        return self.cleaned_data['email']
