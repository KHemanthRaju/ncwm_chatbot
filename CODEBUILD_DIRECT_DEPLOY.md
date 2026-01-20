# Deploy Directly from AWS CodeBuild

Deploy without GitHub integration - CodeBuild automatically clones the repo and executes deployment.

---

## Prerequisites

- ✅ AWS Account with console access
- ✅ Code in GitHub (public or private repo)
- ✅ Admin email address

---

## Step 1: Create Parameters in AWS (3 min)

1. Open **AWS Console** → Search **"Systems Manager"**
2. Click **"Parameter Store"**
3. Create these 3 parameters:

| Parameter Name | Value | Type |
|---|---|---|
| `/learning-navigator/github-owner` | Your GitHub username (e.g., `etloaner`) | String |
| `/learning-navigator/github-repo` | `ncwm_chatbot_2` | String |
| `/learning-navigator/admin-email` | `admin@example.com` | String |

For each parameter:
- Click **"Create parameter"**
- Enter name and value
- Type: `String`
- Tier: `Standard`
- Click **"Create parameter"**

---

## Step 2: Create IAM Role (2 min)

1. Open **AWS Console** → Search **"IAM"**
2. Click **"Roles"** → **"Create role"**
3. Select:
   - **Trusted entity**: `AWS service`
   - **Use case**: `CodeBuild`
   - Click **"Next"**
4. Permissions:
   - Search: `AdministratorAccess`
   - ✅ Check the box
   - Click **"Next"**
5. Role name: `LearningNavigatorCodeBuildRole`
6. Click **"Create role"**

---

## Step 3: Enable Bedrock Models (3 min)

1. Open **AWS Console** → Search **"Bedrock"**
2. Click **"Model access"** (left sidebar)
3. Click **"Manage model access"**
4. Check these:
   - ✅ **Claude 3.5 Sonnet v2**
   - ✅ **Claude 3 Haiku**
   - ✅ **Titan Embeddings G1 - Text**
5. Click **"Request model access"**
6. Wait 2-3 minutes, refresh until "Access granted"

---

## Step 4: Create CodeBuild Project (5 min)

1. Open **AWS Console** → Search **"CodeBuild"**
2. Click **"Create build project"**

### Fill in:

**Project configuration:**
```
Project name: learning-navigator-deploy
```

**Source:**
```
Source provider: GitHub
Repository: Connect using OAuth
  → Click "Connect to GitHub"
  → Authorize AWS CodeBuild
  → Select your repository
Branch: main
Source version: refs/heads/main

Build specification: Use a buildspec file
Buildspec name: buildspec.yml
```

**Environment:**
```
Environment image: Managed image
Operating system: Amazon Linux 2
Runtime: Standard
Image: aws/codebuild/standard:7.0
Environment type: Linux

☑️ Privileged (MUST check this!)

Service role: Existing service role
Role ARN: LearningNavigatorCodeBuildRole
```

**Buildspec:**
```
Build specifications: Use a buildspec file
Buildspec name: buildspec.yml
```

**Logs:**
```
☑️ CloudWatch logs
Group name: /aws/codebuild/learning-navigator
```

**Additional configuration:**
```
Timeout: 1 hours 0 minutes
Compute: 3 GB memory, 2 vCPUs
```

3. Click **"Create build project"**

---

## Step 5: Deploy (1 click, 15-20 min automated)

1. In CodeBuild, click your project: `learning-navigator-deploy`
2. Click **"Start build"** (orange button)
3. Click **"Start build"** again in the popup
4. Watch the logs in real-time

### What Happens:

```
Phase 1: Install (2-3 min)
  → Installing Node.js, Python, CDK, AWS CLI

Phase 2: Pre-build (1 min)
  → Validating credentials
  → Loading parameters from Parameter Store
  → CodeBuild automatically clones your GitHub repo

Phase 3: Build - Backend (8-10 min)
  → Installing backend dependencies
  → Deploying CDK stack to CloudFormation
  → Creating Lambda, API Gateway, DynamoDB, Cognito
  → Extracting API endpoints

Phase 4: Build - Frontend (3-4 min)
  → Injecting backend URLs into frontend
  → Installing React dependencies
  → Building production bundle

Phase 5: Post-build - Amplify (3-5 min)
  → Deploying to Amplify CDN
  → Waiting for deployment completion
```

