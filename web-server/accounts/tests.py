from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model

User = get_user_model()

class UserModelTests(TestCase):
    def test_create_user(self):
        user = User.objects.create_user(username='test', email='test@example.com')
        self.assertEqual(user.username, 'test')

class AdminInterfaceTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.admin = User.objects.create_superuser(
            username='admin',
            password='adminpass',
            is_staff=True
        )
    
    def setUp(self):
        self.client = Client()
        self.client.force_login(self.admin)
        self.user = User.objects.create_user(username='testuser')

    def test_admin_access(self):
        response = self.client.get('/admin/')
        self.assertEqual(response.status_code, 200)

    def test_user_list_view(self):
        response = self.client.get(reverse('admin:accounts_user_changelist'))
        self.assertContains(response, self.user.username)

    def test_user_change_view(self):
        url = reverse('admin:accounts_user_change', args=[self.user.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)

    def test_user_add_view(self):
        response = self.client.get(reverse('admin:accounts_user_add'))
        self.assertEqual(response.status_code, 200)

    def test_custom_fields_display(self):
        response = self.client.get(reverse('admin:accounts_user_changelist'))
        self.assertContains(response, 'is_student')
        self.assertContains(response, 'is_instructor')

    def test_user_creation_via_admin(self):
        """Test creating a new user through admin interface"""
        form_data = {
            'username': 'newuser',
            'password1': 'ComplexPass123!',
            'password2': 'ComplexPass123!',
            'email': 'newuser@example.com',
            'is_student': 'on',
            'is_instructor': '',
            'is_staff': '',
            'is_superuser': '',
            'date_joined_0': '2023-01-01',
            'date_joined_1': '12:00:00',
            '_save': 'Save'
        }
        
        response = self.client.post(reverse('admin:accounts_user_add'), 
                                form_data, follow=True)
        
        # Debug if needed
        if response.status_code != 200:
            print("Form errors:", response.context['adminform'].form.errors)
        
        self.assertEqual(response.status_code, 200)
        new_user = User.objects.get(username='newuser')
        self.assertTrue(new_user.is_student, 
                    f"Expected is_student=True, got {new_user.is_student}")

    def test_bulk_user_actions(self):
            """Test admin bulk actions for users"""
            users = [User.objects.create_user(username=f'user{i}') for i in range(3)]
            
            # Test make_student action
            response = self.client.post(reverse('admin:accounts_user_changelist'), {
                'action': 'make_student',
                '_selected_action': [user.id for user in users],
                'post': 'yes'  # Required for confirmation
            }, follow=True)
            
            self.assertEqual(response.status_code, 200)
            for user in users:
                user.refresh_from_db()
                self.assertTrue(user.is_student)
            
            # Verify success message
            self.assertContains(response, "3 users marked as students")

    def test_inactive_user_creation(self):
        """Test creating an inactive user through admin"""
        form_data = {
            'username': 'inactiveuser',
            'password1': 'Testpass123!',
            'password2': 'Testpass123!',
            'email': 'inactive@example.com',
            # Boolean fields
            'is_active': '',  # Unchecked
            'is_student': '',
            'is_instructor': '',
            'is_staff': '',
            'is_superuser': '',
            # Required fields
            'date_joined_0': '2023-01-01',
            'date_joined_1': '00:00:00',
            '_save': 'Save'
        }
        
        response = self.client.post(reverse('admin:accounts_user_add'), 
                                form_data, follow=True)
        
        # Debug output if test fails
        if response.status_code != 200:
            print("Form errors:", response.context['adminform'].form.errors)
        
        user = User.objects.get(username='inactiveuser')
        self.assertFalse(user.is_active,
                    f"Expected is_active=False, got {user.is_active}. "
                    f"User: {user.__dict__}")