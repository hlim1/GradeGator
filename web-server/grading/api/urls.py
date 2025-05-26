# grading/api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'grading_api'

router = DefaultRouter()
router.register(r'grades', views.GradeViewSet, basename='grade')
router.register(r'feedback', views.FeedbackViewSet, basename='feedback')

urlpatterns = [
    path('', include(router.urls)),
]