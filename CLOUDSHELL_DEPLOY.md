# Deploy from AWS CloudShell - One Script

Deploy the entire application from AWS CloudShell with a single script.

---

## Quick Start (3 Commands)

### 1. Open AWS CloudShell
- Login to AWS Console
- Click the CloudShell icon (terminal icon in top right)
- Wait for CloudShell to load

### 2. Clone Repository
```bash
git clone https://github.com/YOUR-USERNAME/ncwm_chatbot_2.git
cd ncwm_chatbot_2/scripts
```

### 3. Run Deployment Script
```bash
./deploy-from-cloudshell.sh
```

**That's it!** The script will:
- ✅ Create IAM role
- ✅ Create Parameter Store values
- ✅ Create CodeBuild project
- ✅ Start deployment
- ✅ Monitor progress
- ✅ Display URLs when complete

---

## What You'll Be Asked

The script will prompt you for:

```
GitHub Repository Owner: your-github-username
GitHub Repository Name: ncwm_chatbot_2
Admin Email Address: admin@example.com
GitHub Personal Access Token: (optional, for private repos)
```

Then:
```
Continue with deployment? (y/n): y
```

**One Manual Step:**
```
Please enable Bedrock models:
  1. Open AWS Console in new tab
  2. Go to Amazon Bedrock
  3. Click "Model access" → "Manage model access"
  4. Enable: Claude 3.5 Sonnet, Claude 3 Haiku, Titan Embeddings
  5. Click "Request model access"

Press ENTER after you've enabled Bedrock models...
```

Then:
```
Start deployment now? (y/n): y
```

---

## Complete Example Session

```bash
# In AWS CloudShell:

$ git clone https://github.com/etloaner/ncwm_chatbot_2.git
$ cd ncwm_chatbot_2/scripts
$ ./deploy-from-cloudshell.sh

==========================================
AWS CloudShell - Automated Deployment
==========================================

✓ AWS Account ID: 123456789012
✓ AWS Region: us-west-2

Please provide the following information:

GitHub Repository Owner: etloaner
GitHub Repository Name [ncwm_chatbot_2]:
Admin Email Address: admin@company.com
GitHub Personal Access Token: (leave blank)

==========================================
Configuration Summary
==========================================
GitHub Owner: etloaner
GitHub Repo: ncwm_chatbot_2
GitHub URL: https://github.com/etloaner/ncwm_chatbot_2.git
Admin Email: admin@company.com
AWS Region: us-west-2
AWS Account: 123456789012

Continue with deployment? (y/n): y

==========================================
STEP 1: Creating IAM Role
==========================================
Creating IAM role...
✓ IAM role created
✓ Permissions attached

==========================================
STEP 2: Creating Parameter Store Values
==========================================
✓ Created /learning-navigator/github-owner
✓ Created /learning-navigator/github-repo
✓ Created /learning-navigator/admin-email

==========================================
STEP 3: Requesting Bedrock Model Access
==========================================
⚠ Bedrock model access must be enabled manually

Please open AWS Console in another tab and:
  1. Go to Amazon Bedrock service
  2. Click 'Model access' in left sidebar
  3. Click 'Manage model access'
  4. Enable: Claude 3.5 Sonnet, Claude 3 Haiku, Titan Embeddings
  5. Click 'Request model access'

Press ENTER after you've enabled Bedrock models... [PRESS ENTER]

==========================================
STEP 4: Creating CodeBuild Project
==========================================
Creating CodeBuild project...
✓ CodeBuild project created

==========================================
STEP 5: Starting Deployment
==========================================
Start deployment now? (y/n): y
Starting build...
✓ Build started!
Build ID: learning-navigator-deploy:abc123-def456

Monitoring build progress...
This will take 15-20 minutes...

[10:15:30] Phase: INSTALL | Status: IN_PROGRESS
[10:16:00] Phase: PRE_BUILD | Status: IN_PROGRESS
[10:17:00] Phase: BUILD | Status: IN_PROGRESS
[10:25:00] Phase: POST_BUILD | Status: IN_PROGRESS
[10:30:00] Phase: COMPLETED | Status: SUCCEEDED

==========================================
✅ DEPLOYMENT SUCCESSFUL!
==========================================

Backend APIs:
  WebSocketURL: wss://abc123.execute-api.us-west-2.amazonaws.com/production
  RestAPIURL: https://xyz789.execute-api.us-west-2.amazonaws.com/production
  UserPoolId: us-west-2_XXXXXXXXX
  AmplifyAppId: d1a2b3c4d5e6f7

🌐 Application URLs:
   Frontend: https://main.d1a2b3c4d5e6f7.amplifyapp.com
   Admin: https://main.d1a2b3c4d5e6f7.amplifyapp.com/admin

👤 Admin Login:
   Email: admin@company.com
   (Check email for temporary password)

==========================================
✓ Setup Complete!
==========================================

Resources Created:
  ✅ IAM Role: LearningNavigatorCodeBuildRole
  ✅ Parameter Store: /learning-navigator/*
  ✅ CodeBuild Project: learning-navigator-deploy
  ✅ CloudFormation Stack: national_council_backend
```

