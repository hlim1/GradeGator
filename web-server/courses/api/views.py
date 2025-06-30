# courses/api/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
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
    #permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='by-code')
    def get_course_by_code(request):
        code = request.query_params.get('code')
        course = Course.objects.filter(code=code).first()
        if course:
            return Response({'id': course.id})

        return Response({'error': 'Course not found'}, status=404)

    @action(detail=False, methods=['get'])
    def by_user(self, request):
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response({"error": "user_id query param required"}, status=400)

        try:
            instructor = Instructor.objects.get(user_id=user_id)
            courses = instructor.courses.all()
        except Instructor.DoesNotExist:
            try:
                student = Student.objects.get(user_id=user_id)
                courses = student.courses.all()
            except Student.DoesNotExist:
                return Response({"courses": []})

        serializer = self.get_serializer(courses, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def add_user(self, request, pk=None):
        course = self.get_object()
        user_id = request.data.get('user_id')

        if not user_id:
            return Response({'error': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Try to add as instructor first
        try:
            instructor = Instructor.objects.get(user_id=user_id)
            course.instructors.add(instructor)
            return Response({'status': 'instructor added'})
        except Instructor.DoesNotExist:
            pass

        # Then try to add as student
        try:
            student = Student.objects.get(user_id=user_id)
            course.students.add(student)
            return Response({'status': 'student added'})
        except Student.DoesNotExist:
            return Response({'error': 'No student or instructor found for this user_id'}, status=status.HTTP_404_NOT_FOUND)

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