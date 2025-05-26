from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        form.base_fields['is_active'].initial = True  # Default to checked
        return form
    
    # Display fields in list view
    list_display = ('username', 'email', 'is_staff', 'is_student', 'is_instructor')
    list_filter = ('is_staff', 'is_student', 'is_instructor')
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email')}),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 
                      'groups', 'user_permissions'),
        }),
        ('Custom Roles', {'fields': ('is_student', 'is_instructor')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2', 'email',
                      'is_active', 'is_staff', 'is_superuser',
                      'is_student', 'is_instructor'),
        }),
    )
    
    # Add bulk actions
    actions = ['make_student', 'make_instructor']
    
    def make_student(self, request, queryset):
        updated = queryset.update(is_student=True)
        self.message_user(request, f"{updated} users marked as students")
    make_student.short_description = "Mark selected as students"
    
    def make_instructor(self, request, queryset):
        updated = queryset.update(is_instructor=True)
        self.message_user(request, f"{updated} users marked as instructors")
    make_instructor.short_description = "Mark selected as instructors"