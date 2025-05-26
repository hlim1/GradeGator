# accounts/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    is_student = models.BooleanField(default=False)
    is_instructor = models.BooleanField(default=False)
    preferred_name = models.CharField(max_length=150, blank=True, null=True)
    
    def __str__(self):
        return self.username
