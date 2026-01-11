import os
import json
import boto3
from datetime import datetime
from botocore.exceptions import ClientError

# Environment variables
KNOWLEDGE_BASE_ID = os.environ['KNOWLEDGE_BASE_ID']
DATA_SOURCE_ID = os.environ['DATA_SOURCE_ID']

# AWS Clients
bedrock_agent = boto3.client('bedrock-agent')
sns = boto3.client('sns')

def lambda_handler(event, context):
    """
    Triggered by S3 events (PUT, DELETE) to sync the Bedrock Knowledge Base.
    Starts an ingestion job to re-index the knowledge base with updated documents.
    """

    print(f"Received event: {json.dumps(event)}")

    # Extract S3 event details
    try:
        records = event.get('Records', [])
        if not records:
            return {
                'statusCode': 400,
                'body': json.dumps('No S3 records found in event')
            }

        # Collect all file changes
        file_changes = []
        for record in records:
            event_name = record.get('eventName', '')
            s3_info = record.get('s3', {})
            bucket = s3_info.get('bucket', {}).get('name', '')
            key = s3_info.get('object', {}).get('key', '')

            file_changes.append({
                'event': event_name,
                'bucket': bucket,
                'key': key,
                'timestamp': record.get('eventTime', '')
            })

        print(f"Processing {len(file_changes)} file changes: {json.dumps(file_changes)}")

        # Start Knowledge Base ingestion job
        response = start_ingestion_job()

        # Notify admins (optional)
        notify_admins(file_changes, response)

        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Knowledge base sync initiated successfully',
                'ingestionJobId': response.get('ingestionJob', {}).get('ingestionJobId'),
                'filesProcessed': len(file_changes),
                'changes': file_changes
            })
        }

    except Exception as e:
        print(f"Error processing S3 event: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps(f'Error: {str(e)}')
        }


def start_ingestion_job():
    """
    Starts a Bedrock Knowledge Base ingestion job to sync documents.
    """
    try:
        print(f"Starting ingestion job for Knowledge Base: {KNOWLEDGE_BASE_ID}, Data Source: {DATA_SOURCE_ID}")

        response = bedrock_agent.start_ingestion_job(
            knowledgeBaseId=KNOWLEDGE_BASE_ID,
            dataSourceId=DATA_SOURCE_ID,
            description=f"Auto-sync triggered by S3 event at {datetime.utcnow().isoformat()}"
        )

        ingestion_job = response.get('ingestionJob', {})
        job_id = ingestion_job.get('ingestionJobId')
        status = ingestion_job.get('status')

        print(f"Ingestion job started successfully. Job ID: {job_id}, Status: {status}")

        return response

    except ClientError as e:
        error_code = e.response['Error']['Code']

        # Handle conflict - ingestion job already in progress
        if error_code == 'ConflictException':
            print("Ingestion job already in progress. Skipping...")
            return {
                'ingestionJob': {
                    'ingestionJobId': 'existing-job',
                    'status': 'IN_PROGRESS'
                }
            }
        else:
            print(f"Error starting ingestion job: {str(e)}")
            raise


def notify_admins(file_changes, ingestion_response):
    """
    Sends SNS notification to admins about knowledge base sync.
    """
    sns_topic_arn = os.environ.get('ADMIN_NOTIFICATION_TOPIC_ARN')

    if not sns_topic_arn:
        print("No SNS topic configured. Skipping admin notification.")
        return

    try:
        job_id = ingestion_response.get('ingestionJob', {}).get('ingestionJobId', 'N/A')

        # Build notification message
        file_list = "\n".join([
            f"- {change['event']}: {change['key']}"
            for change in file_changes[:10]  # Limit to first 10 files
        ])

        if len(file_changes) > 10:
            file_list += f"\n... and {len(file_changes) - 10} more files"

        message = f"""
Knowledge Base Auto-Sync Triggered
====================================

The MHFA Learning Navigator knowledge base is being synchronized with the latest documents.

Files Changed: {len(file_changes)}
{file_list}

Ingestion Job ID: {job_id}
Status: Started
Timestamp: {datetime.utcnow().isoformat()}

The chatbot will automatically use updated information once the sync completes (typically 2-5 minutes).

Note: No action required. This is an automated notification.
"""

        sns.publish(
            TopicArn=sns_topic_arn,
            Subject='Knowledge Base Auto-Sync Triggered',
            Message=message
        )

        print("Admin notification sent successfully")

    except Exception as e:
        print(f"Error sending admin notification: {str(e)}")
        # Don't fail the entire function if notification fails


def get_ingestion_job_status(job_id):
    """
    Check the status of an ingestion job (optional monitoring function).
    """
    try:
        response = bedrock_agent.get_ingestion_job(
            knowledgeBaseId=KNOWLEDGE_BASE_ID,
            dataSourceId=DATA_SOURCE_ID,
            ingestionJobId=job_id
        )

        return response.get('ingestionJob', {})

    except ClientError as e:
        print(f"Error getting ingestion job status: {str(e)}")
        return None
