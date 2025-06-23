from django.db import models
from django.conf import settings
from assignments.models import Submission

class Grade(models.Model):
    submission = models.OneToOneField(Submission, on_delete=models.CASCADE, related_name='grade')
    score = models.FloatField(null=True, blank=True)
    feedback = models.TextField(blank=True, null=True)
    graded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, 
                                null=True, blank=True)
    grading_time = models.DateTimeField(auto_now=True)
    is_finalized = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Grade for {self.submission.student} on {self.submission.assignment}"


class Feedback(models.Model):
    """Model for inline feedback on submissions"""
    grade = models.ForeignKey(Grade, on_delete=models.CASCADE, related_name='feedback_items')
    comment = models.TextField()
    position = models.CharField(max_length=100, help_text="Position reference in the submission")
    created_at = models.DateTimeField(auto_now_add=True)
    acknowledged_by_student = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Feedback on {self.grade.submission.assignment}"

class GradingResult(models.Model):
    s3_folder = models.CharField(max_length=255)
    result_data = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.s3_folder
