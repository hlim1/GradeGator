from storages.backends.s3boto3 import S3Boto3Storage

class UngradedSubmissionsStorage(S3Boto3Storage):
    bucket_name = 'ungraded-submissions'

class ProfessorTestCasesStorage(S3Boto3Storage):
    bucket_name = 'professor-test-cases'

class ManualUngradedStorage(S3Boto3Storage):
     bucket_name = 'manual-ungraded-submissions'