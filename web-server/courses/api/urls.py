# courses/api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'courses_api'

# Create a router instance
router = DefaultRouter()

# Register viewsets with their paths
router.register(r'courses', views.CourseViewSet, basename='course')
router.register(r'students', views.StudentViewSet, basename='student')
router.register(r'instructors', views.InstructorViewSet, basename='instructor')

# Include the router URLs
urlpatterns = [
    path('', include(router.urls)),
]