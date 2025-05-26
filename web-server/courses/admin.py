# courses/admin.py
from django.contrib import admin
from .models import Course, Student, Instructor

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('number', 'name', 'term', 'section', 'department')
    search_fields = ('name', 'number', 'department')
    list_filter = ('term', 'department')

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('student_id', 'name', 'preferred_name')
    search_fields = ('student_id', 'name', 'preferred_name')
    filter_horizontal = ('courses',)

@admin.register(Instructor)
class InstructorAdmin(admin.ModelAdmin):
    list_display = ('instructor_id', 'name', 'preferred_name', 'department')
    search_fields = ('instructor_id', 'name', 'department')
    filter_horizontal = ('courses',)