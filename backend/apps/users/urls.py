from django.urls import path
from .views import protected_user_detail

urlpatterns = [
    path('protected/', protected_user_detail, name='protected_user_detail'),
]