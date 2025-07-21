from django.db import models
from django.conf import settings

class Student(models.Model):
    """Model representing a student"""
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='student_profile', primary_key=True)
    student_id = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=200)
    preferred_name = models.CharField(max_length=200, blank=True, null=True)

    def __str__(self):
        display_name = self.preferred_name if self.preferred_name else self.name
        return f"{self.student_id}: {display_name}"


class Instructor(models.Model):
    """Model representing an instructor"""
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='instructor_profile', primary_key=True)
    instructor_id = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=200)
    preferred_name = models.CharField(max_length=200, blank=True, null=True)
    department = models.CharField(max_length=100)

    def __str__(self):
        display_name = self.preferred_name if self.preferred_name else self.name
        return f"{self.instructor_id}: {display_name}"


class Course(models.Model):
    """Model representing a course"""
    name = models.CharField(max_length=200)
    number = models.CharField(max_length=20)
    term = models.CharField(max_length=50)
    section = models.CharField(max_length=20)
    department = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    active = models.BooleanField(default=True)
    # students = models.ManyToManyField(Student, through='CourseStudent', related_name='courses', blank=True)
    code = models.CharField(max_length=20)

    def __str__(self):
        return f"{self.number}: {self.name} ({self.term})"


class CourseInstructorRole(models.Model):
    """Custom through model for Instructor per-course roles and name"""
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    instructor = models.ForeignKey(Instructor, on_delete=models.CASCADE)
    role_type = models.CharField(
        max_length=20,
        choices=[("instructor", "Instructor"), ("TA", "TA"), ("owner", "Owner")],
        default="instructor"
    )
    name = models.CharField(max_length=200)
    preferred_name = models.CharField(max_length=200, blank=True, null=True)

    class Meta:
        unique_together = ('course', 'instructor')

    def __str__(self):
        display_name = self.preferred_name if self.preferred_name else self.name
        return f"{self.instructor.instructor_id} in {self.course.code} ({self.role_type}): {display_name}"


class CourseStudent(models.Model):
    """Custom through model for Student per-course name handling"""
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    preferred_name = models.CharField(max_length=200, blank=True, null=True)

    class Meta:
        unique_together = ('course', 'student')

    def __str__(self):
        display_name = self.preferred_name if self.preferred_name else self.name
        return f"{self.student.student_id} in {self.course.code}: {display_name}"

