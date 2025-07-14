from django.db.models.signals import pre_delete
from django.dispatch import receiver
from assignments.models import Assignment
from grade_gator.storage_backends import ProfessorTestCasesStorage
import logging
import boto3

logger = logging.getLogger(__name__)

@receiver(pre_delete, sender=Assignment)
def handle_assignment_deletion(sender, instance, **kwargs):
    # Delete associated GradingRubric files
    for rubric in instance.rubrics.all():
        if rubric.rubric_file:
            try:
                rubric.rubric_file.delete(save=False)
                logger.info(f"Deleted rubric file {rubric.rubric_file}")
            except Exception as e:
                logger.error(f"Failed to delete rubric file {rubric.rubric_file}: {e}")

    # Delete autograder on S3
    assignment_id = instance.assignment_id
    storage = ProfessorTestCasesStorage()
    bucket = storage.bucket

    try:
        for obj in bucket.objects.filter(Prefix=f"{assignment_id}_"):
            print("Autograder" + obj.key + "is being deleted")
            obj.delete()
    except Exception as e:
        return Response({'error': 'Failed to delete existing autograder',
                         'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    # Delete Submission files (SubmissionFile + attached files in Grade)
    for submission in instance.submissions.all():
        # Delete grade's submitted_file
        if hasattr(submission, 'grade'):
            grade = submission.grade
            if grade.submitted_file:
                try:
                    grade.submitted_file.delete(save=False)
                    logger.info(f"Deleted grade file {grade.submitted_file}")
                except Exception as e:
                    logger.error(f"Failed to delete grade file {grade.submitted_file}: {e}")

        # Delete SubmissionFile files
        for f in submission.files.all():
            if f.file:
                try:
                    f.file.delete(save=False)
                    logger.info(f"Deleted submission file {f.file}")
                except Exception as e:
                    logger.error(f"Failed to delete submission file {f.file}: {e}")