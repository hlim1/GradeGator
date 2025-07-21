# assignments/models.py
from django.db import models
from courses.models import Course
from accounts.models import User
import os
from grade_gator.storage_backends import UngradedSubmissionsStorage, ProfessorTestCasesStorage

def submission_upload_path(instance, filename):
    assignment_id = instance.submission.assignment.id
    student_id = instance.submission.student.id
    #return f'assignment{assignment_id}_student{student_id}/{filename}'
    return os.path.join(
        #'student-submissions',
        f'assignment{assignment_id}_user{student_id}',
        filename
    )

def rubric_upload_path(instance, filename):
    assignment_id = instance.assignment.id
    instructor_id = instance.instructor.id
    return os.path.join(
        'grading-rubrics',  # This part defines the folder inside "professor-test-cases"
        f'assignment{assignment_id}_instructor{instructor_id}',
        filename
    )

class Assignment(models.Model):
    """Model representing an assignment"""
    GRADE_METHOD_CHOICES = [
        ('POINTS', 'Points Based'),
        ('PERCENT', 'Percentage Based'),
        ('LETTER', 'Letter Grade'),
        ('STANDARDS', 'Standards Based'),
    ]
    
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='assignments')
    assignment_id = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=200)
    grade_method = models.CharField(max_length=10, choices=GRADE_METHOD_CHOICES, default='POINTS', blank=True)
    points = models.IntegerField(default=0)
    due_date = models.DateTimeField()
    release_date = models.DateTimeField()
    late_due_date = models.DateTimeField(null=True, blank=True)
    allow_late_submissions = models.BooleanField(default=False)
    is_visible_to_students = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_manually_graded = models.BooleanField(default=False)
    questions = models.JSONField(default=list)
    autograder_name = models.CharField(null=True)
    
    def __str__(self):
        return f"{self.name} ({self.assignment_id})"


class Submission(models.Model):
    """Model representing a student's submission for an assignment"""
    student = models.ForeignKey('courses.Student', on_delete=models.CASCADE, related_name='submissions')
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    submission_time = models.DateTimeField(auto_now_add=True)
    submission_file = models.FileField(upload_to="student-submissions/", blank=True, null=True)
        
    def __str__(self):
        return f"Submission by {self.student} for {self.assignment}"

class SubmissionFile(models.Model):
    submission = models.ForeignKey(Submission, on_delete=models.CASCADE, related_name='files')
    #file = models.FileField(upload_to="student-submissions/", blank=True, null=True)
    #file = models.FileField(upload_to=submission_upload_path)
    file = models.FileField(
        #upload_to=submission_upload_path, 
        storage=UngradedSubmissionsStorage(),   
        upload_to='', 
        blank=True,
        null=True,
    )

    def __str__(self):
        return f"File for {self.submission}"

class GradingRubric(models.Model):
    instructor = models.ForeignKey("courses.Instructor", on_delete=models.CASCADE, related_name="rubrics")
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name="rubrics")
    submission_time = models.DateTimeField(auto_now_add=True)
    #rubric_file = models.FileField(upload_to="grading-rubrics/", blank=True, null=True)
    #rubric_file = models.FileField(upload_to=rubric_upload_path, blank=True, null=True)
    rubric_file = models.FileField(storage=ProfessorTestCasesStorage(), upload_to='', blank=True, null=True)


    def __str__(self):
        return f"Rubric for {self.assignment} uploaded by {self.instructor}"


class StudentAccommodation(models.Model):
    """Model for individual student accommodations for assignments"""
    student = models.ForeignKey('courses.Student', on_delete=models.CASCADE, related_name='assignment_accommodations')
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='student_accommodations')
    extra_time = models.PositiveIntegerField(default=0, help_text="Extra time in minutes")
    special_instructions = models.TextField(blank=True, null=True)
    custom_due_date = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        unique_together = ('student', 'assignment')
    
    def __str__(self):
        return f"Accommodation for {self.student} on {self.assignment}"

# class Question(models.Model):
#     question_text = models.TextField
#     question_type = models.CharField(choices=["MULTIPLE CHOICE, ..."])
#     assignment = models.ForeignKey(Assignment, on_delete=models.DO_NOTHING)

#     def __str__(self):
#         return f"Question: {question_text}"
