#!/bin/bash

# Script to create a new admin user in AWS Cognito
# Usage: ./scripts/create-admin-user.sh <email> <temporary-password>

USER_POOL_ID="us-west-2_F4rwE0BpC"
REGION="us-west-2"

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: $0 <email> <temporary-password>"
    echo "Example: $0 newadmin@example.com TempPass123!"
    exit 1
fi

EMAIL="$1"
TEMP_PASSWORD="$2"

echo "Creating admin user with email: $EMAIL"
echo "User Pool ID: $USER_POOL_ID"
echo ""

# Create the user
aws cognito-idp admin-create-user \
    --user-pool-id "$USER_POOL_ID" \
    --username "$EMAIL" \
    --user-attributes Name=email,Value="$EMAIL" Name=email_verified,Value=true \
    --temporary-password "$TEMP_PASSWORD" \
    --message-action SUPPRESS \
    --region "$REGION"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ User created successfully!"
    echo ""
    echo "Login credentials:"
    echo "  Email: $EMAIL"
    echo "  Temporary Password: $TEMP_PASSWORD"
    echo ""
    echo "⚠️  The user will be prompted to change their password on first login."
    echo ""
    echo "To access the admin portal:"
    echo "  1. Navigate to: https://your-app-url.com/admin-login"
    echo "  2. Enter the email and temporary password"
    echo "  3. Set a new permanent password (min 8 characters)"
else
    echo ""
    echo "❌ Failed to create user. Check the error message above."
    exit 1
fi
