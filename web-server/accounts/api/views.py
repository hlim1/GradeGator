# accounts/api/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from drf_spectacular.utils import extend_schema
from django.contrib.auth import login
from .serializers import UserSerializer, AuthStatusSerializer, LoginSerializer

@extend_schema(
    description="Check if user is authenticated",
    responses={200: AuthStatusSerializer},
    tags=["accounts"]
)
@api_view(['GET'])
@permission_classes([AllowAny])
def auth_status(request):
    """
    Check if user is authenticated
    """
    if request.user.is_authenticated:
        # Return user data
        return Response({
            'is_authenticated': True,
            'user': {
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
                # TODO Add other user fields later if we want
            }
        })
    else:
        return Response({
            'is_authenticated': False
        })

@extend_schema(
    description="Get details of the currently authenticated user",
    responses={200: {'type': 'object', 'properties': {
        'id': {'type': 'integer'},
        'username': {'type': 'string'},
        'email': {'type': 'string'},
        'is_staff': {'type': 'boolean'},
        'student': {'type': 'object', 'nullable': True},
        'instructor': {'type': 'object', 'nullable': True}
    }}},
    tags=["accounts"]
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    """
    Get the current authenticated user details
    """
    user = request.user
    data = {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'is_staff': user.is_staff,
    }
    
    # Add student info if available
    if hasattr(user, 'student_profile') and user.student_profile.exists():
        student = user.student_profile
        data['student'] = {
            'id': student.id,
            'name': student.name,
            'student_id': student.student_id,
        }
    
    # Add instructor info if available
    if hasattr(user, 'instructor_profile') and user.instructor_profile.exists():
        instructor = user.instructor_profile
        data['instructor'] = {
            'id': instructor.id,
            'name': instructor.name,
            'instructor_id': instructor.instructor_id,
        }
    
    return Response(data)

@extend_schema(
    description="Login with email/username and password to get user details and role information",
    request={
        'application/json': {
            'type': 'object',
            'properties': {
                'email': {'type': 'string', 'format': 'email', 'description': 'User email (either email or username is required)'},
                'username': {'type': 'string', 'description': 'Username (either email or username is required)'},
                'password': {'type': 'string', 'format': 'password', 'description': 'User password'}
            }
        }
    },
    responses={
        200: {
            'type': 'object',
            'properties': {
                'success': {'type': 'boolean', 'description': 'Whether the login was successful'},
                'user': {
                    'type': 'object',
                    'properties': {
                        'id': {'type': 'integer', 'description': 'User ID'},
                        'username': {'type': 'string', 'description': 'Username'},
                        'email': {'type': 'string', 'format': 'email', 'description': 'User email'},
                        'is_student': {'type': 'boolean', 'description': 'Whether the user is a student'},
                        'is_instructor': {'type': 'boolean', 'description': 'Whether the user is an instructor'},
                        'student_id': {'type': 'string', 'nullable': True, 'description': 'Student ID if user is a student'},
                        'instructor_id': {'type': 'string', 'nullable': True, 'description': 'Instructor ID if user is an instructor'},
                        'preferred_name': {'type': 'string', 'nullable': True, 'description': 'User\'s preferred display name'}
                    }
                }
            }
        },
        400: {
            'type': 'object',
            'properties': {
                'success': {'type': 'boolean', 'description': 'Always false for errors'},
                'error': {
                    'type': 'object',
                    'description': 'Validation errors or login failure details'
                }
            }
        }
    },
    tags=["accounts"]
)
@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    """
    Login user with email/username and password
    """
    serializer = LoginSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.validated_data['user']
        login(request, user)
        
        # Get student/instructor IDs if they exist
        student_id = None
        instructor_id = None
        
        if user.is_student and hasattr(user, 'student_profile'):
            student = user.student_profile
            if student:
                student_id = student.student_id
                
        if user.is_instructor and hasattr(user, 'instructor_profile'):
            instructor = user.instructor_profile
            if instructor:
                instructor_id = instructor.instructor_id
        
        return Response({
            'success': True,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_student': user.is_student,
                'is_instructor': user.is_instructor,
                'student_id': student_id,
                'instructor_id': instructor_id,
                'preferred_name': user.preferred_name
            }
        })
    
    return Response({
        'success': False,
        'error': serializer.errors
    }, status=400)