# grading/admin.py
from django.contrib import admin
from .models import Grade, Feedback

@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = ('get_student', 'get_assignment', 'score', 'is_finalized', 'grading_time')
    list_filter = ('is_finalized', 'submission__assignment__course')
    search_fields = ('submission__student__name', 'submission__assignment__title')
    
    def get_student(self, obj):
        return obj.submission.student
    get_student.short_description = 'Student'
    
    def get_assignment(self, obj):
        return obj.submission.assignment
    get_assignment.short_description = 'Assignment'

@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ('get_student', 'get_assignment', 'acknowledged_by_student', 'created_at')
    list_filter = ('acknowledged_by_student', 'grade__submission__assignment__course')
    search_fields = ('grade__submission__student__name', 'comment')
    
    def get_student(self, obj):
        return obj.grade.submission.student
    get_student.short_description = 'Student'
    
    def get_assignment(self, obj):
        return obj.grade.submission.assignment
    get_assignment.short_description = 'Assignment'