# courses/api/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from courses.models import Course, Student, Instructor
from .serializers import CourseSerializer, StudentSerializer, InstructorSerializer
from .permissions import IsAdminOrInstructor
from drf_spectacular.utils import extend_schema, extend_schema_view
from django.contrib.auth import get_user_model

User = get_user_model()

@extend_schema_view(
    list=extend_schema(description="List all courses"),
    create=extend_schema(description="Create a new course"),
    retrieve=extend_schema(description="Get details of a specific course"),
    update=extend_schema(description="Update an existing course"),
    partial_update=extend_schema(description="Partially update an existing course"),
    destroy=extend_schema(description="Delete a course")
)
class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

    @action(detail=False, methods=['get'], url_path='by-code')
    def get_course_by_code(self, request):
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

        results = []

        instructor_courses = Course.objects.filter(instructors__user_id=user_id)
        for course in instructor_courses:
            results.append({
                "id": course.id,
                "name": course.name,
                "number": course.number,
                "term": course.term,
                "section": course.section,
                "department": course.department,
                "code": course.code,
                "role": "instructor"
            })

        student_courses = Course.objects.filter(students__user_id=user_id).exclude(id__in=[c['id'] for c in results])
        for course in student_courses:
            results.append({
                "id": course.id,
                "name": course.name,
                "number": course.number,
                "term": course.term,
                "section": course.section,
                "department": course.department,
                "code": course.code,
                "role": "student"
            })

        return Response(results)

    @action(detail=True, methods=['post'], url_path='change-role')
    def change_role(self, request, pk=None):
        course = self.get_object()
        user_id = request.data.get('user_id')
        requested_role = request.data.get('requested_role')

        if not user_id:
            return Response({'error': 'user_id not found'}, status=status.HTTP_400_BAD_REQUEST)
        if not requested_role:
            return Response({'error': 'requested_role not found'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        role_map = {
            "student": (Student, "student_id", "S"),
            "instructor": (Instructor, "instructor_id", "I"),
        }

        if requested_role not in role_map:
            return Response({'error': 'Invalid requested_role'}, status=status.HTTP_400_BAD_REQUEST)

        TargetModel, id_field, prefix = role_map[requested_role]

        # Remove from all known roles in this course
        for Model in [Student, Instructor]:
            try:
                role_instance = Model.objects.get(user=user)
                role_instance.courses.remove(course)
            except Model.DoesNotExist:
                continue

        # Add to the new role
        user_id_str = str(user.id)
        role_instance, _ = TargetModel.objects.get_or_create(
            user=user,
            defaults={
                id_field: f"{prefix}{user_id_str.zfill(6)}",
                'name': user.name,
                'preferred_name': user.preferred_name,
            }
        )
        role_instance.courses.add(course)

        return Response({'message': f'User switched to {requested_role}'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def add_user(self, request, pk=None):
        course = self.get_object()
        user_id = request.data.get('user_id')
        role = request.data.get('role')
        if not user_id:
            return Response({'error': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        user_id_str = str(user_id)

        try:
            user = User.objects.get(id=user_id)
            full_name = user.get_full_name() or user.username
            preferred_name = user.preferred_name or full_name
            email = user.email or "N/A"
        except User.DoesNotExist:
            full_name = f"User {user_id_str}"
            preferred_name = f"User {user_id_str}"
            email = "N/A"

        if role == 'instructor':
            instructor, _ = Instructor.objects.get_or_create(
                user_id=user_id,
                defaults={
                    'instructor_id': f"I{user_id_str.zfill(6)}",
                    'name': full_name,
                    'preferred_name': preferred_name,
                    'department': 'Not specified'
                }
            )
            if not course.instructors.filter(user_id=user_id).exists():
                course.instructors.add(instructor)
                return Response({'status': 'instructor added', 'email': email})
            return Response({'error': 'Instructor already added'}, status=status.HTTP_400_BAD_REQUEST)

        elif role == 'student':
            student, _ = Student.objects.get_or_create(
                user_id=user_id,
                defaults={
                    'student_id': f"S{user_id_str.zfill(6)}",
                    'name': full_name,
                    'preferred_name': preferred_name
                }
            )
            if not course.students.filter(user_id=user_id).exists():
                course.students.add(student)
                return Response({'status': 'student added', 'email': email})
            return Response({'error': 'Student already added'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'error': 'Invalid role value. Must be "instructor" or "student".'}, status=400)

    @action(detail=True, methods=['get'], url_path='roster')
    def get_roster(self, request, pk=None):
        course = self.get_object()
        students = course.students.all()
        instructors = course.instructors.all()

        students_data = StudentSerializer(students, many=True).data
        instructors_data = InstructorSerializer(instructors, many=True).data

        return Response({
            'students': students_data,
            'instructors': instructors_data
        })

    @action(detail=True, methods=['get'], url_path='user-role')
    def get_user_role(self, request, pk=None):
        course = self.get_object()
        user = request.user

        if course.instructors.filter(user_id=user.id).exists():
            return Response({"role": "instructor"})
        elif course.students.filter(user_id=user.id).exists():
            return Response({"role": "student"})
        return Response({"error": "Not enrolled in this course"}, status=403)

@extend_schema_view(
    list=extend_schema(description="List all students"),
    create=extend_schema(description="Create a new student"),
    retrieve=extend_schema(description="Get details of a specific student"),
    update=extend_schema(description="Update an existing student"),
    partial_update=extend_schema(description="Partially update an existing student"),
    destroy=extend_schema(description="Delete a student")
)
class StudentViewSet(viewsets.ModelViewSet):
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
    queryset = Instructor.objects.all()
    serializer_class = InstructorSerializer
