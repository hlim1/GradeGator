# courses/api/views.py

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from courses.models import Course, Student, Instructor, CourseInstructorRole
from .serializers import CourseSerializer, StudentSerializer, InstructorSerializer
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

        roles = CourseInstructorRole.objects.filter(instructor__user_id=user_id).select_related('course', 'instructor')
        for role in roles:
            course = role.course
            results.append({
                "id": course.id,
                "name": course.name,
                "number": course.number,
                "term": course.term,
                "section": course.section,
                "department": course.department,
                "code": course.code,
                "role": role.role_type
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

    @action(detail=True, methods=['post'], url_path='add_user')
    def add_user(self, request, pk=None):
        course = self.get_object()
        user_id = request.data.get('user_id')
        role = request.data.get('role', 'instructor')

        if not user_id:
            return Response({'error': 'user_id is required'}, status=400)

        try:
            user = User.objects.get(id=user_id)
            full_name = user.get_full_name() or user.username
            preferred_name = user.preferred_name or full_name
            email = user.email or "N/A"
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

        if role in ['instructor', 'TA', 'owner']:
            instructor, _ = Instructor.objects.get_or_create(
                user=user,
                defaults={
                    'instructor_id': f"I{str(user.id).zfill(6)}",
                    'name': full_name,
                    'preferred_name': preferred_name,
                    'department': 'Not specified'
                }
            )

            cir, created = CourseInstructorRole.objects.get_or_create(
                course=course,
                instructor=instructor,
                defaults={'role_type': role}
            )

            if not created and cir.role_type != role:
                cir.role_type = role
                cir.save()
            print("Created: ", cir)
            return Response({'status': f'{role} added', 'email': email})

        elif role == 'student':
            student, _ = Student.objects.get_or_create(
                user=user,
                defaults={
                    'student_id': f"S{str(user.id).zfill(6)}",
                    'name': full_name,
                    'preferred_name': preferred_name
                }
            )
            if course.students.filter(user=user).exists():
                return Response({'status': 'already enrolled as student', 'email': email})
            course.students.add(student)
            return Response({'status': 'student added', 'email': email})

        return Response({'error': 'Invalid role'}, status=400)

    @action(detail=True, methods=['post'], url_path='change-role')
    def change_role(self, request, pk=None):
        course = self.get_object()
        user_id = request.data.get('user_id')
        requested_role = request.data.get('requested_role', 'instructor')

        if not user_id:
            return Response({'error': 'user_id is required'}, status=400)

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

        if requested_role not in ['student', 'instructor', 'TA', 'owner']:
            return Response({'error': 'Invalid role'}, status=400)

        # Remove user from all roles for this course
        CourseInstructorRole.objects.filter(course=course, instructor__user=user).delete()
        course.students.remove(Student.objects.filter(user=user).first())

        if requested_role == 'student':
            student, _ = Student.objects.get_or_create(
                user=user,
                defaults={
                    'student_id': f"S{str(user.id).zfill(6)}",
                    'name': user.get_full_name(),
                    'preferred_name': getattr(user, 'preferred_name', user.get_full_name())
                }
            )
            course.students.add(student)
        else:
            instructor, _ = Instructor.objects.get_or_create(
                user=user,
                defaults={
                    'instructor_id': f"I{str(user.id).zfill(6)}",
                    'name': user.get_full_name(),
                    'preferred_name': getattr(user, 'preferred_name', user.get_full_name()),
                    'department': 'Not specified'
                }
            )
            CourseInstructorRole.objects.create(
                course=course,
                instructor=instructor,
                role_type=requested_role
            )

        return Response({'message': f'User switched to {requested_role}'})

    @action(detail=True, methods=['get'], url_path='roster')
    def get_roster(self, request, pk=None):
        course = self.get_object()
        students_data = StudentSerializer(course.students.all(), many=True).data

        cirs = CourseInstructorRole.objects.filter(course=course).select_related('instructor')
        instructors_data = InstructorSerializer(
            [c.instructor for c in cirs if c.role_type == 'instructor'],
            many=True
        ).data
        tas_data = InstructorSerializer(
            [c.instructor for c in cirs if c.role_type == 'TA'],
            many=True
        ).data
        owners_data = InstructorSerializer(
            [c.instructor for c in cirs if c.role_type == 'owner'],
            many=True
        ).data

        return Response({
            'students': students_data,
            'instructors': instructors_data,
            'tas': tas_data,
            'owners': owners_data,
        })

    @action(detail=True, methods=['get'], url_path='user-role')
    def get_user_role(self, request, pk=None):
        course = self.get_object()
        user = request.user

        cir = CourseInstructorRole.objects.filter(course=course, instructor__user=user).first()
        if cir:
            return Response({"role": cir.role_type})

        if course.students.filter(user=user).exists():
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