---

## Step 6: Get Your URLs (from logs)

Scroll to the bottom of the build logs. You'll see:

```
==========================================
✅ DEPLOYMENT SUCCESSFUL!
==========================================

🌐 Application URL:
   https://main.d1a2b3c4d5e6f7.amplifyapp.com

📊 Admin Dashboard:
   https://main.d1a2b3c4d5e6f7.amplifyapp.com/admin

🔗 Backend APIs:
   WebSocket: wss://abc123.execute-api.us-west-2.amazonaws.com/production
   REST API: https://xyz789.execute-api.us-west-2.amazonaws.com/production

👤 Admin Login:
   Email: admin@example.com
   (Check email for temporary password)
==========================================
```

**Copy these URLs!**

---

## Step 7: Test

### Test User App:
1. Open application URL
2. Sign up with test account
3. Send message: "What is NCWM?"
4. Verify AI response

### Test Admin Dashboard:
1. Open admin URL
2. Login with admin email
3. Check email for temporary password
4. Verify conversation logs appear

---

## Step 8: Add Custom Domain (Optional)

1. Go to **Amplify** console → Click your app
2. Click **"Domain management"** → **"Add domain"**
3. Enter: `clientdomain.com`
4. Add subdomain: `chat` → Branch: `main`
5. Copy DNS records shown
6. Add CNAME record in your domain registrar:
   ```
   Type: CNAME
   Name: chat
   Value: d1a2b3c4d5e6f7.cloudfront.net
   ```
7. Wait 10-30 minutes for DNS propagation

App will be at: `https://chat.clientdomain.com`

---

## Auto-Deploy on Git Push

After initial deployment, every git push triggers automatic deployment:

```bash
git add .
git commit -m "Update chatbot"
git push origin main

# CodeBuild automatically starts building
# Check progress in AWS Console
```

---

## How It Works

1. **You**: Click "Start build" in CodeBuild
2. **CodeBuild**: Automatically clones your GitHub repo
3. **CodeBuild**: Reads `buildspec.yml` from your repo
4. **CodeBuild**: Executes all commands in buildspec
5. **CodeBuild**: Deploys backend (CDK → CloudFormation)
6. **CodeBuild**: Deploys frontend (React → Amplify)
7. **You**: Get deployment URLs in logs

**Zero local setup required!**

---

## Troubleshooting

### Build Fails: "Parameter not found"
**Fix:** Go to Parameter Store, verify all 3 parameters exist

### Build Fails: "Access denied to Bedrock"
**Fix:** Go to Bedrock → Model access, verify models are approved

### Build Fails: "Role not found"
**Fix:** Go to IAM → Roles, verify `LearningNavigatorCodeBuildRole` exists

### Build Fails: "GitHub connection failed"
**Fix:**
1. Edit CodeBuild project → Source
2. Click "Connect to GitHub" again
3. Reauthorize

### Frontend blank page
**Fix:** Check browser console (F12) for API endpoint errors

---

## View Logs

**Real-time:** CodeBuild build page

**Historical:** CloudWatch → Log groups → `/aws/codebuild/learning-navigator`

---

## Redeploy

**Same version:**
```
CodeBuild → learning-navigator-deploy → Start build
```

**New code:**
```bash
git push origin main  # Auto-triggers deployment
```

**Rollback:**
```
Amplify → Deployments → Select previous → Redeploy
```

---

## Cost

**Monthly (1K users):** $100-200
- Amplify: $5-15
- Lambda: $5-20
- API Gateway: $3-10
- DynamoDB: $5-15
- Bedrock: $50-150

**Set budget alerts:**
AWS Console → Billing → Budgets → Create budget

---

## Summary

```
1. Create 3 parameters (Systems Manager)
2. Create IAM role (IAM)
3. Enable Bedrock models (Bedrock)
4. Create CodeBuild project (CodeBuild)
5. Click "Start build"
6. Wait 15-20 minutes
7. Get URLs from logs
8. Test application

Done! 🎉
```

**CodeBuild automatically:**
- ✅ Clones your GitHub repo
- ✅ Deploys backend infrastructure
- ✅ Builds and deploys frontend
- ✅ Auto-deploys on every git push

No local machine required!