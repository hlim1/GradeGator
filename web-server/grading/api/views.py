# grading/api/views.py
import json
from rest_framework import viewsets
from grading.models import Grade, Feedback
from assignments.models import Submission
from .serializers import GradeSerializer, FeedbackSerializer
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import viewsets, status
from drf_spectacular.utils import extend_schema, extend_schema_view

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

    # Allow file uploads + form data
    parser_classes = [MultiPartParser, FormParser]

    def create(self, request, *args, **kwargs):
        data = request.data.copy()

        # 1) pull submission_id
        submission_id = data.get('submission')
        if not submission_id:
            return Response({'error': 'submission ID required'}, status=400)

        # 2) parse your JSON blob from the 'result_data' field
        raw = data.get('result_data')
        try:
            result = json.loads(raw) if raw else {}
        except json.JSONDecodeError:
            return Response({'error': 'invalid result_data'}, status=400)

        # 3) map result keys into Grade fields
        raw_output = result.get('output', '')
        start = raw_output.find('{')
        if start != -1:
            try:
                nested = json.loads(raw_output[start:])
            except json.JSONDecodeError:
                nested = {}
        else:
            nested = {}

        # 3.1) map into Grade fields
        data['score']    = nested.get('total')
        data['feedback'] = json.dumps(nested)

        # 4) ensure the submission exists
        try:
            Submission.objects.get(id=submission_id)
        except Submission.DoesNotExist:
            return Response({'error': 'submission not found'}, status=404)
        print("FILES RECEIVED:", request.FILES)
        uploaded_file = request.FILES.get('file')
        print("Uploaded file:", uploaded_file)
        grade, created = Grade.objects.update_or_create(
            submission_id=submission_id,
            defaults={
                'score': data['score'],
                'feedback': data['feedback'],
                'is_finalized': True,
                'submitted_file': uploaded_file if uploaded_file else None,  # <-- here!
            }
        )
        print("Grade.submitted_file:", grade.submitted_file)
        print("Grade.submitted_file.url:", grade.submitted_file.url if grade.submitted_file else "None")
        # 6) serialize and return
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
