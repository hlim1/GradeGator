# grading/api/views.py
import json
from rest_framework import viewsets
from grading.models import Grade, Feedback
from .serializers import GradeSerializer, FeedbackSerializer
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
