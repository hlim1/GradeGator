# assignments/api/serializers.py 
from rest_framework import serializers
from assignments.models import Assignment, Submission, SubmissionFile, GradingRubric
from grading.models import Grade, Feedback
from courses.models import Student

class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = '__all__'

class SubmissionFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubmissionFile
        fields = ['file']

class SubmissionSerializer(serializers.ModelSerializer):
    uploaded_files = SubmissionFileSerializer(source='submissionfile_set', many=True, read_only=True)
    files = serializers.ListField(
        child=serializers.FileField(),
        write_only=True,
        required=False
    )

    student = serializers.PrimaryKeyRelatedField(queryset=Student.objects.all())
    assignment = serializers.PrimaryKeyRelatedField(queryset=Assignment.objects.all())

    class Meta:
        model = Submission
        fields = '__all__'

    def create(self, validated_data):
        files_data = validated_data.pop('files', [])
        assignment_id = validated_data.get('assignment').id
        student_id = validated_data.get('student').user_id
    
        submission = Submission.objects.create(**validated_data)
    
        submission_id = submission.id
    
        for file in files_data:
            original_name = file.name
            new_name = f"{assignment_id}_{submission_id}_{student_id}_{original_name}"
            file.name = new_name
            SubmissionFile.objects.create(submission=submission, file=file)
        return submission

class GradingRubricSerializer(serializers.ModelSerializer):
    class Meta:
        model = GradingRubric
        fields = '__all__'

    def create(self, validated_data):
        uploaded_file = validated_data['rubric_file']
        assignment_id = validated_data.get('assignment').id

        print(assignment_id)
        # Generate new filename
        original_name = uploaded_file.name
        new_name = f"{assignment_id}_{original_name}"
        uploaded_file.name = new_name

        return super().create(validated_data)