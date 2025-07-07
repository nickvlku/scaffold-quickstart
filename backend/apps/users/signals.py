# backend/apps/users/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from allauth.account.models import EmailAddress
from allauth.account.signals import email_confirmed
from django.contrib.auth import get_user_model

User = get_user_model()


@receiver(email_confirmed)
def email_confirmed_handler(sender, request, email_address, **kwargs):
    """
    Signal handler that sets email_verified_at timestamp when email is confirmed.
    This is triggered by allauth when an email verification is successful.
    """
    user = email_address.user
    
    # Only set the timestamp if it hasn't been set before
    # This handles the case where a user might verify multiple email addresses
    if not user.email_verified_at:
        user.email_verified_at = timezone.now()
        user.save(update_fields=['email_verified_at'])


@receiver(post_save, sender=EmailAddress)
def email_address_verified_handler(sender, instance, created, **kwargs):
    """
    Backup signal handler that catches EmailAddress.verified changes.
    This handles edge cases where email_confirmed signal might not fire.
    """
    if not created and instance.verified:
        user = instance.user
        
        # Only set if not already set and this is the primary email
        if not user.email_verified_at and instance.primary:
            user.email_verified_at = timezone.now()
            user.save(update_fields=['email_verified_at'])