from django.db import models
from django.conf import settings
from assignments.models import Submission
from django.db.models import JSONField

class Grade(models.Model):
    submission = models.OneToOneField(Submission, on_delete=models.CASCADE, related_name='grade')
    score = models.FloatField(null=True, blank=True)
    feedback = models.TextField(blank=True, null=True)
    graded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, 
                                null=True, blank=True)
    grading_time = models.DateTimeField(auto_now=True)
    is_finalized = models.BooleanField(default=False)
    question_scores = models.JSONField(default=dict)
    submitted_file = models.FileField(upload_to='submitted_code/', null=True, blank=True)    
    submitted_code_text = models.TextField(null=True, blank=True)
    submitted_files_json = models.JSONField(null=True, blank=True)
    total_points_possible = models.FloatField(null=True, blank=True)
    auto_points = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"Grade for {self.submission.student} on {self.submission.assignment}"


class Feedback(models.Model):
    """Model for inline feedback on submissions"""
    grade = models.ForeignKey(Grade, on_delete=models.CASCADE, related_name='feedback_items')
    comment = models.TextField()
    position = models.CharField(max_length=100, help_text="Position reference in the submission")
    created_at = models.DateTimeField(auto_now_add=True)
    acknowledged_by_student = models.BooleanField(default=False)
    metadata = models.JSONField(default=dict)
    
    def __str__(self):
        return f"Feedback on {self.grade.submission.assignment}"
