import json
import boto3
import os
import subprocess
from datetime import datetime

def prepare_submission(event, context):
    """
    Prepare the submission for grading
    - Validate submission
    - Perform any preprocessing
    """
    s3 = boto3.client('s3')
    
    try:
        bucket = event['bucket']
        key = event['key']
        submission_id = event['submission_id']
        
        # Download submission to temporary location
        local_path = f'/tmp/{submission_id}'
        s3.download_file(bucket, key, local_path)
        
        # Perform validation checks
        # Example: Check file size, type, etc.
        file_size = os.path.getsize(local_path)
        if file_size > 10 * 1024 * 1024:  # 10MB max
            raise ValueError("Submission file too large")
        
        # Optional: Run initial preprocessing
        # Example: Unzip if needed, check file structure
        
        return {
            'statusCode': 200,
            'bucket': bucket,
            'key': key,
            'submission_id': submission_id,
            'local_path': local_path,
            'status': 'PREPARED'
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'error': str(e),
            'submission_id': submission_id,
            'status': 'PREPARATION_FAILED'
        }

def launch_ec2_for_grading(event, context):
    """
    Launch EC2 instance for grading the submission
    """
    ec2 = boto3.client('ec2')
    
    try:
        bucket = event['bucket']
        key = event['key']
        submission_id = event['submission_id']
        
        # Launch EC2 instance for grading
        response = ec2.run_instances(
            ImageId=os.environ['DOCKER_AMI'],  # Docker-enabled AMI
            InstanceType='t2.micro',
            KeyName=os.environ['EC2_KEY_PAIR'],
            SecurityGroupIds=[os.environ['SECURITY_GROUP']],
            UserData=f'''#!/bin/bash
            # Download submission from S3
            aws s3 cp s3://{bucket}/{key} /submission/submission
            
            # Run Docker container for grading
            docker run --rm \
                -v /submission:/input \
                -v /output:/output \
                {os.environ['GRADING_DOCKER_IMAGE']} \
                /input/submission
            
            # Upload results back to S3
            aws s3 cp /output/results.json s3://{os.environ['GRADED_BUCKET']}/{submission_id}/results.json
            
            # Signal completion or failure
            echo $? > /output/status.txt
            ''',
            MinCount=1,
            MaxCount=1,
            IamInstanceProfile={
                'Name': os.environ['EC2_INSTANCE_PROFILE']
            }
        )
        
        instance_id = response['Instances'][0]['InstanceId']
        
        return {
            'statusCode': 200,
            'submission_id': submission_id,
            'instance_id': instance_id,
            'status': 'GRADING_STARTED'
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'error': str(e),
            'submission_id': submission_id,
            'status': 'LAUNCH_FAILED'
        }

def check_grading_status(event, context):
    """
    Check the status of grading for a submission
    """
    ec2 = boto3.client('ec2')
    s3 = boto3.client('s3')
    
    try:
        submission_id = event['submission_id']
        
        # Check S3 for grading status file
        try:
            s3.head_object(
                Bucket=os.environ['GRADED_BUCKET'], 
                Key=f'{submission_id}/status.txt'
            )
        except s3.exceptions.ClientError:
            return {
                'statusCode': 200,
                'submission_id': submission_id,
                'gradingStatus': 'IN_PROGRESS'
            }
        
        # Read status file
        response = s3.get_object(
            Bucket=os.environ['GRADED_BUCKET'], 
            Key=f'{submission_id}/status.txt'
        )
        status_code = int(response['Body'].read().decode('utf-8').strip())
        
        # Determine grading status based on exit code
        if status_code == 0:
            return {
                'statusCode': 200,
                'submission_id': submission_id,
                'gradingStatus': 'COMPLETED'
            }
        else:
            return {
                'statusCode': 200,
                'submission_id': submission_id,
                'gradingStatus': 'FAILED'
            }
    except Exception as e:
        return {
            'statusCode': 500,
            'submission_id': submission_id,
            'gradingStatus': 'ERROR',
            'error': str(e)
        }

def upload_results(event, context):
    """
    Upload grading results to S3
    """
    s3 = boto3.client('s3')
    
    try:
        submission_id = event['submission_id']
        
        # Upload results to final bucket
        s3.copy_object(
            Bucket='gradedsubmissions',
            CopySource={
                'Bucket': os.environ['GRADED_BUCKET'], 
                'Key': f'{submission_id}/results.json'
            },
            Key=f'{submission_id}/results.json'
        )
        
        return {
            'statusCode': 200,
            'submission_id': submission_id,
            'status': 'UPLOADED'
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'error': str(e),
            'submission_id': submission_id,
            'status': 'UPLOAD_FAILED'
        }

def terminate_ec2_instance(event, context):
    """
    Terminate the EC2 instance used for grading
    """
    ec2 = boto3.client('ec2')
    
    try:
        submission_id = event['submission_id']
        
        # Find and terminate the instance
        response = ec2.describe_instances(
            Filters=[
                {
                    'Name': 'tag:SubmissionId',
                    'Values': [submission_id]
                }
            ]
        )
        
        if response['Reservations']:
            instance_id = response['Reservations'][0]['Instances'][0]['InstanceId']
            ec2.terminate_instances(InstanceIds=[instance_id])
        
        return {
            'statusCode': 200,
            'submission_id': submission_id,
            'status': 'INSTANCE_TERMINATED'
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'error': str(e),
            'submission_id': submission_id,
            'status': 'TERMINATION_FAILED'
        }

def submission_failure(event, context):
    """
    Handle submission failures
    """
    s3 = boto3.client('s3')
    
    try:
        submission_id = event['submission_id']
        error_details = event.get('errorDetails', 'Unknown error')
        
        # Log failure details to S3
        s3.put_object(
            Bucket='gradedsubmissions',
            Key=f'failures/{submission_id}.json',
            Body=json.dumps({
                'submission_id': submission_id,
                'error': error_details,
                'timestamp': datetime.now().isoformat()
            })
        )
        
        return {
            'statusCode': 500,
            'submission_id': submission_id,
            'status': 'SUBMISSION_FAILED'
        }
    except Exception as e:
        print(f"Critical failure in error handling: {str(e)}")
        return {
            'statusCode': 500,
            'error': 'Failed to process submission failure'
        }

def lambda_handler(event, context):
    """
    Route to appropriate function based on event
    """
    function_type = event.get('function_type')
    
    function_map = {
        'prepare_submission': prepare_submission,
        'launch_ec2_for_grading': launch_ec2_for_grading,
        'check_grading_status': check_grading_status,
        'upload_results': upload_results,
        'terminate_ec2_instance': terminate_ec2_instance,
        'submission_failure': submission_failure
    }
    
    if function_type in function_map:
        return function_map[function_type](event, context)
    else:
        return {
            'statusCode': 400,
            'body': json.dumps('Invalid function type')
        }