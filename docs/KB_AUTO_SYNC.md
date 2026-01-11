# Knowledge Base Auto-Sync Feature

## Overview

The Knowledge Base Auto-Sync Lambda function automatically triggers re-indexing of the Bedrock Knowledge Base whenever documents are added, modified, or deleted in the S3 bucket (`national-council-s3-pdfs`).

## How It Works

### Architecture

```
S3 Bucket (national-council-s3-pdfs)
    ↓ (PUT/DELETE events)
Lambda Function (KBSyncFunction)
    ↓ (calls start_ingestion_job)
Bedrock Agent Knowledge Base
    ↓ (re-indexes documents)
Updated Knowledge Base (2-5 minutes)
```

### Flow

1. **Admin uploads or deletes a document** via the Manage Documents interface
2. **S3 triggers the Lambda function** automatically on file changes
3. **Lambda starts an ingestion job** using Bedrock Agent API
4. **Knowledge Base re-indexes** all documents (typically takes 2-5 minutes)
5. **Chatbot uses updated information** automatically once sync completes

## Lambda Function Details

### Location
- **Code**: `cdk_backend/lambda/kb-sync/handler.py`
- **CDK Stack**: `cdk_backend/lib/cdk_backend-stack.ts` (lines 556-613)

### Environment Variables
- `KNOWLEDGE_BASE_ID`: The Bedrock Knowledge Base ID
- `DATA_SOURCE_ID`: The S3 data source ID
- `ADMIN_NOTIFICATION_TOPIC_ARN` (optional): SNS topic for notifications

### IAM Permissions
The Lambda function has permissions to:
- `bedrock:StartIngestionJob` - Start KB sync
- `bedrock:GetIngestionJob` - Check sync status
- `bedrock:GetKnowledgeBase` - Read KB details
- `bedrock:GetDataSource` - Read data source details

### Timeout
- **5 minutes** - Enough time to handle batch operations

## S3 Event Triggers

The function is triggered by:
- **OBJECT_CREATED** - When files are uploaded or modified
- **OBJECT_REMOVED** - When files are deleted

### Supported File Types
All file types supported by Bedrock Data Automation parsing:
- PDF documents
- Word documents (.docx)
- Excel spreadsheets (.xlsx)
- PowerPoint presentations (.pptx)
- Text files (.txt, .md)
- Images (PNG, JPEG) with multimodal support

## Conflict Handling

If an ingestion job is already running when a new sync is triggered:
- The Lambda function detects the `ConflictException`
- Returns gracefully without error
- The next change will trigger a new sync after the current one completes

## Monitoring

### CloudWatch Logs
View Lambda logs at: `/aws/lambda/{FunctionName}`

Example log entries:
```
Processing 3 file changes: [{"event": "ObjectCreated:Put", "bucket": "national-council-s3-pdfs", "key": "new-document.pdf"}]
Starting ingestion job for Knowledge Base: kb-xxxxxx, Data Source: ds-xxxxxx
Ingestion job started successfully. Job ID: ij-xxxxxx, Status: STARTING
```

### Sync Status
Check ingestion job status:
1. Go to AWS Bedrock Console
2. Navigate to Knowledge Bases
3. Select "Learning Navigator KB"
4. View "Sync history" tab

## Optional: Admin Notifications

To enable email notifications when sync occurs:

1. **Create an SNS Topic** in the CDK stack
2. **Add subscriptions** (admin email addresses)
3. **Uncomment the SNS configuration** in the Lambda function code:
   ```python
   # In handler.py, the notify_admins() function is already implemented
   # Just need to set ADMIN_NOTIFICATION_TOPIC_ARN environment variable
   ```

4. **Update the CDK stack** to add SNS topic ARN to environment variables

## Testing

### Manual Test
1. Upload a test PDF to S3 bucket via Admin Dashboard
2. Check CloudWatch Logs for Lambda execution
3. Wait 2-5 minutes for sync to complete
4. Ask the chatbot a question about the new document
5. Verify the chatbot can answer using the new information

### Test Script
```bash
# Upload a test document
aws s3 cp test.pdf s3://national-council-s3-pdfs/

# Check Lambda logs
aws logs tail /aws/lambda/{FunctionName} --follow

# Check ingestion job status
aws bedrock-agent list-ingestion-jobs \
  --knowledge-base-id {KB_ID} \
  --data-source-id {DS_ID}
```

## Deployment

### Deploy the Lambda Function
```bash
cd cdk_backend
npm run build
cdk deploy --all
```

### Verify Deployment
After deployment, check CloudFormation outputs:
- `KBSyncLambdaArn` - Lambda function ARN
- `KBSyncLambdaName` - Lambda function name

### S3 Bucket Notification
The CDK stack automatically configures S3 event notifications. Verify in AWS Console:
1. Go to S3 → national-council-s3-pdfs
2. Click "Properties" tab
3. Scroll to "Event notifications"
4. Verify Lambda function is configured for PUT and DELETE events

## Troubleshooting

### Issue: Sync Not Triggering
**Check**:
1. Lambda function exists and is deployed
2. S3 event notifications are configured
3. Lambda has permissions to be invoked by S3
4. CloudWatch Logs show no errors

### Issue: Permission Denied
**Check**:
1. Lambda IAM role has Bedrock permissions
2. Knowledge Base ID and Data Source ID are correct
3. Lambda execution role trust policy allows `lambda.amazonaws.com`

### Issue: Ingestion Job Fails
**Check**:
1. S3 bucket permissions allow Bedrock to read
2. Documents are in supported formats
3. Knowledge Base data source is configured correctly
4. CloudWatch Logs for detailed error messages

## Benefits

✅ **Automatic**: No manual sync needed after document uploads
✅ **Real-time**: Changes reflected within 2-5 minutes
✅ **Reliable**: Handles conflicts and errors gracefully
✅ **Scalable**: Works with batch uploads and deletions
✅ **Monitored**: Full CloudWatch Logs integration

## Future Enhancements

- [ ] SNS notifications for admins when sync completes
- [ ] Dashboard widget showing last sync time
- [ ] Retry logic for failed ingestion jobs
- [ ] Metrics tracking sync success rate
- [ ] Webhook to notify frontend when sync completes
