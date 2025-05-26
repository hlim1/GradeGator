from rest_framework import permissions

class IsAdminOrInstructor(permissions.BasePermission):
    """
    Custom permission to only allow admins or instructors to create courses.
    """
    def has_permission(self, request, view):
        # Allow GET requests for all authenticated users
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Check if user is admin or instructor
        return request.user.is_staff or request.user.is_instructor