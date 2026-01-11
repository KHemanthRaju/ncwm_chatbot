# Admin User Management

## Overview

The Learning Navigator admin portal uses AWS Cognito for authentication. This document explains how to manage admin users.

## Current Setup

- **User Pool ID**: `us-west-2_F4rwE0BpC` (Blueberry-User-Pool)
- **Region**: `us-west-2`
- **Current Users**: 2
  - `admin@ncwm.com` (CONFIRMED)
  - `hkoneti@asu.edu` (CONFIRMED)

## Creating a New Admin User

### Method 1: Using the Script (Recommended)

```bash
./scripts/create-admin-user.sh <email> <temporary-password>
```

**Example:**
```bash
./scripts/create-admin-user.sh newadmin@example.com TempPass123!
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Method 2: Using AWS CLI Directly

```bash
aws cognito-idp admin-create-user \
    --user-pool-id us-west-2_F4rwE0BpC \
    --username <email> \
    --user-attributes Name=email,Value=<email> Name=email_verified,Value=true \
    --temporary-password <temporary-password> \
    --message-action SUPPRESS \
    --region us-west-2
```

### Method 3: Using AWS Console

1. Go to AWS Console → Cognito → User Pools
2. Select `Blueberry-User-Pool` (us-west-2_F4rwE0BpC)
3. Click "Create user"
4. Enter:
   - Username: User's email address
   - Email: Same email address
   - Temporary password: Create a secure temporary password
   - Check "Mark email as verified"
   - Select "Send an invitation message" or "Suppress" (if using SUPPRESS, share credentials manually)
5. Click "Create user"

## First Login Process

When a new admin user logs in for the first time:

1. Navigate to the admin login page: `/admin-login`
2. Enter email and temporary password
3. They will be prompted: "Please set a new permanent password"
4. Enter a new password (min 8 characters, must meet password policy)
5. Click "Set New Password"
6. They will be redirected to the admin dashboard

## Listing All Users

```bash
aws cognito-idp list-users \
    --user-pool-id us-west-2_F4rwE0BpC \
    --region us-west-2 \
    --query 'Users[*].[Username, Attributes[?Name==`email`].Value | [0], UserStatus]' \
    --output table
```

## Deleting a User

```bash
aws cognito-idp admin-delete-user \
    --user-pool-id us-west-2_F4rwE0BpC \
    --username <email> \
    --region us-west-2
```

## Resetting a User's Password

```bash
aws cognito-idp admin-set-user-password \
    --user-pool-id us-west-2_F4rwE0BpC \
    --username <email> \
    --password <new-temporary-password> \
    --permanent false \
    --region us-west-2
```

The user will be required to change this password on next login.

## Guest Mode

The admin portal also supports a "Guest Mode" for demonstration purposes:
- Click "Continue as Guest" on the login page
- Provides read-only access without authentication
- No real Cognito credentials required
- Useful for demos and previews

## Logout Functionality

All admin pages include a "Logout" button in the header that:
- Signs out from AWS Cognito
- Clears local storage tokens
- Redirects to the login page

## Security Notes

1. **Never share permanent passwords** - Always use temporary passwords that must be changed on first login
2. **Email verification** - All users should have verified email addresses
3. **Password policy** - Enforced by Cognito: min 8 chars, uppercase, lowercase, number, special char
4. **Token expiry** - Cognito tokens expire after a set time (default 1 hour for access tokens)
5. **No user groups** - Currently, all authenticated users have full admin access (no role-based access control)

## Troubleshooting

### User can't log in
```bash
# Check user status
aws cognito-idp admin-get-user \
    --user-pool-id us-west-2_F4rwE0BpC \
    --username <email> \
    --region us-west-2
```

### Force confirm a user (if stuck in unconfirmed state)
```bash
aws cognito-idp admin-confirm-sign-up \
    --user-pool-id us-west-2_F4rwE0BpC \
    --username <email> \
    --region us-west-2
```

### Enable a disabled user
```bash
aws cognito-idp admin-enable-user \
    --user-pool-id us-west-2_F4rwE0BpC \
    --username <email> \
    --region us-west-2
```

## Future Enhancements

Consider implementing:
1. **Cognito Groups** for role-based access control (Admin, Viewer, Editor)
2. **Multi-factor authentication (MFA)** for enhanced security
3. **Email invitations** with AWS SES integration
4. **Self-service password reset** via forgot password flow
5. **Admin user management UI** in the admin portal itself
