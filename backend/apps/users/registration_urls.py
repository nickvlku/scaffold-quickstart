from django.urls import path
from .views import CustomRegisterView, CustomResendEmailVerificationView

urlpatterns = [
    path('', CustomRegisterView.as_view(), name='rest_register'),
    path('resend-email/', CustomResendEmailVerificationView.as_view(), name='custom_resend_email'),
]