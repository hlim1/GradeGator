# assignments/api/views.py
from rest_framework import viewsets
from assignments.models import Assignment, Submission, GradingRubric
from .serializers import AssignmentSerializer, SubmissionSerializer, GradingRubricSerializer
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework.decorators import action
from rest_framework.generics import GenericAPIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from grade_gator.storage_backends import ProfessorTestCasesStorage
import boto3
import json
import uuid

@extend_schema_view(
    list=extend_schema(description="List all assignments"),
    create=extend_schema(description="Create a new assignment"),
    retrieve=extend_schema(description="Get details of a specific assignment"),
    update=extend_schema(description="Update an existing assignment"),
    partial_update=extend_schema(description="Partially update an existing assignment"),
    destroy=extend_schema(description="Delete an assignment")
)
class AssignmentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for assignments.
    Allows listing, creating, retrieving, updating, and deleting assignments.
    """
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer

    @action(detail=True, methods=['post'], url_path='outline')
    def outline(self, request, pk=None):
        assignment = self.get_object()
        outline = request.data.get('outline')

        if not isinstance(outline, list):
            return Response({'error': 'Outline must be a list.'}, status=status.HTTP_400_BAD_REQUEST)

        assignment.questions = outline
        assignment.save()

        return Response(self.get_serializer(assignment).data, status=status.HTTP_200_OK)

@extend_schema(
    description="Upload a submission with one or more files",
    request={
        'multipart/form-data': {
            'type': 'object',
            'properties': {
                'student': {'type': 'integer', 'description': 'ID of the student uploading the submission'},
                'assignment': {'type': 'integer', 'description': 'ID of the related assignment'},
                'files': {
                    'type': 'array',
                    'items': {'type': 'string', 'format': 'binary'},
                    'description': 'List of files to upload'
                }
            },
            'required': ['student', 'assignment', 'files']
        }
    },
    responses={
        201: {
            'type': 'object',
            'properties': {
                'id': {'type': 'integer'},
                'student': {'type': 'integer'},
                'assignment': {'type': 'integer'},
                'submission_time': {'type': 'string', 'format': 'date-time'},
                'files': {
                    'type': 'array',
                    'items': {'type': 'object', 'properties': {'file': {'type': 'string', 'format': 'uri'}}}
                }
            }
        },
        400: {
            'type': 'object',
            'properties': {
                'error': {'type': 'string'}
            }
        }
    }
)

class SubmissionViewSet(viewsets.ModelViewSet):
    """
    API endpoint for submissions.
    Allows listing, creating, retrieving, updating, and deleting submissions.
    
    For students, only their own submissions are visible.
    """
    serializer_class = SubmissionSerializer
    
    def get_queryset(self):
        queryset = Submission.objects.all()

        # Filter by student first
        student_id = self.request.query_params.get("student")
        if student_id:
            queryset = queryset.filter(student_id=student_id)

        # Then filter by assignment
        assignment_id = self.request.query_params.get("assignment")
        if assignment_id:
            queryset = queryset.filter(assignment_id=assignment_id)

        # Order descending by ID to get latest submissions first
        return queryset.order_by('-id')

    def list(self, request, *args, **kwargs):
      assignment_id = request.query_params.get("assignment")
      student_id = request.query_params.get("student")

      # If requesting specific student's latest submission
      if assignment_id and student_id:
          submission = self.get_queryset().first()
          if submission:
              serializer = self.get_serializer(submission)
              return Response(serializer.data)
          else:
              return Response({"detail": "No submission found."}, status=404)

      # Else, return only the latest submission per student for the assignment
      if assignment_id:
          all_submissions = self.get_queryset()
          latest_per_student = {}
          for submission in all_submissions:
              if submission.student_id not in latest_per_student:
                  latest_per_student[submission.student_id] = submission
          serializer = self.get_serializer(latest_per_student.values(), many=True)
          return Response(serializer.data)

      return super().list(request, *args, **kwargs)

class SubmissionUploadView(GenericAPIView):
    parser_classes = (MultiPartParser, FormParser)
    serializer_class = SubmissionSerializer

    def post(self, request, *args, **kwargs):
        from assignments.models import Assignment
        print("All assignments:", list(Assignment.objects.all().values('id', 'name')))

        # Debug what's being received
        print(f"Original data: {request.data}")
        print(f"Assignment ID from request: {request.data.get('assignment')}")
        print(f"Student ID from request: {request.data.get('student')}")
        
        # Try to get the objects directly to verify they exist
        try:
            from assignments.models import Assignment
            from courses.models import Student
            
            assignment_id = request.data.get('assignment')
            student_id = request.data.get('student')
            
            # Try to look up the objects to confirm they exist
            assignment = Assignment.objects.get(pk=assignment_id)
            student = Student.objects.get(pk=student_id)
            
            print(f"Found assignment: {assignment}")
            print(f"Found student: {student}")
        except Exception as e:
            print(f"Error looking up objects: {e}")
            # Continue anyway, as the serializer will handle validation

        # Process the submission
        serializer = self.get_serializer(data=request.data)
        
        if not serializer.is_valid():
            print(f"Serializer errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Save submission to get the record in the database
        submission = serializer.save()
        
        # Check if we have files in the request
        files = request.FILES.getlist('files')
        if not files:
            print("No files found in request")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        # Process each file
        for file_obj in files:
            filename = file_obj.name
            file_extension = filename.split('.')[-1].lower()
            
            # Map file extension to language for the autograder
            language_map = {
                'py': 'python',
                'java': 'java',
                'c': 'c',
                # Add more mappings as needed
            }
            
            language = language_map.get(file_extension, 'unknown')
            
            if language != 'unknown':
                # Define a unique job ID for this submission
                job_id = str(uuid.uuid4())
                
                # Trigger AWS autograding process
                try:
                    # Use boto3 to send a message to SQS or invoke a Lambda                 
                    sqs = boto3.client('sqs', 
                                    region_name=settings.AWS_S3_REGION_NAME,
                                    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                                    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY)
                    
                    # Prepare message with details needed for autograding
                    message = {
                        'job_id': job_id,
                        'submission_id': submission.id,
                        'file_key': submission.files.all()[0].file.name,  # Path in S3
                        'language': language
                    }
                    
                    # Send to SQS queue
                    sqs.send_message(
                        QueueUrl='https://sqs.{}.amazonaws.com/your-account-id/autograder-queue'.format(
                            settings.AWS_S3_REGION_NAME),
                        MessageBody=json.dumps(message)
                    )
                    
                    # Update submission with job ID for status tracking
                    submission.job_id = job_id
                    submission.save()
                    
                    # Return success with job ID for tracking
                    return Response({
                        'submission_id': submission.id,
                        'job_id': job_id,
                        'status': 'processing'
                    }, status=status.HTTP_202_ACCEPTED)
                
                except Exception as e:
                    # Log error and return failure response
                    print(f"Error triggering autograder: {str(e)}")
                    return Response({
                        'error': 'Failed to trigger autograding process',
                        'detail': str(e)
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
            # For unknown language or non-code submissions
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@extend_schema(
    request=GradingRubricSerializer,
    responses={201: GradingRubricSerializer},
    description="Upload a grading rubric (PDF/ZIP/etc) associated with an assignment"
)

class RubricUploadView(GenericAPIView):
    parser_classes = (MultiPartParser, FormParser)
    serializer_class = GradingRubricSerializer

    def post(self, request, *args, **kwargs):
        assignment_id = request.data.get("assignment")
        if not assignment_id:
            return Response({'error': 'Missing assignment ID'}, status=status.HTTP_400_BAD_REQUEST)

        # Instantiate your custom storage
        storage = ProfessorTestCasesStorage()
        bucket = storage.bucket  # This is a boto3 Bucket resource

        # List and delete matching object
        try:
            for obj in bucket.objects.all():
                key = obj.key
                print(f"Checking S3 key: {key}")
                if key.startswith(f"{assignment_id}_"):
                    print(f"Deleting matching autograder: {key}")
                    obj.delete()
                    break  # stop after first match
        except Exception as e:
            return Response({'error': 'Failed to delete existing autograder',
                             'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        file = request.FILES.get("file")
        if file:
            filename = file.name
            request.data["autograder_name"] = filename

        # Continue to save the uploaded file
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
