# courses/api/serializers.py
from rest_framework import serializers
from courses.models import Course, Student, Instructor

class CourseSerializer(serializers.ModelSerializer):
    students = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Student.objects.all(), required=False
    )
    instructors = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Instructor.objects.all(), required=False
    )
    
    class Meta:
        model = Course
        fields = '__all__'

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = '__all__'

class InstructorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Instructor
        fields = '__all__'