# Learning Navigator - CDK Backend

AWS CDK infrastructure code for the Learning Navigator MHFA chatbot application.

## Stack Information

- **Stack Name**: `LearningNavigatorFeatures`
- **CDK Version**: 2.233.0
- **Runtime**: TypeScript
- **Region**: us-west-2

## Architecture

This CDK application deploys:
- AWS Bedrock Agent with Knowledge Base
- API Gateway (WebSocket + REST)
- Lambda Functions (8 handlers)
- DynamoDB Tables (3 tables)
- S3 Buckets for document storage
- Cognito User Pool for authentication
- SES for email notifications
- Amplify app for frontend hosting

## Lambda Functions

1. **chatResponseHandler** - Processes chat requests via Bedrock Agent
   - Runtime: Python 3.12
   - Memory: 512 MB
   - Timeout: 120 seconds
   - Location: `lambda/chatResponseHandler/`

2. **websocketHandler** - Manages WebSocket connections
   - Location: `lambda/websocketHandler/`

3. **adminFile** - Handles document uploads and KB sync
   - Location: `lambda/adminFile/`

4. **email** - Sends escalated query notifications
   - Location: `lambda/email/`

5. **logclassifier** - AI-powered sentiment analysis
   - Location: `lambda/logclassifier/`

6. **userProfile** - User profile and recommendations
   - Location: `lambda/userProfile/`

7. **escalatedQueries** - Escalation workflow management
   - Location: `lambda/escalatedQueries/`

8. **responseFeedback** - User feedback collection
   - Location: `lambda/responseFeedback/`

## Deployment

### Prerequisites

- AWS CLI configured with appropriate credentials
- Docker installed and running
- Node.js and npm installed
- CDK CLI version 2.1033.0 or higher

### Full Stack Deployment

```bash
# Install dependencies
npm install

# Bootstrap (first time only)
cdk bootstrap --all \
  -c githubOwner=YOUR_GITHUB_USERNAME \
  -c githubRepo=ncwm_chatbot_2 \
  -c adminEmail=YOUR_ADMIN_EMAIL

# Deploy all stacks
npx cdk@2.1101.0 deploy --all \
  -c githubOwner=YOUR_GITHUB_USERNAME \
  -c githubRepo=ncwm_chatbot_2 \
  -c adminEmail=YOUR_ADMIN_EMAIL
```

### Lambda-Only Deployment

For rapid Lambda function updates without full CDK deployment:

```bash
cd lambda/chatResponseHandler
docker build -t chatresponsehandler:latest .

# Extract and package
docker create --name temp chatresponsehandler:latest
docker cp temp:/asset/. /tmp/lambda-package/
docker rm temp

cd /tmp/lambda-package
zip -r lambda.zip .

# Deploy via AWS CLI
aws lambda update-function-code \
  --function-name BlueberryStackLatest-cfEvaluatorFC18B8AA-IHPtXe2az5N8 \
  --zip-file fileb://lambda.zip \
  --region us-west-2
```

## CDK Version Compatibility

⚠️ **Important**: The CDK CLI version must be compatible with the library version.

- Project uses: `aws-cdk-lib@2.233.0`
- Compatible CLI: `@2.1033.0` or higher
- Use npx to run specific versions: `npx aws-cdk@2.1101.0 deploy`

## Useful Commands

* `npm run build`   - Compile TypeScript to JavaScript
* `npm run watch`   - Watch for changes and compile
* `npm run test`    - Run Jest unit tests
* `npx cdk deploy`  - Deploy stack to AWS account/region
* `npx cdk diff`    - Compare deployed stack with current state
* `npx cdk synth`   - Emit synthesized CloudFormation template
* `npx cdk destroy` - Destroy the deployed stack

## Configuration Files

- `bin/cdk_backend.ts` - CDK app entry point, defines stack name
- `lib/cdk_backend-stack.ts` - Main stack definition with all resources
- `cdk.json` - CDK Toolkit configuration
- `tsconfig.json` - TypeScript compiler options

## Environment Variables

Lambda functions use the following environment variables (set automatically by CDK):

- `KNOWLEDGE_BASE_ID` - Bedrock knowledge base ID
- `AGENT_ID` - Bedrock agent ID
- `AGENT_ALIAS_ID` - Bedrock agent alias ID
- `TABLE_NAME` - DynamoDB table name
- `S3_BUCKET_NAME` - S3 bucket for documents
- `ADMIN_EMAIL` - Admin notification email
- `USER_POOL_ID` - Cognito user pool ID

## Troubleshooting

### DynamoDB Table Already Exists
If deployment fails due to existing tables, update Lambda directly:
```bash
aws lambda update-function-code --function-name FUNCTION_NAME --zip-file fileb://lambda.zip
```

### CDK Version Mismatch
Error: "Cloud assembly schema version mismatch"
Solution: Use compatible CDK CLI version via npx:
```bash
npx aws-cdk@2.1101.0 deploy
```

### Docker Not Running
Error: "Cannot connect to Docker daemon"
Solution: Start Docker Desktop:
```bash
open -a Docker  # macOS
```

## Knowledge Base Sync

After deploying and uploading PDFs to S3:
1. AWS Console → Bedrock → Knowledge bases
2. Select knowledge base: `national-council-kb`
3. Click "Sync data sources"
4. Wait for sync to complete

## Related Documentation

- [Main README](../README.md) - Project overview and deployment
- [Technical Overview](../docs/TECHNICAL_OVERVIEW.md) - Architecture reference
- [Lambda Handler Documentation](lambda/chatResponseHandler/README.md) - Chat handler details
