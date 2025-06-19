import json
import boto3
import os
from datetime import datetime

def lambda_handler(event, context):
    # Initialize AWS clients
    s3 = boto3.client('s3')
    stepfunctions = boto3.client('stepfunctions')

    # State Machine ARN (you'll create this in the next step)
    state_machine_arn = os.environ['STATE_MACHINE_ARN']

    # Process each message from SQS
    for record in event['Records']:
        try:
            # Parse the message body
            message = json.loads(record['body'])
            
            # Extract submission details
            bucket = message['bucket']
            key = message['key']
            submission_id = message.get('submission_id', key.split('/')[-1])

            # Prepare input for Step Functions
            step_input = {
                'bucket': bucket,
                'key': key,
                'submission_id': submission_id,
                'timestamp': datetime.now().isoformat()
            }

            # Start Step Functions execution
            response = stepfunctions.start_execution(
                stateMachineArn=state_machine_arn,
                input=json.dumps(step_input)
            )

            print(f"Started workflow for submission: {submission_id}")

        except Exception as e:
            print(f"Error processing submission: {str(e)}")
            # Optionally, send to error handling queue or log

    return {
        'statusCode': 200,
        'body': json.dumps('Submissions processed successfully')
    }