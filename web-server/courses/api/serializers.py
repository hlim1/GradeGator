# courses/api/serializers.py
from rest_framework import serializers
from courses.models import Course, Student, Instructor, CourseInstructorRole

class CourseInstructorRoleSerializer(serializers.ModelSerializer):
    instructor_id = serializers.CharField(source='instructor.instructor_id', read_only=True)
    name = serializers.CharField(source='instructor.name', read_only=True)
    preferred_name = serializers.CharField(source='instructor.preferred_name', read_only=True)
    email = serializers.EmailField(source='instructor.user.email', read_only=True)

    class Meta:
        model = CourseInstructorRole
        fields = ['instructor_id', 'name', 'preferred_name', 'email', 'role_type']

class CourseSerializer(serializers.ModelSerializer):
    students = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Student.objects.all(), required=False
    )
    instructors = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = '__all__'

    def get_instructors(self, course):
        roles = CourseInstructorRole.objects.filter(course=course).select_related('instructor__user')
        return CourseInstructorRoleSerializer(roles, many=True).data

class StudentSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Student
        fields = '__all__'

class InstructorSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Instructor
        fields = '__all__'
