# Lambda Function Renaming: cfEvaluator → chatResponseHandler

## Summary

The Lambda function `cfEvaluator` has been renamed to `chatResponseHandler` to better reflect its actual purpose and functionality.

## Reason for Renaming

The original name "cfEvaluator" was misleading:
- **"cf"** likely stood for "CloudFormation" or "confidence filter" from earlier project iterations
- The actual purpose is to orchestrate chatbot responses, not evaluate CloudFormation
- The new name `chatResponseHandler` is self-documenting and accurately describes the function

## What This Function Does

The `chatResponseHandler` Lambda is the **core chatbot orchestration engine** that:

1. **Receives user queries** from websocketHandler Lambda
2. **Invokes Amazon Bedrock Agent** with role-specific personalization (learner, instructor, staff)
3. **Streams AI responses** back to users via WebSocket API Gateway
4. **Extracts confidence scores** and knowledge base citations
5. **Triggers background analytics** via logclassifier Lambda

## Files Changed

### 1. CDK Stack Configuration
**File**: `cdk_backend/lib/cdk_backend-stack.ts`

**Changes**:
- Renamed Lambda function definition from `cfEvaluator` to `chatResponseHandler`
- Updated Lambda function code path from `lambda/cfEvaluator` to `lambda/chatResponseHandler`
- Updated CloudWatch log group variable from `logGroupNamecfEvaluator` to `logGroupNameChatResponseHandler`
- Updated all references in IAM permissions and environment variables

### 2. Lambda Function Directory
**Changed**: `cdk_backend/lambda/cfEvaluator/` → `cdk_backend/lambda/chatResponseHandler/`

**Files**:
- `handler.py` - Main Lambda handler (added documentation header)
- `Dockerfile` - Docker build configuration
- `requirements.txt` - Python dependencies

### 3. Lambda Handler Documentation
**File**: `cdk_backend/lambda/chatResponseHandler/handler.py`

**Added**: Comprehensive module-level docstring explaining:
- Function purpose and responsibilities
- Integration points (websocketHandler, Bedrock Agent, logclassifier)
- Historical note about former name (cfEvaluator)

### 4. Architecture Documentation
**File**: `docs/AWS_ARCHITECTURE.md`

**Changes**:
- Updated all Mermaid diagrams with new function name
- Updated Lambda Functions Reference table
- Updated all text references throughout document

### 5. User Flow Documentation
**File**: `docs/USER_FLOW_STEPS.md`

**Changes**:
- Updated all 32 step-by-step flow descriptions
- Updated Lambda function references in all flows
- Updated timing and service summary tables

## Deployment Impact

### What Will Change After Deployment:

1. **Lambda Function Name**
   - Old: `LearningNavigatorStack-cfEvaluator-XXXXXX`
   - New: `LearningNavigatorStack-chatResponseHandler-XXXXXX`

2. **CloudWatch Log Group**
   - Old: `/aws/lambda/LearningNavigatorStack-cfEvaluator-XXXXXX`
   - New: `/aws/lambda/LearningNavigatorStack-chatResponseHandler-XXXXXX`

   ⚠️ **Note**: Historical logs in the old log group will remain but won't receive new logs

3. **IAM Role Name**
   - Will be recreated with new function name
   - Permissions remain identical

4. **Environment Variables**
   - `RESPONSE_FUNCTION_ARN` in websocketHandler will point to new function ARN
   - `GROUP_NAME` in sessionLogs will point to new log group

### What Will NOT Change:

- ✅ Functionality remains identical
- ✅ API endpoints (WebSocket API URL) unchanged
- ✅ DynamoDB tables unchanged
- ✅ S3 buckets unchanged
- ✅ Bedrock Agent configuration unchanged
- ✅ User-facing behavior unchanged

## Deployment Steps

### 1. Build CDK Stack
```bash
cd cdk_backend
npm run build
```

### 2. Deploy Stack
```bash
cdk deploy --all
```

### 3. Verify Deployment
After deployment, verify:
- [ ] New Lambda function `chatResponseHandler` is created
- [ ] WebSocket API still works (send a test message)
- [ ] CloudWatch logs appear in new log group
- [ ] Old `cfEvaluator` function can be safely deleted (after verification)

### 4. Clean Up Old Resources (Optional)
After confirming the new function works:

```bash
# Delete old Lambda function (if CDK didn't auto-remove)
aws lambda delete-function --function-name <old-cfEvaluator-function-name>

# Optional: Export old CloudWatch logs before they expire
aws logs create-export-task \
  --log-group-name /aws/lambda/<old-function-name> \
  --from 0 \
  --to $(date +%s)000 \
  --destination s3-bucket-name
```

## Testing Checklist

After deployment, test the following:

- [ ] User can send a message via chatbot interface
- [ ] Response streams back correctly via WebSocket
- [ ] High confidence responses display properly with citations
- [ ] Low confidence queries trigger email escalation
- [ ] Background logging works (check DynamoDB SessionLogs table)
- [ ] Sentiment classification runs (check logclassifier logs)
- [ ] Admin dashboard displays analytics correctly
- [ ] CloudWatch logs show in new log group

## Rollback Plan

If issues occur after deployment:

1. **Immediate Rollback**: Revert CDK stack changes
   ```bash
   git revert <commit-hash>
   cdk deploy --all
   ```

2. **Manual Fix**: Update environment variable in websocketHandler
   ```bash
   aws lambda update-function-configuration \
     --function-name websocketHandler \
     --environment Variables={RESPONSE_FUNCTION_ARN=<old-function-arn>}
   ```

## References

- [AWS Lambda Function Naming Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/lambda-naming.html)
- [CDK Lambda Construct Documentation](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lambda-readme.html)

---

**Date**: January 11, 2026
**Author**: Claude Code Assistant
**Status**: Ready for Deployment
