# assignments/api/serializers.py
from rest_framework import serializers
from assignments.models import Assignment, Submission, SubmissionFile, GradingRubric, StudentAccommodation
from grading.models import Grade, Feedback
from courses.models import Student
from courses.api.serializers import StudentSerializer
from grade_gator.storage_backends import UngradedSubmissionsStorage,ManualUngradedStorage
import boto3
from django.conf import settings

class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = '__all__'
        extra_kwargs = {
            'questions': {'required': False}
        }

class SubmissionFileSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = SubmissionFile
        fields = ['id', 'file', 'url']

    def get_url(self, obj):
        s3 = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME
        )

        presigned_url = s3.generate_presigned_url(
            'get_object',
            Params={'Bucket': obj.file.storage.bucket_name, 'Key': obj.file.name},
            ExpiresIn=3600  # 1 hour validity
        )
        return presigned_url

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
        assignment = validated_data.get('assignment')
        submission_file = validated_data.pop('submission_file', None)
        student_id = validated_data.get('student').user_id

        submission = Submission.objects.create(**validated_data)

        autograderName = getattr(assignment, "autograder_name", None)

        if autograderName:
            storage = UngradedSubmissionsStorage()
        else:
            storage = ManualUngradedStorage()

        if submission_file:
            submission_file.storage = storage
            original_name = submission_file.name
            new_name = f"{assignment.id}_{submission.id}_{student_id}_{original_name}"
            submission_file.name = new_name
            submission.submission_file = submission_file
            submission.save()

        for file in files_data:
            file.storage = storage
            original_name = file.name
            new_name = f"{assignment.id}_{submission.id}_{student_id}_{original_name}"
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
