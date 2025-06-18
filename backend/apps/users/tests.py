# backend/apps/users/tests.py
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError # For SemanticIDField collision test if needed directly
from apps.common.fields import SemanticIDField # To check instance type

User = get_user_model()

class UserManagerTests(TestCase):

    def test_create_user(self):
        user = User.objects.create_user(email='normal@user.com', password='foo')
        self.assertEqual(user.email, 'normal@user.com')
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
        try:
            # username is None for AbstractUser option
            self.assertIsNone(user.username)
        except AttributeError:
            # username attribute does not exist on the model
            self.assertFalse(hasattr(user, 'username'))

        with self.assertRaises(TypeError):
            # create_user should not take username as an argument if not in model
            User.objects.create_user() # Missing email
        with self.assertRaises(ValueError):
            User.objects.create_user(email='', password="foo") # Empty email

    def test_create_user_email_normalization(self):
        # Example of normalization: domain part to lowercase
        email_mixed_case_domain = "TestUser@EXAMPLE.COM"
        normalized_email = "TestUser@example.com" # UserManager should normalize this
        user = User.objects.create_user(email=email_mixed_case_domain, password="foo")
        self.assertEqual(user.email, normalized_email)

    def test_create_superuser(self):
        admin_user = User.objects.create_superuser(email='super@user.com', password='foo')
        self.assertEqual(admin_user.email, 'super@user.com')
        self.assertTrue(admin_user.is_active)
        self.assertTrue(admin_user.is_staff)
        self.assertTrue(admin_user.is_superuser)
        try:
            self.assertIsNone(admin_user.username)
        except AttributeError:
            self.assertFalse(hasattr(admin_user, 'username'))

        with self.assertRaises(ValueError):
            User.objects.create_superuser(
                email='super@user.com', password='foo', is_superuser=False)
        with self.assertRaises(ValueError):
            User.objects.create_superuser(
                email='super@user.com', password='foo', is_staff=False)

class UserModelTests(TestCase):

    def test_user_id_is_semantic_id_with_us_prefix(self):
        user = User.objects.create_user(email='test@example.com', password='password123')
        self.assertIsNotNone(user.id)
        self.assertIsInstance(User._meta.get_field('id'), SemanticIDField)
        self.assertTrue(user.id.startswith('US'))
        self.assertEqual(len(user.id), 32) # US + 30 chars

    def test_email_is_username_field(self):
        self.assertEqual(User.USERNAME_FIELD, 'email')

    def test_required_fields_for_createsuperuser(self):
        # As per our model, 'email' is USERNAME_FIELD, and REQUIRED_FIELDS is empty
        self.assertEqual(User.REQUIRED_FIELDS, [])

    def test_user_str_representation(self):
        user = User.objects.create_user(email='string@example.com', password='password123')
        self.assertEqual(str(user), 'string@example.com')

    def test_username_field_does_not_exist_or_is_none(self):
        # Depending on how AbstractUser is customized, 'username' might be None or not exist.
        user = User.objects.create_user(email='nousername@example.com', password='password123')
        if hasattr(User, 'username'): # Check if the attribute exists
             self.assertIsNone(getattr(user, 'username', None), "Username field should be None if it exists.")
        else:
            # If the attribute doesn't exist at all, this test passes implicitly.
            # You could add an explicit check if desired:
            with self.assertRaises(AttributeError):
                _ = user.username


    def test_email_is_unique(self):
        User.objects.create_user(email='unique@example.com', password='password123')
        with self.assertRaises(Exception): # Django raises IntegrityError for unique constraint
            User.objects.create_user(email='unique@example.com', password='anotherpassword')