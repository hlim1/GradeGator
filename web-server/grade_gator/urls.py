# grade_gator/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
import sys
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from assignments.api.views import SubmissionUploadView, RubricUploadView

urlpatterns = [
    path('admin/', admin.site.urls),

    # API schema and documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # API endpoints
    path('api/', include('accounts.api.urls')),
    path('api/', include('courses.api.urls')),
    path('api/', include('assignments.api.urls')),
    path('api/', include('grading.api.urls')),
    
    # New File Upload API Endpoints
    path('api/upload/submission/', SubmissionUploadView.as_view(), name='upload-submission'),
    path('api/upload/rubric/', RubricUploadView.as_view(), name='upload-rubric'),

    # REST framework browsable API auth
    path('api-auth/', include('rest_framework.urls')),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Print all URLs for debugging
def print_urls(urls, prefix=''):
    for entry in urls:
        if hasattr(entry, 'url_patterns'):
            # This is an include, recurse into it
            print_urls(entry.url_patterns, prefix + str(entry.pattern))
        else:
            # This is a URL pattern
            pattern = prefix + str(entry.pattern)
            name = entry.name if hasattr(entry, 'name') else 'unnamed'
            callback = entry.callback.__name__ if hasattr(entry.callback, '__name__') else str(entry.callback)
            print(f"URL: {pattern} -> {callback} (name: {name})")

# Add this line after urlpatterns to print all URLs when the server starts
# print("DEBUG: Printing all registered URLs:")
# print_urls(urlpatterns)