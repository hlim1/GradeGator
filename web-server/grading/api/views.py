import json
from rest_framework.permissions import AllowAny
from rest_framework import viewsets
from grading.models import Grade, Feedback
from assignments.models import Submission
from .serializers import GradeSerializer, FeedbackSerializer
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import viewsets, status
from drf_spectacular.utils import extend_schema, extend_schema_view
from django.conf import settings

@extend_schema_view(
    list=extend_schema(description="List all grades"),
    create=extend_schema(description="Create a new grade"),
    retrieve=extend_schema(description="Get details of a specific grade"),
    update=extend_schema(description="Update an existing grade"),
    partial_update=extend_schema(description="Partially update an existing grade"),
    destroy=extend_schema(description="Delete a grade")
)
class GradeViewSet(viewsets.ModelViewSet):
    """
    API endpoint for grades.
    Allows listing, creating, retrieving, updating, and deleting grades.
    """
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer
    parser_classes = [MultiPartParser, FormParser]

    def list(self, request, *args, **kwargs):
        submission_id = request.query_params.get('submission')
        if submission_id:
            print(f"🔎 Checking for grade on submission {submission_id}")
            try:
                grade = Grade.objects.get(submission_id=int(submission_id))
                print("✅ Grade found")
            except Grade.DoesNotExist:
                print("❌ Grade does not exist yet")
                return Response({})
            serializer = self.get_serializer(grade)
            return Response(serializer.data)
        else:
            return super().list(request, *args, **kwargs)

    def initialize_request(self, request, *args, **kwargs):
        django_request = super().initialize_request(request, *args, **kwargs)
        if django_request.FILES:
            print("🔥 FILES detected BEFORE create()")
            for name, file in django_request.FILES.items():
                print(f"File name: {file.name}, size: {file.size}, content_type: {file.content_type}")
        return django_request

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        print("FILES RECEIVED:", request.FILES)

        submission_id = data.get('submission')
        if not submission_id:
            return Response({'error': 'submission ID required'}, status=400)
        print("Submission id currently used to make Grade object:", submission_id)

        raw = data.get('result_data')
        print("🔍 Raw result_data received from Lambda:", raw)
        try:
            result = json.loads(raw) if raw else {}
        except json.JSONDecodeError:
            return Response({'error': 'invalid result_data'}, status=400)

        raw_output = result.get('output', '')
        start = raw_output.find('{')
        if start != -1:
            try:
                nested = json.loads(raw_output[start:])
            except json.JSONDecodeError:
                nested = {}
        else:
            nested = {}

        submitted_files_json_str = data.get('submitted_files_json', '[]')
        try:
            submitted_files = json.loads(submitted_files_json_str)
        except json.JSONDecodeError:
            submitted_files = []

        first_file = submitted_files[0] if submitted_files else None

        try:
            Submission.objects.get(id=submission_id)
        except Submission.DoesNotExist:
            return Response({'error': 'submission not found'}, status=404)

        uploaded_file = request.FILES.get('file')
        print("Uploaded file:", uploaded_file)

        try:
            submission = Submission.objects.select_related('assignment').get(id=submission_id)
        except Submission.DoesNotExist:
            return Response({'error': 'submission not found'}, status=404)

        assignment = submission.assignment
        is_manual = assignment.is_manually_graded

        # Determine if this submission should be finalized
        is_finalized = not is_manual  # Finalized only if no manual grading needed

        defaults = {
            'score': nested.get('total'),
            'feedback': json.dumps(nested),
            'is_finalized': is_finalized,
            'submitted_files_json': submitted_files,
        }

        if uploaded_file:
            defaults['submitted_file'] = uploaded_file
            file_contents = uploaded_file.read().decode('utf-8')
            defaults['submitted_code_text'] = file_contents
        elif first_file:
            defaults['submitted_file'] = None
            defaults['submitted_code_text'] = first_file.get("code_text", "")

        grade, created = Grade.objects.update_or_create(
            submission_id=submission_id,
            defaults=defaults
        )

        print("✅ Grade created/updated for submission:", grade.submission.id)
        print("Grade OBJECT:", grade)
        serializer = self.get_serializer(grade)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )

@extend_schema_view(
    list=extend_schema(description="List all feedback items"),
    create=extend_schema(description="Create a new feedback item"),
    retrieve=extend_schema(description="Get details of a specific feedback item"),
    update=extend_schema(description="Update an existing feedback item"),
    partial_update=extend_schema(description="Partially update an existing feedback item"),
    destroy=extend_schema(description="Delete a feedback item")
)
class FeedbackViewSet(viewsets.ModelViewSet):
    """
    API endpoint for feedback.
    Allows listing, creating, retrieving, updating, and deleting feedback items.
    """
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer
