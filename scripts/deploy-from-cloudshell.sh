#!/bin/bash

################################################################################
# Complete Automated Deployment Script for AWS CloudShell
#
# Usage:
#   1. Open AWS CloudShell in AWS Console
#   2. Run: git clone https://github.com/YOUR-USERNAME/ncwm_chatbot_2.git
#   3. Run: cd ncwm_chatbot_2/scripts
#   4. Run: ./deploy-from-cloudshell.sh
#
# This script will:
#   - Create IAM role for CodeBuild
#   - Create Parameter Store values
#   - Request Bedrock model access
#   - Create CodeBuild project
#   - Start deployment
################################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "=========================================="
echo "AWS CloudShell - Automated Deployment"
echo "=========================================="
echo ""

# Get AWS account info
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=$(aws configure get region || echo "us-west-2")

echo -e "${GREEN}✓${NC} AWS Account ID: $AWS_ACCOUNT_ID"
echo -e "${GREEN}✓${NC} AWS Region: $AWS_REGION"
echo ""

# Prompt for configuration
echo "Please provide the following information:"
echo ""

read -p "GitHub Repository Owner (your GitHub username): " GITHUB_OWNER
read -p "GitHub Repository Name [ncwm_chatbot_2]: " GITHUB_REPO
GITHUB_REPO=${GITHUB_REPO:-ncwm_chatbot_2}

read -p "Admin Email Address: " ADMIN_EMAIL
read -p "GitHub Personal Access Token (for private repos, leave blank for public): " GITHUB_TOKEN

# Validate inputs
if [ -z "$GITHUB_OWNER" ] || [ -z "$GITHUB_REPO" ] || [ -z "$ADMIN_EMAIL" ]; then
    echo -e "${RED}ERROR: Required fields cannot be empty${NC}"
    exit 1
fi

GITHUB_URL="https://github.com/$GITHUB_OWNER/$GITHUB_REPO.git"

echo ""
echo "=========================================="
echo "Configuration Summary"
echo "=========================================="
echo "GitHub Owner: $GITHUB_OWNER"
echo "GitHub Repo: $GITHUB_REPO"
echo "GitHub URL: $GITHUB_URL"
echo "Admin Email: $ADMIN_EMAIL"
echo "AWS Region: $AWS_REGION"
echo "AWS Account: $AWS_ACCOUNT_ID"
echo ""

read -p "Continue with deployment? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ]; then
    echo "Deployment cancelled."
    exit 0
fi

################################################################################
# STEP 1: Create IAM Role
################################################################################

echo ""
echo "=========================================="
echo "STEP 1: Creating IAM Role"
echo "=========================================="

ROLE_NAME="LearningNavigatorCodeBuildRole"

if aws iam get-role --role-name $ROLE_NAME &> /dev/null; then
    echo -e "${YELLOW}⚠${NC} IAM role '$ROLE_NAME' already exists"
else
    echo "Creating IAM role..."

    TRUST_POLICY=$(cat <<'EOF'
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Service": "codebuild.amazonaws.com"},
    "Action": "sts:AssumeRole"
  }]
}
EOF
)

    aws iam create-role \
        --role-name $ROLE_NAME \
        --assume-role-policy-document "$TRUST_POLICY" \
        --description "Service role for Learning Navigator CodeBuild deployment" \
        > /dev/null

    echo -e "${GREEN}✓${NC} IAM role created"
    sleep 2
fi

# Attach permissions
echo "Attaching permissions policy..."
aws iam attach-role-policy \
    --role-name $ROLE_NAME \
    --policy-arn arn:aws:iam::aws:policy/AdministratorAccess \
    2>/dev/null && echo -e "${GREEN}✓${NC} Permissions attached" || echo -e "${YELLOW}⚠${NC} Permissions already attached"

################################################################################
# STEP 2: Create Parameter Store Values
################################################################################

echo ""
echo "=========================================="
echo "STEP 2: Creating Parameter Store Values"
echo "=========================================="

aws ssm put-parameter \
    --name "/learning-navigator/github-owner" \
    --value "$GITHUB_OWNER" \
    --type "String" \
    --overwrite \
    --region "$AWS_REGION" \
    --description "GitHub repository owner" \
    2>/dev/null && echo -e "${GREEN}✓${NC} Created /learning-navigator/github-owner" || echo -e "${YELLOW}⚠${NC} Parameter updated"

aws ssm put-parameter \
    --name "/learning-navigator/github-repo" \
    --value "$GITHUB_REPO" \
    --type "String" \
    --overwrite \
    --region "$AWS_REGION" \
    --description "GitHub repository name" \
    2>/dev/null && echo -e "${GREEN}✓${NC} Created /learning-navigator/github-repo" || echo -e "${YELLOW}⚠${NC} Parameter updated"

aws ssm put-parameter \
    --name "/learning-navigator/admin-email" \
    --value "$ADMIN_EMAIL" \
    --type "String" \
    --overwrite \
    --region "$AWS_REGION" \
    --description "Admin email address" \
    2>/dev/null && echo -e "${GREEN}✓${NC} Created /learning-navigator/admin-email" || echo -e "${YELLOW}⚠${NC} Parameter updated"

# Store GitHub token if provided
if [ ! -z "$GITHUB_TOKEN" ]; then
    aws ssm put-parameter \
        --name "/learning-navigator/github-token" \
        --value "$GITHUB_TOKEN" \
        --type "SecureString" \
        --overwrite \
        --region "$AWS_REGION" \
        --description "GitHub Personal Access Token" \
        2>/dev/null && echo -e "${GREEN}✓${NC} Created /learning-navigator/github-token" || echo -e "${YELLOW}⚠${NC} Token updated"
fi

################################################################################
# STEP 3: Request Bedrock Model Access
################################################################################

echo ""
echo "=========================================="
echo "STEP 3: Requesting Bedrock Model Access"
echo "=========================================="

# Note: Bedrock model access cannot be fully automated via CLI
# The CLI doesn't support requesting model access, must be done via Console

echo -e "${YELLOW}⚠${NC} Bedrock model access must be enabled manually"
echo ""
echo "Please open AWS Console in another tab and:"
echo "  1. Go to Amazon Bedrock service"
echo "  2. Click 'Model access' in left sidebar"
echo "  3. Click 'Manage model access'"
echo "  4. Enable: Claude 3.5 Sonnet v2, Claude 3 Haiku, Titan Embeddings G1"
echo "  5. Click 'Request model access'"
echo ""
read -p "Press ENTER after you've enabled Bedrock models..."

################################################################################
# STEP 4: Create CodeBuild Project
################################################################################

echo ""
echo "=========================================="
echo "STEP 4: Creating CodeBuild Project"
echo "=========================================="

PROJECT_NAME="learning-navigator-deploy"

# Check if project exists
if aws codebuild batch-get-projects --names $PROJECT_NAME &> /dev/null; then
    echo -e "${YELLOW}⚠${NC} CodeBuild project '$PROJECT_NAME' already exists"
    read -p "Delete and recreate? (y/n): " RECREATE
    if [ "$RECREATE" = "y" ]; then
        aws codebuild delete-project --name $PROJECT_NAME
        echo -e "${GREEN}✓${NC} Deleted existing project"
    else
        echo "Skipping project creation..."
        SKIP_PROJECT=true
    fi
fi

if [ "$SKIP_PROJECT" != "true" ]; then
    echo "Creating CodeBuild project..."

    # Determine source auth type
    if [ ! -z "$GITHUB_TOKEN" ]; then
        SOURCE_AUTH='{
            "type": "OAUTH",
            "resource": "'$GITHUB_TOKEN'"
        }'
    else
        SOURCE_AUTH='{
            "type": "OAUTH"
        }'
    fi

    PROJECT_CONFIG=$(cat <<EOF
{
  "name": "$PROJECT_NAME",
  "description": "Automated deployment for Learning Navigator",
  "source": {
    "type": "GITHUB",
    "location": "$GITHUB_URL",
    "buildspec": "buildspec.yml",
    "gitCloneDepth": 1,
    "reportBuildStatus": true,
    "auth": $SOURCE_AUTH
  },
  "sourceVersion": "refs/heads/main",
  "artifacts": {
    "type": "NO_ARTIFACTS"
  },
  "cache": {
    "type": "LOCAL",
    "modes": ["LOCAL_CUSTOM_CACHE", "LOCAL_SOURCE_CACHE"]
  },
  "environment": {
    "type": "LINUX_CONTAINER",
    "image": "aws/codebuild/standard:7.0",
    "computeType": "BUILD_GENERAL1_MEDIUM",
    "privilegedMode": true,
    "environmentVariables": [
      {
        "name": "AWS_DEFAULT_REGION",
        "value": "$AWS_REGION",
        "type": "PLAINTEXT"
      },
      {
        "name": "AWS_ACCOUNT_ID",
        "value": "$AWS_ACCOUNT_ID",
        "type": "PLAINTEXT"
      }
    ]
  },
  "serviceRole": "arn:aws:iam::$AWS_ACCOUNT_ID:role/$ROLE_NAME",
  "timeoutInMinutes": 60,
  "queuedTimeoutInMinutes": 480,
  "badgeEnabled": false,
  "logsConfig": {
    "cloudWatchLogs": {
      "status": "ENABLED",
      "groupName": "/aws/codebuild/learning-navigator"
    }
  }
}
EOF
)

    aws codebuild create-project --cli-input-json "$PROJECT_CONFIG" > /dev/null
    echo -e "${GREEN}✓${NC} CodeBuild project created"
fi

################################################################################
# STEP 5: Start Deployment
################################################################################

echo ""
echo "=========================================="
echo "STEP 5: Starting Deployment"
echo "=========================================="

read -p "Start deployment now? (y/n): " START_BUILD
if [ "$START_BUILD" = "y" ]; then
    echo "Starting build..."

    BUILD_OUTPUT=$(aws codebuild start-build --project-name $PROJECT_NAME --output json)
    BUILD_ID=$(echo $BUILD_OUTPUT | jq -r '.build.id')

    echo -e "${GREEN}✓${NC} Build started!"
    echo "Build ID: $BUILD_ID"
    echo ""
    echo "Monitoring build progress..."
    echo "This will take 15-20 minutes..."
    echo ""

    # Monitor build
    while true; do
        BUILD_STATUS=$(aws codebuild batch-get-builds --ids $BUILD_ID --query 'builds[0].buildStatus' --output text)
        CURRENT_PHASE=$(aws codebuild batch-get-builds --ids $BUILD_ID --query 'builds[0].currentPhase' --output text)

        echo -e "${BLUE}[$(date +%H:%M:%S)]${NC} Phase: $CURRENT_PHASE | Status: $BUILD_STATUS"

        if [ "$BUILD_STATUS" = "SUCCEEDED" ]; then
            echo ""
            echo -e "${GREEN}=========================================="
            echo "✅ DEPLOYMENT SUCCESSFUL!"
            echo "==========================================${NC}"
            echo ""

            # Get CloudFormation outputs
            echo "Fetching deployment URLs..."
            sleep 5

            STACK_OUTPUTS=$(aws cloudformation describe-stacks \
                --stack-name national_council_backend \
                --query 'Stacks[0].Outputs' \
                --output json 2>/dev/null || echo "[]")

            if [ "$STACK_OUTPUTS" != "[]" ]; then
                echo ""
                echo "Backend APIs:"
                echo "$STACK_OUTPUTS" | jq -r '.[] | "  \(.OutputKey): \(.OutputValue)"'
            fi

            # Get Amplify URL
            AMPLIFY_APP_ID=$(echo "$STACK_OUTPUTS" | jq -r '.[] | select(.OutputKey=="AmplifyAppId") | .OutputValue' 2>/dev/null)

            if [ ! -z "$AMPLIFY_APP_ID" ] && [ "$AMPLIFY_APP_ID" != "null" ]; then
                AMPLIFY_DOMAIN=$(aws amplify get-app --app-id $AMPLIFY_APP_ID --query 'app.defaultDomain' --output text 2>/dev/null)
                echo ""
                echo "🌐 Application URLs:"
                echo "   Frontend: https://main.$AMPLIFY_DOMAIN"
                echo "   Admin: https://main.$AMPLIFY_DOMAIN/admin"
            fi

            echo ""
            echo "👤 Admin Login:"
            echo "   Email: $ADMIN_EMAIL"
            echo "   (Check email for temporary password)"
            echo ""
            echo "View detailed logs:"
            echo "   aws logs tail /aws/codebuild/learning-navigator --follow"
            echo ""
            break
        elif [ "$BUILD_STATUS" = "FAILED" ] || [ "$BUILD_STATUS" = "FAULT" ] || [ "$BUILD_STATUS" = "TIMED_OUT" ] || [ "$BUILD_STATUS" = "STOPPED" ]; then
            echo ""
            echo -e "${RED}=========================================="
            echo "❌ DEPLOYMENT FAILED"
            echo "==========================================${NC}"
            echo ""
            echo "Build Status: $BUILD_STATUS"
            echo ""
            echo "View logs:"
            echo "  aws logs tail /aws/codebuild/learning-navigator --follow"
            echo ""
            echo "Or check AWS Console:"
            echo "  CodeBuild → learning-navigator-deploy → Build history"
            echo ""
            exit 1
        fi

        sleep 30
    done
else
    echo ""
    echo "Build not started. To start manually:"
    echo "  aws codebuild start-build --project-name $PROJECT_NAME"
    echo ""
    echo "Or in AWS Console:"
    echo "  CodeBuild → learning-navigator-deploy → Start build"
fi

echo ""
echo "=========================================="
echo "✓ Setup Complete!"
echo "=========================================="
echo ""
echo "Resources Created:"
echo "  ✅ IAM Role: $ROLE_NAME"
echo "  ✅ Parameter Store: /learning-navigator/*"
echo "  ✅ CodeBuild Project: $PROJECT_NAME"
echo "  ✅ CloudFormation Stack: national_council_backend"
echo ""
echo "Next Steps:"
echo "  1. Test your application at the Amplify URL"
echo "  2. Login to admin dashboard with: $ADMIN_EMAIL"
echo "  3. Add custom domain in Amplify console (optional)"
echo ""
echo "Useful Commands:"
echo "  # View logs"
echo "  aws logs tail /aws/codebuild/learning-navigator --follow"
echo ""
echo "  # Check stack"
echo "  aws cloudformation describe-stacks --stack-name national_council_backend"
echo ""
echo "  # Redeploy"
echo "  aws codebuild start-build --project-name $PROJECT_NAME"
echo ""
