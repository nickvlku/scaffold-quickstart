# backend/apps/users/models.py
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.common.fields import SemanticIDField # Import our custom field

class UserManager(BaseUserManager):
    """
    Custom user model manager where email is the unique identifiers
    for authentication instead of usernames.
    """
    def create_user(self, email, password, **extra_fields):
        """
        Create and save a User with the given email and password.
        """
        if not email:
            raise ValueError(_('The Email must be set'))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, **extra_fields):
        """
        Create and save a SuperUser with the given email and password.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True) # Superusers should be active by default

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    # Override the id field to use our SemanticIDField
    # Note: For primary keys, Django typically wants them defined first.
    id = SemanticIDField(prefix='US', primary_key=True, editable=False)

    # Remove username, use email as the unique identifier
    username = None # We don't want a username field
    email = models.EmailField(_('email address'), unique=True)

    # You can add other fields here specific to your user model
    # e.g., first_name, last_name are already in AbstractUser
    # phone_number = models.CharField(max_length=20, blank=True, null=True)
    
    # Email verification timestamp
    email_verified_at = models.DateTimeField(
        _('email verified at'), 
        null=True, 
        blank=True,
        help_text=_('The date and time when the user\'s email was verified.')
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = [] # No username, so email is handled by USERNAME_FIELD.
                          # Add other fields here if they should be prompted for createsuperuser

    objects = UserManager() # Use our custom manager

    def __str__(self):
        return self.email

    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')
        # ordering = ['email'] # Optional: default ordering