---

## What the Script Does

### Automatically Creates:
1. **IAM Role** (`LearningNavigatorCodeBuildRole`) with AdministratorAccess
2. **Parameter Store values**:
   - `/learning-navigator/github-owner`
   - `/learning-navigator/github-repo`
   - `/learning-navigator/admin-email`
3. **CodeBuild Project** (`learning-navigator-deploy`)
4. **Triggers deployment** and monitors progress
5. **Displays URLs** when complete

### You Only Need To:
1. ✅ Open AWS CloudShell
2. ✅ Clone repo
3. ✅ Run script
4. ✅ Enable Bedrock models (one time, in Console)
5. ✅ Wait ~20 minutes

---

## For Private Repositories

If your GitHub repo is private, you need a Personal Access Token:

### 1. Generate GitHub Token
- Go to: https://github.com/settings/tokens
- Click "Generate new token (classic)"
- Scopes: ✅ `repo` (full control)
- Copy the token

### 2. Provide Token When Prompted
```bash
GitHub Personal Access Token: ghp_xxxxxxxxxxxxxxxxxxxx
```

The script will store it securely in Parameter Store as a SecureString.

---

## Troubleshooting

### "Permission denied" error
```bash
chmod +x deploy-from-cloudshell.sh
./deploy-from-cloudshell.sh
```

### Build fails: "Bedrock AccessDenied"
- Go to Bedrock console
- Verify models show "Access granted"
- Wait 2-3 minutes after requesting access
- Restart build: `aws codebuild start-build --project-name learning-navigator-deploy`

### Build fails: "GitHub connection failed"
- Make sure your repo is public, OR
- Provide a GitHub Personal Access Token when prompted

### Script hangs
- Press Ctrl+C
- Check what step it's on
- Run manually:
  ```bash
  aws codebuild start-build --project-name learning-navigator-deploy
  aws logs tail /aws/codebuild/learning-navigator --follow
  ```

---

## After Deployment

### Test Application
```bash
# Open the Amplify URL in browser
# Sign up, login, send test message
```

### Check Admin Dashboard
```bash
# Open admin URL in browser
# Login with admin email
# Check email for temporary password
```

### Add Custom Domain
```bash
# In Amplify console:
# Domain management → Add domain → chat.yourdomain.com
# Update DNS with CNAME records shown
```

### Monitor Logs
```bash
# View CodeBuild logs
aws logs tail /aws/codebuild/learning-navigator --follow

# View Lambda logs
aws logs tail /aws/lambda/chatResponseHandler --follow

# Check stack
aws cloudformation describe-stacks --stack-name national_council_backend
```

### Redeploy
```bash
# From CloudShell:
aws codebuild start-build --project-name learning-navigator-deploy

# Or just push to GitHub (auto-deploys)
```

---

## Manual Steps (if needed)

If you want to run steps manually instead of using the script:

```bash
# 1. Create IAM role
aws iam create-role \
  --role-name LearningNavigatorCodeBuildRole \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"Service": "codebuild.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }]
  }'

aws iam attach-role-policy \
  --role-name LearningNavigatorCodeBuildRole \
  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess

# 2. Create parameters
aws ssm put-parameter \
  --name "/learning-navigator/github-owner" \
  --value "your-username" \
  --type "String"

aws ssm put-parameter \
  --name "/learning-navigator/github-repo" \
  --value "ncwm_chatbot_2" \
  --type "String"

aws ssm put-parameter \
  --name "/learning-navigator/admin-email" \
  --value "admin@example.com" \
  --type "String"

# 3. Enable Bedrock models (in Console)

# 4. Run the script for CodeBuild project creation
./deploy-from-cloudshell.sh
```

---

## Summary

**One script. One command. Complete deployment.**

```bash
# Open AWS CloudShell, then:
git clone https://github.com/YOUR-USERNAME/ncwm_chatbot_2.git
cd ncwm_chatbot_2/scripts
./deploy-from-cloudshell.sh

# Enable Bedrock models when prompted
# Wait 20 minutes
# Get your URLs
# Done! 🎉
```

**No local setup. No manual AWS Console clicking. Just run the script.**
