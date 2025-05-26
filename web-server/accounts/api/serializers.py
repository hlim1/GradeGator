# accounts/api/serializers.py
from rest_framework import serializers
from accounts.models import User
from django.contrib.auth.password_validation import validate_password
from django.core import exceptions
from django.contrib.auth import authenticate

class UserSerializer(serializers.ModelSerializer):
    """Serializer for the User model"""
    student_profile = serializers.SerializerMethodField(read_only=True)
    instructor_profile = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'is_staff', 'is_student', 'is_instructor', 
                 'student_profile', 'instructor_profile')
        read_only_fields = ('is_staff',)
    
    def get_student_profile(self, obj):
        """Get student profile if it exists"""
        if hasattr(obj, 'student_profile') and obj.student_profile.exists():
            student = obj.student_profile.first()
            return {
                'id': student.id,
                'student_id': student.student_id,
                'name': student.name,
                'preferred_name': student.preferred_name
            }
        return None
    
    def get_instructor_profile(self, obj):
        """Get instructor profile if it exists"""
        if hasattr(obj, 'instructor_profile') and obj.instructor_profile.exists():
            instructor = obj.instructor_profile.first()
            return {
                'id': instructor.id,
                'instructor_id': instructor.instructor_id,
                'name': instructor.name,
                'preferred_name': instructor.preferred_name,
                'department': instructor.department
            }
        return None
        

class AuthStatusSerializer(serializers.Serializer):
    """Serializer for authentication status responses"""
    is_authenticated = serializers.BooleanField()
    user = UserSerializer(required=False, allow_null=True)

class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, required=True)
    password_confirmation = serializers.CharField(write_only=True, required=True)
    username = serializers.CharField(required=False)
    first_name = serializers.CharField(required=False)
    last_name = serializers.CharField(required=False)
    preferred_name = serializers.CharField(required=False)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirmation', 
                 'first_name', 'last_name', 'preferred_name', 'is_student', 'is_instructor')
        extra_kwargs = {
            'email': {'required': True},
            'is_student': {'default': False},
            'is_instructor': {'default': False},
            'first_name': {'default': ''},
            'last_name': {'default': ''}
        }
    
    def validate(self, data):
        """
        Check that the passwords match and validate password using Django's validators
        """
        if data['password'] != data['password_confirmation']:
            raise serializers.ValidationError({'password_confirmation': "Passwords do not match."})
        
        # Generate a username if not provided
        if not data.get('username'):
            email_name = data['email'].split('@')[0]
            base_username = email_name[:30]  # Django username max length is 150, but let's be conservative
            
            # Check if username exists and add numbers until we find a unique one
            username = base_username
            counter = 1
            while User.objects.filter(username=username).exists():
                # Truncate base_username if needed to ensure username with suffix doesn't exceed max length
                suffix = str(counter)
                max_base_length = 150 - len(suffix)
                username = f"{base_username[:max_base_length]}{suffix}"
                counter += 1
            
            data['username'] = username
        
        validation_data = data.copy()
        if 'password_confirmation' in validation_data:
            validation_data.pop('password_confirmation')
        
        user = User(**validation_data)
        try:
            validate_password(data['password'], user)
        except exceptions.ValidationError as e:
            raise serializers.ValidationError({'password': list(e.messages)})
            
        return data
    
    def create(self, validated_data):
        # Remove password_confirmation and preferred_name as we handle these separately
        password_confirmation = validated_data.pop('password_confirmation')
        preferred_name = validated_data.pop('preferred_name', None)
        
        # Create user with create_user to handle password hashing
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            is_student=validated_data.get('is_student', False),
            is_instructor=validated_data.get('is_instructor', False)
        )
        
        # Store preferred_name in user instance for later profile creation
        user.preferred_name = preferred_name
        
        return user

class LoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    email = serializers.EmailField(required=False)
    username = serializers.CharField(required=False)
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        # User can login with either email or username
        email = data.get('email')
        username = data.get('username')
        password = data.get('password')

        if not (email or username):
            raise serializers.ValidationError(
                "Must provide either email or username"
            )

        # If email is provided, get the username
        if email and not username:
            try:
                user = User.objects.get(email=email)
                username = user.username
            except User.DoesNotExist:
                raise serializers.ValidationError(
                    "No user found with this email address"
                )

        # Try to authenticate
        user = authenticate(username=username, password=password)
        if not user:
            raise serializers.ValidationError(
                "Invalid credentials"
            )

        # Add user to validated data
        data['user'] = user
        return data
