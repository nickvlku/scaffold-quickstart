"""
URL configuration for scaffold_project_config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),

    # allauth URLs are mostly for server-side processing of social auth flows,
    # email confirmation links, etc. They are not typically called directly by a SPA
    # except by redirecting the browser to them (e.g., for social login start).
    path('accounts/', include('allauth.urls')), # For social auth redirects, password reset confirm etc.

    # You can add your app-specific API URLs here later, e.g.:
    # path('api/users/', include('apps.users.urls')), # if you have custom user endpoints beyond auth
]
