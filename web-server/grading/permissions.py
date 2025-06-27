from rest_framework.permissions import BasePermission
from django.conf import settings

class LambdaSecretPermission(BasePermission):
    def has_permission(self, request, view):
        # Allow all safe methods (GET, HEAD, OPTIONS)
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return True

        # For POST/PUT/etc., check the secret
        auth_header = request.headers.get('Authorization', '')
        expected = f'Bearer {settings.BACKEND_API_SECRET}'
        return auth_header == expected
