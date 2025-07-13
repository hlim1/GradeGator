# accounts/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    preferred_name = models.CharField(max_length=150, blank=True, null=True)
    
    def __str__(self):
        return self.username
