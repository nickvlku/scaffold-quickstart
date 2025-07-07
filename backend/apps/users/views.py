from django.shortcuts import render
from dj_rest_auth.registration.views import RegisterView
from dj_rest_auth.jwt_auth import set_jwt_cookies
from dj_rest_auth.app_settings import api_settings
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from django.contrib.auth import get_user_model

User = get_user_model()

# Create your views here.

class CustomRegisterView(RegisterView):
    """
    Custom registration view that sets JWT cookies like LoginView does.
    
    The default dj-rest-auth RegisterView only returns tokens in response body
    but doesn't set HttpOnly cookies. This custom view fixes that by calling
    set_jwt_cookies() just like LoginView does.
    """
    
    def create(self, request, *args, **kwargs):
        # Call the parent create method to handle registration
        response = super().create(request, *args, **kwargs)
        
        # If registration was successful and we're using JWT
        if (response.status_code == status.HTTP_201_CREATED and 
            api_settings.USE_JWT and 
            hasattr(self, 'access_token')):
            
            # Set JWT cookies like LoginView does
            set_jwt_cookies(response, self.access_token, self.refresh_token)
            
        return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def protected_user_detail(request):
    """
    Protected endpoint that returns detailed user information.
    Requires authentication via JWT token.
    """
    user = request.user
    
    # Return all user fields except password
    user_data = {
        'id': user.id,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'is_active': user.is_active,
        'is_staff': user.is_staff,
        'is_superuser': user.is_superuser,
        'date_joined': user.date_joined,
        'last_login': user.last_login,
        'email_verified_at': user.email_verified_at,
        # Add any other fields from your custom User model
    }
    
    return Response({
        'message': 'Access granted! Here is your protected user data.',
        'user': user_data,
        'authenticated': True,
        'timestamp': user.date_joined,
    })




class CustomResendEmailVerificationView(APIView):
    """
    Custom resend email verification view that invalidates old tokens before creating new ones.
    This prevents token accumulation and reduces security risks.
    """
    permission_classes = (AllowAny,)
    
    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        if not email:
            return Response(
                {'detail': 'Email is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Find the email address object
            from allauth.account.models import EmailAddress, EmailConfirmation
            
            email_address = EmailAddress.objects.filter(email=email).first()
            if not email_address:
                # For security, don't reveal if email exists - just return success
                return Response(
                    {'detail': 'If this email is registered, a verification email will be sent.'},
                    status=status.HTTP_200_OK
                )
            
            # Check if already verified
            if email_address.verified:
                return Response(
                    {'detail': 'Email address is already verified.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # SECURITY: Delete any existing confirmation tokens for this email
            old_confirmations = EmailConfirmation.objects.filter(email_address=email_address)
            deleted_count = old_confirmations.count()
            old_confirmations.delete()
            
            # Create new confirmation token
            new_confirmation = EmailConfirmation.create(email_address)
            new_confirmation.save()
            
            # Send the verification email
            new_confirmation.send(request, signup=False)
            
            return Response(
                {'detail': 'Verification email sent.'},
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            return Response(
                {'detail': 'Failed to send verification email.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
