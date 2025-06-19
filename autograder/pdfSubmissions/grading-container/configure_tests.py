import boto3
import os
import json

def configure_test_cases(event, context):
    """
    Configure test cases for a specific assignment
    """
    s3 = boto3.client('s3')
    
    try:
        # Parameters from event
        course_id = event['course_id']
        assignment_id = event['assignment_id']
        test_cases = event['test_cases']
        
        # S3 bucket for test cases
        test_cases_bucket = os.environ['TEST_CASES_BUCKET']
        
        # Upload each test case
        for test_case in test_cases:
            s3.put_object(
                Bucket=test_cases_bucket,
                Key=f"{course_id}/{assignment_id}/tests/{test_case['filename']}",
                Body=test_case['content']
            )
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Test cases uploaded successfully',
                'course_id': course_id,
                'assignment_id': assignment_id
            })
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': str(e)
            })
        }

def list_test_cases(event, context):
    """
    List available test cases for a course and assignment
    """
    s3 = boto3.client('s3')
    
    try:
        course_id = event['course_id']
        assignment_id = event['assignment_id']
        
        test_cases_bucket = os.environ['TEST_CASES_BUCKET']
        
        # List objects in the specific test cases folder
        response = s3.list_objects_v2(
            Bucket=test_cases_bucket,
            Prefix=f"{course_id}/{assignment_id}/tests/"
        )
        
        # Extract filenames
        test_cases = [obj['Key'] for obj in response.get('Contents', [])]
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'test_cases': test_cases
            })
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': str(e)
            })
        }