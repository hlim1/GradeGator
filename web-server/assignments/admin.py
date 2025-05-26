# assignments/admin.py
from django.contrib import admin
from .models import Assignment, Submission, SubmissionFile, StudentAccommodation, GradingRubric

class GradingRubricInline(admin.StackedInline):
    model = GradingRubric
    extra = 1
    
@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'assignment_id', 'course', 'grade_method', 'due_date', 'is_visible_to_students')
    list_filter = ('course', 'grade_method', 'is_visible_to_students')
    search_fields = ('title', 'assignment_id', 'course__name')
    inlines = [GradingRubricInline]

class SubmissionFileInline(admin.TabularInline): 
    model = SubmissionFile
    extra = 1

@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ('student', 'assignment', 'submission_time')
    list_filter = ('assignment__course', 'submission_time')
    search_fields = ('student__name', 'assignment__title')
    inlines = [SubmissionFileInline]

@admin.register(StudentAccommodation)
class StudentAccommodationAdmin(admin.ModelAdmin):
    list_display = ('student', 'assignment', 'extra_time')
    list_filter = ('assignment__course',)
    search_fields = ('student__name', 'assignment__title')