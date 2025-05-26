"""
WSGI config for grade_gator project.

It exposes the WSGI callable as a module-level variable named ``application``.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'grade_gator.settings')

application = get_wsgi_application()
