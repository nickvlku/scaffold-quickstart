# backend/apps/users/adapters.py
from allauth.account.adapter import DefaultAccountAdapter
from django.conf import settings
from django.urls import reverse


class CustomAccountAdapter(DefaultAccountAdapter):
    """Custom adapter to redirect email confirmation links to frontend"""
    
    def get_email_confirmation_url(self, request, emailconfirmation):
        """
        Override to return frontend URL for email confirmation
        """
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        key = emailconfirmation.key
        return f"{frontend_url}/confirm-email/{key}"
    
    def send_confirmation_mail(self, request, emailconfirmation, signup):
        """
        Send email confirmation with frontend URL and invalidate old tokens
        """
        # SECURITY: Invalidate any old confirmation tokens before sending new email
        from allauth.account.models import EmailConfirmation
        
        # Get all existing confirmations for this email address (excluding the current one)
        old_confirmations = EmailConfirmation.objects.filter(
            email_address=emailconfirmation.email_address
        ).exclude(key=emailconfirmation.key)
        
        deleted_count = old_confirmations.count()
        if deleted_count > 0:
            old_confirmations.delete()
        
        # This ensures the confirmation URL uses our frontend URL
        return super().send_confirmation_mail(request, emailconfirmation, signup)
    
