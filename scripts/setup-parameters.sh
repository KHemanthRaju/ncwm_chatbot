#!/bin/bash

# Setup AWS Parameter Store values for CodeBuild deployment
# This script helps you configure the required parameters in AWS Parameter Store

set -e

echo "=========================================="
echo "AWS Parameter Store Setup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}ERROR: AWS CLI is not installed${NC}"
    echo "Please install AWS CLI: https://aws.amazon.com/cli/"
    exit 1
fi

# Check AWS credentials
echo "Checking AWS credentials..."
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}ERROR: AWS credentials not configured${NC}"
    echo "Please run: aws configure"
    exit 1
fi

AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=$(aws configure get region || echo "us-west-2")

echo -e "${GREEN}✓${NC} AWS Account ID: $AWS_ACCOUNT_ID"
echo -e "${GREEN}✓${NC} AWS Region: $AWS_REGION"
echo ""

# Prompt for values
echo "Please provide the following information:"
echo ""

read -p "GitHub Repository Owner (e.g., your-org or your-username): " GITHUB_OWNER
read -p "GitHub Repository Name (e.g., ncwm-chatbot): " GITHUB_REPO
read -p "Admin Email Address: " ADMIN_EMAIL

# Validate inputs
if [ -z "$GITHUB_OWNER" ] || [ -z "$GITHUB_REPO" ] || [ -z "$ADMIN_EMAIL" ]; then
    echo -e "${RED}ERROR: All fields are required${NC}"
    exit 1
fi

# Validate email format
if [[ ! "$ADMIN_EMAIL" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
    echo -e "${YELLOW}WARNING: Email format may be invalid${NC}"
    read -p "Continue anyway? (y/n): " CONTINUE
    if [ "$CONTINUE" != "y" ]; then
        exit 1
    fi
fi

echo ""
echo "=========================================="
echo "Configuration Summary"
echo "=========================================="
echo "GitHub Owner: $GITHUB_OWNER"
echo "GitHub Repo: $GITHUB_REPO"
echo "Admin Email: $ADMIN_EMAIL"
echo "AWS Region: $AWS_REGION"
echo ""

read -p "Create these parameters in AWS Parameter Store? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ]; then
    echo "Aborted."
    exit 0
fi

echo ""
echo "=========================================="
echo "Step 1: Creating IAM Role for CodeBuild"
echo "=========================================="

# Check if role already exists
if aws iam get-role --role-name LearningNavigatorCodeBuildRole &> /dev/null; then
    echo -e "${YELLOW}⚠${NC} IAM role 'LearningNavigatorCodeBuildRole' already exists"
else
    echo "Creating IAM role..."

    # Create trust policy
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

    # Create role
    aws iam create-role \
        --role-name LearningNavigatorCodeBuildRole \
        --assume-role-policy-document "$TRUST_POLICY" \
        --description "Service role for Learning Navigator CodeBuild deployment" \
        > /dev/null

    echo -e "${GREEN}✓${NC} IAM role created"

    # Wait for role to be available
    sleep 2
fi

# Attach permissions policy
echo "Attaching permissions policy..."
aws iam attach-role-policy \
    --role-name LearningNavigatorCodeBuildRole \
    --policy-arn arn:aws:iam::aws:policy/AdministratorAccess \
    2>/dev/null && echo -e "${GREEN}✓${NC} Permissions attached" || echo -e "${YELLOW}⚠${NC} Permissions may already be attached"

echo ""
echo "=========================================="
echo "Step 2: Creating Parameter Store Values"
echo "=========================================="

# Create parameters
aws ssm put-parameter \
    --name "/learning-navigator/github-owner" \
    --value "$GITHUB_OWNER" \
    --type "String" \
    --overwrite \
    --region "$AWS_REGION" \
    --description "GitHub repository owner for Learning Navigator" \
    2>/dev/null && echo -e "${GREEN}✓${NC} Created /learning-navigator/github-owner" || echo -e "${YELLOW}⚠${NC} Parameter may already exist"

aws ssm put-parameter \
    --name "/learning-navigator/github-repo" \
    --value "$GITHUB_REPO" \
    --type "String" \
    --overwrite \
    --region "$AWS_REGION" \
    --description "GitHub repository name for Learning Navigator" \
    2>/dev/null && echo -e "${GREEN}✓${NC} Created /learning-navigator/github-repo" || echo -e "${YELLOW}⚠${NC} Parameter may already exist"

aws ssm put-parameter \
    --name "/learning-navigator/admin-email" \
    --value "$ADMIN_EMAIL" \
    --type "String" \
    --overwrite \
    --region "$AWS_REGION" \
    --description "Admin email address for Learning Navigator" \
    2>/dev/null && echo -e "${GREEN}✓${NC} Created /learning-navigator/admin-email" || echo -e "${YELLOW}⚠${NC} Parameter may already exist"

echo ""
echo "=========================================="
echo "✓ AWS Setup Complete!"
echo "=========================================="
echo ""
echo "✅ IAM Role: LearningNavigatorCodeBuildRole"
echo "✅ Parameters created in Parameter Store:"
echo "   - /learning-navigator/github-owner"
echo "   - /learning-navigator/github-repo"
echo "   - /learning-navigator/admin-email"
echo ""
echo "=========================================="
echo "Next Steps:"
echo "=========================================="
echo ""
echo "1. Enable Bedrock Model Access:"
echo "   - Open AWS Console → Search 'Bedrock'"
echo "   - Click 'Model access' → 'Manage model access'"
echo "   - Enable: Claude 3.5 Sonnet, Claude 3 Haiku, Titan Embeddings"
echo "   - Click 'Request model access' (wait 2-3 minutes)"
echo ""
echo "2. Create CodeBuild Project:"
echo "   - Run: cd $(dirname "$0") && ./create-codebuild-project.sh"
echo "   - OR manually in AWS Console → CodeBuild → Create build project"
echo ""
echo "3. Deploy:"
echo "   - AWS Console → CodeBuild → Start build"
echo "   - OR run: aws codebuild start-build --project-name learning-navigator-deploy"
echo ""