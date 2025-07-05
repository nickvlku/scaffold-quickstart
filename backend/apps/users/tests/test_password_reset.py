from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from django.test import Client
from django.core import mail
from django.urls import reverse

User = get_user_model()

class PasswordResetAPITestCase(TestCase):
    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    def test_password_reset_api(self):
        """Test password reset API endpoint"""
        print("=== Testing Password Reset API ===")
        
        # Create a test user
        test_email = "apitest@example.com"
        user = User.objects.create_user(
            email=test_email,
            password="testpass123",
            is_active=True
        )
        print(f"1. Created test user: {test_email}")
        
        # Create Django test client
        client = Client()
        
        # Clear any existing emails
        mail.outbox.clear()
        
        # Test the password reset API endpoint
        print("\n2. Testing /api/auth/password/reset/ endpoint...")
        
        response = client.post(
            '/api/auth/password/reset/',
            {'email': test_email},
            content_type='application/json'
        )
        
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.content.decode()}")
        
        # Check if email was sent
        print(f"\n3. Emails in outbox: {len(mail.outbox)}")
        if mail.outbox:
            email = mail.outbox[0]
            print(f"   Email subject: {email.subject}")
            print(f"   Email to: {email.to}")
            print(f"   Email body preview: {email.body[:100]}...")
        else:
            print("   No emails found in outbox")
        
        # Test with invalid email
        print("\n4. Testing with invalid email...")
        response = client.post(
            '/api/auth/password/reset/',
            {'email': 'nonexistent@example.com'},
            content_type='application/json'
        )
        
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.content.decode()}")
        print(f"   Emails in outbox after invalid email: {len(mail.outbox)}")
        
        # The test should assert that password reset works
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)  # Should have one email
        
        # Test that email contains expected content
        email = mail.outbox[0]
        self.assertIn('password reset', email.subject.lower())
        self.assertIn(test_email, email.to)