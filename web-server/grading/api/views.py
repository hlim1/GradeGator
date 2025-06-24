# grading/api/views.py
from rest_framework import viewsets
from grading.models import Grade, Feedback, GradingResult
from .serializers import GradeSerializer, FeedbackSerializer, GradingResultSerializer
from rest_framework.generics import GenericAPIView
from rest_framework.parsers import JSONParser
from rest_framework.response import Response
from rest_framework import status
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

@extend_schema(
    request=GradingResultSerializer,
    responses={201: GradingResultSerializer},
    description="Endpoint for Lambda to send grading result for a submission"
)
class GradingResultView(GenericAPIView):
    queryset = GradingResult.objects.all()
    serializer_class = GradingResultSerializer
    parser_classes = [JSONParser]
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, *args, **kwargs):
        assignment_id = request.query_params.get('assignment')
        student_id = request.query_params.get('student')

        queryset = self.get_queryset()
        if assignment_id:
            queryset = queryset.filter(assignment=assignment_id)
        if student_id:
            queryset = queryset.filter(student=student_id)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)