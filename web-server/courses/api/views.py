# courses/api/views.py
from rest_framework import viewsets, status
from rest_framework.response import Response
from courses.models import Course, Student, Instructor
from .serializers import CourseSerializer, StudentSerializer, InstructorSerializer
from .permissions import IsAdminOrInstructor
from drf_spectacular.utils import extend_schema, extend_schema_view

@extend_schema_view(
    list=extend_schema(description="List all courses"),
    create=extend_schema(description="Create a new course"),
    retrieve=extend_schema(description="Get details of a specific course"),
    update=extend_schema(description="Update an existing course"),
    partial_update=extend_schema(description="Partially update an existing course"),
    destroy=extend_schema(description="Delete a course")
)
class CourseViewSet(viewsets.ModelViewSet):
    """
    API endpoint for courses.
    Allows listing, creating, retrieving, updating, and deleting courses.
    """
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    # permission_classes = [IsAdminOrInstructor]

@extend_schema_view(
    list=extend_schema(description="List all students"),
    create=extend_schema(description="Create a new student"),
    retrieve=extend_schema(description="Get details of a specific student"),
    update=extend_schema(description="Update an existing student"),
    partial_update=extend_schema(description="Partially update an existing student"),
    destroy=extend_schema(description="Delete a student")
)
class StudentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for students.
    Allows listing, creating, retrieving, updating, and deleting students.
    """
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

@extend_schema_view(
    list=extend_schema(description="List all instructors"),
    create=extend_schema(description="Create a new instructor"),
    retrieve=extend_schema(description="Get details of a specific instructor"),
    update=extend_schema(description="Update an existing instructor"),
    partial_update=extend_schema(description="Partially update an existing instructor"),
    destroy=extend_schema(description="Delete an instructor")
)
class InstructorViewSet(viewsets.ModelViewSet):
    """
    API endpoint for instructors.
    Allows listing, creating, retrieving, updating, and deleting instructors.
    """
    queryset = Instructor.objects.all()
    serializer_class = InstructorSerializer