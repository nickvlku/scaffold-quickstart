from django.shortcuts import render
from dj_rest_auth.registration.views import RegisterView
from dj_rest_auth.jwt_auth import set_jwt_cookies
from dj_rest_auth.app_settings import api_settings
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
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
        # Add any other fields from your custom User model
    }
    
    return Response({
        'message': 'Access granted! Here is your protected user data.',
        'user': user_data,
        'authenticated': True,
        'timestamp': user.date_joined,
    })
