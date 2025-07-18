# courses/api/serializers.py
from rest_framework import serializers
from courses.models import Course, Student, Instructor, CourseInstructorRole, CourseStudent

class CourseInstructorRoleSerializer(serializers.ModelSerializer):
    instructor_id = serializers.CharField(source='instructor.instructor_id', read_only=True)
    name = serializers.CharField(read_only=True)
    preferred_name = serializers.CharField(read_only=True)
    email = serializers.EmailField(source='instructor.user.email', read_only=True)
    user_id = serializers.IntegerField(source='instructor.user.id', read_only=True)

    class Meta:
        model = CourseInstructorRole
        fields = ['user_id', 'instructor_id', 'name', 'preferred_name', 'email', 'role_type']

class CourseStudentSerializer(serializers.ModelSerializer):
    student_id = serializers.CharField(source='student.student_id', read_only=True)
    name = serializers.CharField(read_only=True)
    preferred_name = serializers.CharField(read_only=True)
    email = serializers.EmailField(source='student.user.email', read_only=True)
    user_id = serializers.IntegerField(source='student.user.id', read_only=True)

    class Meta:
        model = CourseStudent
        fields = ['user_id', 'student_id', 'name', 'preferred_name', 'email']

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
