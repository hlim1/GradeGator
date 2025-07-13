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
                'preferred_name': {'type': 'string', 'description': 'Optional display name'}
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
    Role assignment (student/instructor) will be handled at the course level.
    """
    serializer = RegisterSerializer(data=request.data)
    
    if serializer.is_valid():
        with transaction.atomic():
            try:
                # Save the user
                user = serializer.save()

                # Get the display name (preferred_name > full_name > username)
                preferred_name = getattr(user, 'preferred_name', None)
                full_name = user.get_full_name()
                display_name = preferred_name or full_name or user.username

                # 🔥 Removed profile creation logic here

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
        print(f"Registration validation failed: {serializer.errors}")
        return Response({
            'error': 'Validation failed',
            'detail': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
