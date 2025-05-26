# Grade Gator - Setup Instructions


## Setup Steps

1. **Create a virtual environment**:
   ```bash
   python -m venv venv
   ```

2. **Activate the virtual environment**:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Create the PostgreSQL database**:

   First, make sure PostgreSQL is installed and running on your machine.

    Example for getting PostgreSQL added to your PATH:
   ```bash
   export PATH="/opt/homebrew/opt/postgresql@14/bin:$PATH"
   brew services start postgresql@14 # for macos
   ```

   ```bash
   # Log into PostgreSQL
   psql postgres

   # In PostgreSQL shell
   CREATE DATABASE grade_gator;
   CREATE USER postgres WITH PASSWORD 'password';
   ALTER ROLE postgres SET client_encoding TO 'utf8';
   ALTER ROLE postgres SET default_transaction_isolation TO 'read committed';
   ALTER ROLE postgres SET timezone TO 'UTC';
   GRANT ALL PRIVILEGES ON DATABASE grade_gator TO postgres;
   \q
   ```

   Note: If you're using different credentials or database name, update them in `settings.py`.

6. **Make migrations and apply them**:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

7. **Create a superuser** for the admin panel:
   ```bash
   python manage.py createsuperuser
   ```

8. **Run the development server**:
   ```bash
   python manage.py runserver
   ```

9. **Access the application**:
   - Main site: http://localhost:8000/
   - Admin panel: http://localhost:8000/admin/

## Adding Template Directories

Make sure Django knows where to find your templates by checking that the `TEMPLATES` setting in `settings.py` includes the correct directories:

```python
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],  # This line is important
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]
```

## Create a basic static folder
```bash
mkdir -p static/css
touch static/css/styles.css
```

## Next Steps

1. **Add test data through the admin panel**:
   - Create a few courses
   - Add instructors and students
   - Create assignments

2. **Expand functionality**:
   - Implement assignment submission functionality
   - Add grading views
   - Add autograder integration
   - Implement standards-based grading

Remember to update the models and migrations as you add more features to the application.