# backend/apps/users/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    # Use the default UserAdmin fields and fieldsets, but adjust for no username
    list_display = ('id', 'email', 'first_name', 'last_name', 'is_staff', 'is_active')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'groups')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',) # Order by email is sensible

    # fieldsets for the add/change forms
    # Remove username from fieldsets if it's there from BaseUserAdmin
    # BaseUserAdmin.fieldsets has username, so we need to customize
    fieldsets = (
        (None, {'fields': ('id', 'email', 'password')}), # id is readonly by default if PK
        ('Personal info', {'fields': ('first_name', 'last_name')}),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    # For the 'add user' form, we also need to specify fields
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password', 'password2'), # password2 is for confirmation
        }),
    )
    readonly_fields = ('id', 'last_login', 'date_joined')

    # If you had 'username' in filter_horizontal or other places, remove it.