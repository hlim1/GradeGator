# assignments/api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import RubricUploadView

app_name = 'assignments_api'

router = DefaultRouter()

router.register(r'assignments', views.AssignmentViewSet, basename='assignment')
router.register(r'submissions', views.SubmissionViewSet, basename='submission')
router.register(r'register', views.SubmissionViewSet, basename='register-user')

urlpatterns = [
    path('', include(router.urls)),
    path('upload/rubric/', RubricUploadView.as_view(), name='upload-rubric'),
]