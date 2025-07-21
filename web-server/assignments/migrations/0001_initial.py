# assignments/migrations/0001_initial.py
from django.db import migrations, models
import django.db.models.deletion
import grade_gator.storage_backends
import os

def submission_upload_path(instance, filename):
    assignment_id = instance.submission.assignment.id
    student_id = instance.submission.student.id
    return os.path.join(
        f'assignment{assignment_id}_user{student_id}',
        filename
    )

def rubric_upload_path(instance, filename):
    assignment_id = instance.assignment.id
    instructor_id = instance.instructor.id
    return os.path.join(
        'grading-rubrics',
        f'assignment{assignment_id}_instructor{instructor_id}',
        filename
    )

class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('courses', '0001_initial'),  # adjust if courses app migrations differ
        ('accounts', '0001_initial'),  # adjust if accounts app migrations differ
    ]

    operations = [
        migrations.CreateModel(
            name='Assignment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('assignment_id', models.CharField(max_length=20, unique=True)),
                ('name', models.CharField(max_length=200)),
                ('grade_method', models.CharField(choices=[('POINTS', 'Points Based'), ('PERCENT', 'Percentage Based'), ('LETTER', 'Letter Grade'), ('STANDARDS', 'Standards Based')], default='POINTS', max_length=10, blank=True)),
                ('points', models.IntegerField(default=0)),
                ('due_date', models.DateTimeField()),
                ('release_date', models.DateTimeField()),
                ('late_due_date', models.DateTimeField(blank=True, null=True)),
                ('allow_late_submissions', models.BooleanField(default=False)),
                ('is_visible_to_students', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('is_manually_graded', models.BooleanField(default=False)),
                ('questions', models.JSONField(default=list)),
                ('autograder_name', models.CharField(max_length=255, null=True, blank=True)),
                ('course', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='assignments', to='courses.course')),
            ],
        ),
        migrations.CreateModel(
            name='Submission',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('submission_time', models.DateTimeField(auto_now_add=True)),
                ('submission_file', models.FileField(blank=True, null=True, upload_to='student-submissions/')),
                ('assignment', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='submissions', to='assignments.assignment')),
                ('student', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='submissions', to='courses.student')),
            ],
        ),
        migrations.CreateModel(
            name='SubmissionFile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('file', models.FileField(blank=True, null=True, storage=grade_gator.storage_backends.UngradedSubmissionsStorage(), upload_to='')),
                ('submission', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='files', to='assignments.submission')),
            ],
        ),
        migrations.CreateModel(
            name='GradingRubric',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('submission_time', models.DateTimeField(auto_now_add=True)),
                ('rubric_file', models.FileField(blank=True, null=True, storage=grade_gator.storage_backends.ProfessorTestCasesStorage(), upload_to='')),
                ('assignment', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='rubrics', to='assignments.assignment')),
                ('instructor', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='rubrics', to='courses.instructor')),
            ],
        ),
        migrations.CreateModel(
            name='StudentAccommodation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('extra_time', models.PositiveIntegerField(default=0, help_text='Extra time in minutes')),
                ('special_instructions', models.TextField(blank=True, null=True)),
                ('custom_due_date', models.DateTimeField(blank=True, null=True)),
                ('assignment', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='student_accommodations', to='assignments.assignment')),
                ('student', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='assignment_accommodations', to='courses.student')),
            ],
            options={
                'unique_together': {('student', 'assignment')},
            },
        ),
    ]
