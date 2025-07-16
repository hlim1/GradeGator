from django.contrib import admin
from .models import Course, Student, Instructor, CourseInstructorRole

# 👇 Inline for managing instructors from within the Course admin
class CourseInstructorRoleInline(admin.TabularInline):
    model = CourseInstructorRole
    extra = 1  # Show one blank row for adding new instructor
    autocomplete_fields = ['instructor']  # Optional: if you have a lot of instructors
    fields = ['instructor', 'role_type']  # Display these fields inline

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('number', 'name', 'term', 'section', 'department')
    search_fields = ('name', 'number', 'department')
    list_filter = ('term', 'department')
    inlines = [CourseInstructorRoleInline]  # 👈 Enables inline editing

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('student_id', 'name', 'preferred_name')
    search_fields = ('student_id', 'name', 'preferred_name')
    filter_horizontal = ('courses',)

@admin.register(Instructor)
class InstructorAdmin(admin.ModelAdmin):
    list_display = ('instructor_id', 'name', 'preferred_name', 'department')
    search_fields = ('instructor_id', 'name', 'department')
