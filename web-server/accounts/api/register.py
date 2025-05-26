# accounts/api/register.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from django.views.decorators.csrf import csrf_exempt
from drf_spectacular.utils import extend_schema
from django.db import transaction
from .serializers import RegisterSerializer, UserSerializer

User = get_user_model()

@extend_schema(
    description="Register a new user account. Only email and password are required fields.",
    request={
        'application/json': {
            'type': 'object',
            'properties': {
                'email': {'type': 'string', 'format': 'email'},
                'password': {'type': 'string', 'format': 'password'},
                'password_confirmation': {'type': 'string', 'format': 'password'},
                'username': {'type': 'string', 'description': 'Optional. If not provided, will be generated from email'},
                'first_name': {'type': 'string'},
                'last_name': {'type': 'string'},
                'preferred_name': {'type': 'string', 'description': 'Optional display name'},
                'is_student': {'type': 'boolean', 'default': False},
                'is_instructor': {'type': 'boolean', 'default': False},
            },
            'required': ['email', 'password', 'password_confirmation']
        }
    },
    responses={
        201: UserSerializer,
        400: {
            'type': 'object',
            'properties': {
                'error': {'type': 'string'},
                'detail': {'type': 'object'},
            }
        }
    },
    tags=["accounts"]
)
@csrf_exempt
@api_view(['POST'])
def register_user(request):
    """
    Register a new user in the system.
    
    This endpoint creates a new user with the provided details. 
    The user can be designated as a student or instructor (or both).
    """
    serializer = RegisterSerializer(data=request.data)
    
    if serializer.is_valid():
        with transaction.atomic():
            try:
                # Save the user
                user = serializer.save()
                
                # Create Student or Instructor profiles if applicable
                from courses.models import Student, Instructor
                
                # Get the display name (preferred_name > full_name > username)
                preferred_name = getattr(user, 'preferred_name', None)
                full_name = user.get_full_name()
                display_name = preferred_name or full_name or user.username
                
                if user.is_student:
                    # Create student profile with default values
                    student = Student.objects.create(
                        user=user,
                        student_id=f"S{user.id:06d}",  # Generate a student ID like S000001
                        name=full_name or user.username,
                        preferred_name=display_name
                    )
                
                if user.is_instructor:
                    # Create instructor profile with default values
                    instructor = Instructor.objects.create(
                        user=user,
                        instructor_id=f"I{user.id:06d}",  # Generate an instructor ID like I000001
                        name=full_name or user.username,
                        preferred_name=display_name,
                        department="Not specified"  # Default department
                    )
                
                # Return the user data without sensitive information
                return Response(
                    UserSerializer(user).data,
                    status=status.HTTP_201_CREATED
                )
            except Exception as e:
                return Response({
                    'error': 'Registration failed',
                    'detail': str(e)
                }, status=status.HTTP_400_BAD_REQUEST)
    else:
        print(f"Registration validation failed: {serializer.errors}")  # Add debugging
        return Response({
            'error': 'Validation failed',
            'detail': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)