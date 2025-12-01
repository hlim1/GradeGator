from storages.backends.s3boto3 import S3Boto3Storage

class UngradedSubmissionsStorage(S3Boto3Storage):
    bucket_name = 'ungraded-submissions'

class ProfessorTestCasesStorage(S3Boto3Storage):
    bucket_name = 'professor-test-cases'

class ManualUngradedStorage(S3Boto3Storage):
     bucket_name = 'manual-ungraded-submissions'
     region_name = 'us-east-2'
     querystring_auth = True  
     querystring_expire = 3600  # optional, URL valid for 1 hour
     object_parameters = {
        'ContentType': 'application/pdf',
        'ContentDisposition': 'inline',  # this forces PDF preview
     }
     default_acl = 'private'
