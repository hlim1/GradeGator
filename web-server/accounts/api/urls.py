# accounts/api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import register
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import LogoutView

app_name = 'accounts_api'

# For function-based views (like current_user)
urlpatterns = [
    path('register/', register.register_user, name='register'),
    path('login/', views.login_user, name='login'),
    path('current-user/', views.current_user, name='current_user'),
    path('auth-status/', views.auth_status, name='auth_status'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/logout/', LogoutView.as_view(), name='token_logout'),
]

# If you decide to add ViewSets later, use this pattern:
# router = DefaultRouter()
# router.register(r'users', views.UserViewSet, basename='user')
# urlpatterns += [
#     path('', include(router.urls)),
# ]
