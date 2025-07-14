# assignments/api/serializers.py 
from rest_framework import serializers
from assignments.models import Assignment, Submission, SubmissionFile, GradingRubric, StudentAccommodation
from grading.models import Grade, Feedback
from courses.models import Student
from courses.api.serializers import StudentSerializer

class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = '__all__'
        extra_kwargs = {
            'questions': {'required': False}
        }

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

    student_detail = StudentSerializer(source='student', read_only=True)

    # NEW FIELD for frontend filtering
    status = serializers.SerializerMethodField()

    class Meta:
        model = Submission
        fields = '__all__'  # this includes 'status' because it's defined above

    def get_status(self, submission):
        # 1. Check if this submission is graded
        if Grade.objects.filter(submission=submission, is_finalized=True).exists():
            return 'graded'
        else:
            return 'ungraded'

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
