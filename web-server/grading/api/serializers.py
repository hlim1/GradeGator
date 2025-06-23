# grading/api/serializers.py
from rest_framework import serializers
from grading.models import Grade, Feedback, GradingResult

class GradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grade
        fields = '__all__'

class GradingResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = GradingResult
        fields = ['s3_folder', 'result_data']

class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = '__all__'