# accounts/api/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from drf_spectacular.utils import extend_schema
from django.contrib.auth import login
from .serializers import UserSerializer, AuthStatusSerializer, LoginSerializer
from django.contrib.auth.hashers import make_password  # ✅ required for password hashing


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
        return Response({
            'is_authenticated': True,
            'user': {
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
            }
        })
    else:
        return Response({
            'is_authenticated': False
        })


@extend_schema(
    description="Get user details by email",
    responses={200: UserSerializer},
    tags=["accounts"]
)
@api_view(['GET'])
@permission_classes([AllowAny])
def get_user_by_email(request):
    """
    Retrieve a user by their email address.
    """
    print("DEBUG accounts: ", request)
    email = request.query_params.get("email")
    if not email:
        return Response({'error': 'Email query parameter is required.'}, status=400)

    from django.contrib.auth import get_user_model
    User = get_user_model()

    try:
        user = User.objects.get(email=email)
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'preferred_name': user.preferred_name
        })
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=404)


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
                'success': {'type': 'boolean'},
                'user': {
                    'type': 'object',
                    'properties': {
                        'id': {'type': 'integer'},
                        'username': {'type': 'string'},
                        'email': {'type': 'string', 'format': 'email'},
                        'is_student': {'type': 'boolean'},
                        'is_instructor': {'type': 'boolean'},
                        'student_id': {'type': 'string', 'nullable': True},
                        'instructor_id': {'type': 'string', 'nullable': True},
                        'preferred_name': {'type': 'string', 'nullable': True}
                    }
                }
            }
        },
        400: {
            'type': 'object',
            'properties': {
                'success': {'type': 'boolean'},
                'error': {'type': 'object'}
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

        return Response({
            'success': True,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'preferred_name': user.preferred_name
            }
        })

    return Response({
        'success': False,
        'error': serializer.errors
    }, status=400)


@extend_schema(
    description="Logs out the user by blacklisting the refresh token",
    request={
        'application/json': {
            'type': 'object',
            'properties': {
                'refresh': {'type': 'string', 'description': 'Refresh token to be blacklisted'}
            }
        }
    },
    responses={200: {'type': 'object', 'properties': {
        'detail': {'type': 'string'}
    }}},
    tags=["accounts"]
)
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"detail": "Logged out successfully."}, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=400)


# ✅ FIXED: Update User Settings API to accept user_id from URL
@extend_schema(
    description="Update name, preferred name, or password for authenticated user",
    request={
        'application/json': {
            'type': 'object',
            'properties': {
                'name': {'type': 'string', 'description': 'New username'},
                'preferred_name': {'type': 'string', 'description': 'New preferred display name'},
                'password': {'type': 'string', 'description': 'New password'}
            }
        }
    },
    responses={200: {'type': 'object', 'properties': {'detail': {'type': 'string'}}}},
    tags=["accounts"]
)
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_user_settings(request, user_id):
    print("REQUEST", request)
    print("REQUEST DATA", request.data)

    from django.contrib.auth import get_user_model
    User = get_user_model()

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'detail': 'User not found'}, status=404)

    if request.user != user and not request.user.is_staff:
        return Response({'detail': 'Permission denied'}, status=403)

    data = request.data
    updated = False

    new_name = data.get("name")
    if new_name and new_name != user.username:
        user.username = new_name
        updated = True

    new_preferred = data.get("preferred_name")
    if new_preferred is not None and new_preferred != user.preferred_name:
        user.preferred_name = new_preferred
        updated = True

    new_password = data.get("password")
    if new_password:
        user.password = make_password(new_password)
        updated = True

    if updated:
        user.save()
        return Response({
           'detail': 'Settings updated successfully',
           'user': {
              'id': user.id,
              'username': user.username,
              'email': user.email,
              'preferred_name': user.preferred_name
           }
        }, status=200)
    else:
        return Response({'detail': 'No changes made'}, status=200)
