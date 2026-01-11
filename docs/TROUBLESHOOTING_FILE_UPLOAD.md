# Troubleshooting File Upload Issues

## Configuration Verification

✅ **S3 Bucket**: `national-council-s3-pdfs` (correctly configured)
✅ **Lambda Function**: `BlueberryStackLatest-FileApiHandler0C17CCA3-LlyGYGbwDYzY`
✅ **API Gateway Endpoint**: `/files` (POST method exists)
✅ **Lambda Permissions**: Has full S3 read/write access to the bucket
✅ **Bedrock Integration**: Knowledge Base ID and Data Source ID configured

## Current Status

The backend configuration is correct:
- Lambda has proper IAM permissions for S3
- API Gateway routes are configured
- CORS headers are in place
- Bucket name is correctly set to `national-council-s3-pdfs`

## Common Issues and Solutions

### 1. Check Browser Console Errors

Open the browser developer console (F12) and look for errors when uploading. Common errors:

**CORS Error:**
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution**: API Gateway has OPTIONS method configured, should be working.

**401 Unauthorized:**
```
Failed to fetch: 401 Unauthorized
```
**Solution**: Token expired or invalid. Try logging out and logging back in.

**500 Internal Server Error:**
```
POST /files 500 (Internal Server Error)
```
**Solution**: Check CloudWatch logs (see below).

### 2. Check CloudWatch Logs

```bash
# View recent Lambda logs
aws logs tail /aws/lambda/BlueberryStackLatest-FileApiHandler0C17CCA3-LlyGYGbwDYzY \
  --region us-west-2 \
  --since 10m \
  --follow
```

Look for:
- `[FILE-API] UPLOAD error` - indicates S3 upload failure
- `UNHANDLED EXCEPTION` - indicates code error
- Authorization errors

### 3. Test Upload Manually

Create a test file:
```bash
echo "Hello World" > test.txt
```

Convert to base64:
```bash
base64 test.txt
# Output: SGVsbG8gV29ybGQK
```

Test with curl (replace TOKEN with your ID token from localStorage):
```bash
curl -X POST https://tuvw7wkl4l.execute-api.us-west-2.amazonaws.com/prod/files \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ID_TOKEN" \
  -d '{
    "filename": "test.txt",
    "content_type": "text/plain",
    "content": "SGVsbG8gV29ybGQK"
  }'
```

Expected success response:
```json
{
  "message": "Uploaded",
  "file": {
    "name": "test.txt",
    "url": "/files/test.txt"
  }
}
```

### 4. Verify S3 Bucket Access

List files in bucket:
```bash
aws s3 ls s3://national-council-s3-pdfs/ --region us-west-2
```

Try manual upload to bucket:
```bash
echo "test" > test.txt
aws s3 cp test.txt s3://national-council-s3-pdfs/test.txt --region us-west-2
```

If this fails, there might be bucket policy or permissions issues.

### 5. Check Lambda Environment Variables

```bash
aws lambda get-function-configuration \
  --function-name BlueberryStackLatest-FileApiHandler0C17CCA3-LlyGYGbwDYzY \
  --region us-west-2 \
  --query 'Environment.Variables'
```

Should return:
```json
{
  "KNOWLEDGE_BASE_ID": "U3ECPUKK7R",
  "DATA_SOURCE_ID": "5PPL5KM5SP",
  "BUCKET_NAME": "national-council-s3-pdfs"
}
```

### 6. Frontend Upload Flow

The upload process:
1. User selects file in ManageDocuments.jsx
2. File is read as base64 using FileReader
3. POST request sent to `/files` with JSON body:
   ```json
   {
     "filename": "example.pdf",
     "content_type": "application/pdf",
     "content": "base64EncodedContent..."
   }
   ```
4. Lambda receives request, decodes base64, uploads to S3
5. Lambda triggers Knowledge Base sync
6. Success response returned

### 7. Check File Size Limits

**Lambda Payload Limit**: 6 MB (synchronous invocation)
**API Gateway Limit**: 10 MB (payload size)

If uploading large files (>6 MB), you'll get an error. Consider implementing:
- S3 presigned URLs for direct upload (bypassing Lambda)
- Multipart upload for large files

### 8. Debug Steps

**Step 1**: Check if POST request is reaching the Lambda
```bash
# View logs in real-time
aws logs tail /aws/lambda/BlueberryStackLatest-FileApiHandler0C17CCA3-LlyGYGbwDYzY \
  --region us-west-2 \
  --follow
```

Then try uploading a file from the admin portal.

**Step 2**: If no logs appear, the request isn't reaching the Lambda
- Check API Gateway configuration
- Check authentication (try guest mode)
- Check browser network tab for the actual request/response

**Step 3**: If logs show errors, fix based on error message
- S3 permission errors: Check IAM policies
- JSON parse errors: Check request format
- Bucket not found: Verify bucket name

## Known Working Configuration

- **S3 Bucket**: `national-council-s3-pdfs` (us-west-2)
- **Lambda**: Has full S3 permissions
- **API Endpoint**: `https://tuvw7wkl4l.execute-api.us-west-2.amazonaws.com/prod/files`
- **Method**: POST
- **Headers**: `Content-Type: application/json`, `Authorization: Bearer {token}`
- **Body Format**: `{"filename": "...", "content_type": "...", "content": "base64..."}`

## Next Steps for Debugging

1. **Open Admin Portal in browser**
2. **Open Developer Console** (F12)
3. **Go to Network tab**
4. **Try uploading a file**
5. **Check for errors** in Console and Network tabs
6. **Share the error message** for specific diagnosis

The backend is configured correctly, so the issue is likely:
- Frontend token/auth issue
- File size too large
- Browser-specific issue
- Network/proxy blocking the request

## Quick Fix Attempts

### Attempt 1: Refresh Auth Token
1. Log out from admin portal
2. Log back in
3. Try upload again

### Attempt 2: Try Guest Mode
1. Click "Continue as Guest" on login page
2. Go to Manage Documents
3. Try upload again

### Attempt 3: Try Smaller File
1. Create a tiny text file (< 1 KB)
2. Try uploading that first
3. If works, issue is file size related
