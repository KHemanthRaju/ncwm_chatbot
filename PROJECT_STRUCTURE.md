# Project Structure

## Root Directory

```
ncwm_chatbot_2/
├── README.md                      # Main project documentation
├── CODEBUILD_DIRECT_DEPLOY.md     # Deployment guide (AWS CodeBuild)
├── buildspec.yml                  # CodeBuild deployment pipeline
├── cdk_backend/                   # Backend infrastructure (AWS CDK)
├── frontend/                      # React frontend application
├── scripts/                       # Utility scripts
└── docs/                          # Additional documentation
```

---

## Backend (cdk_backend/)

Infrastructure as Code using AWS CDK.

```
cdk_backend/
├── bin/
│   └── cdk_backend.ts            # CDK app entry point (stack: national_council_backend)
├── lib/
│   └── cdk_backend-stack.ts      # Main stack definition
├── lambda/
│   ├── chatResponseHandler/      # Main chat handler (Bedrock integration)
│   ├── websocketHandler/         # WebSocket connection handler
│   ├── sessionLogs/              # Session logging handler
│   ├── retrieveSessionLogs/      # Admin: Retrieve logs
│   ├── feedback/                 # User feedback handler
│   ├── escalatedQueries/         # Admin: Escalated queries
│   ├── logclassifier/            # Sentiment analysis
│   ├── email/                    # Email notifications
│   ├── emailReply/               # Email reply handler
│   ├── adminFile/                # Admin file operations
│   ├── userProfile/              # User profile management
│   ├── kb-sync/                  # Knowledge Base sync
│   └── streamingHandler/         # Streaming response handler
├── cdk.json                      # CDK configuration
├── package.json                  # Node.js dependencies
└── tsconfig.json                 # TypeScript configuration
```

---

## Frontend (frontend/)

React 18 application with Material-UI.

```
frontend/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── Components/
│   │   ├── AdminDashboard.jsx           # Admin dashboard (main)
│   │   ├── ConversationLogs.jsx         # Conversation logs table
│   │   ├── EscalatedQueries.jsx         # Escalated queries management
│   │   ├── ChatInterface.jsx            # User chat interface
│   │   ├── ErrorBoundary.jsx            # Error boundary component
│   │   ├── Login.jsx                    # Login page
│   │   ├── Signup.jsx                   # Signup page
│   │   └── ProtectedRoute.jsx           # Route protection
│   ├── utilities/
│   │   ├── auth.js                      # Cognito authentication
│   │   ├── websocket.js                 # WebSocket client
│   │   ├── api.js                       # API client
│   │   └── logger.js                    # Production logger
│   ├── App.js                           # Main app component
│   ├── index.js                         # React entry point
│   └── App.css                          # Global styles
├── .env.local                           # Local environment (gitignored)
├── package.json                         # Node.js dependencies
└── README.md                            # Frontend documentation
```

---

## Scripts (scripts/)

Utility scripts for setup and testing.

```
scripts/
├── setup-parameters.sh           # AWS Parameter Store setup (automated)
├── create-admin-user.sh          # Create Cognito admin user
├── deploy.sh                     # Local deployment script
├── extract_pdf_urls.py           # Extract URLs from PDFs
├── test-file-upload.sh           # Test file upload functionality
└── test_admin_apis.py            # Test admin API endpoints
```

---

## Documentation (docs/)

```
docs/
├── README.md                            # Docs overview
├── ADMIN_USER_MANAGEMENT.md             # Admin user management guide
├── KB_AUTO_SYNC.md                      # Knowledge Base auto-sync setup
├── TROUBLESHOOTING_FILE_UPLOAD.md       # File upload troubleshooting
└── WCAG_ACCESSIBILITY_IMPROVEMENTS.md   # Accessibility improvements
```

---

## Key Files

### Deployment
- **buildspec.yml** - CodeBuild deployment pipeline (deploys backend + frontend)
- **CODEBUILD_DIRECT_DEPLOY.md** - Step-by-step deployment guide

### Backend
- **cdk_backend/bin/cdk_backend.ts** - Stack name: `national_council_backend`
- **cdk_backend/lib/cdk_backend-stack.ts** - Infrastructure definition

### Frontend
- **frontend/src/App.js** - Main React app
- **frontend/src/Components/AdminDashboard.jsx** - Admin interface
- **frontend/src/Components/ChatInterface.jsx** - User chat

### Configuration
- **cdk_backend/cdk.json** - CDK configuration
- **frontend/package.json** - Frontend dependencies
- **cdk_backend/package.json** - Backend dependencies

---

## AWS Resources Created

### Compute
- **Lambda Functions**: 15+ handlers (chat, websocket, admin, etc.)
- **API Gateway**: WebSocket API + REST API

### Storage
- **DynamoDB**:
  - `NCMWDashboardSessionlogs` - Chat session logs
  - `escalated_queries_table` - Escalated queries
- **S3 Buckets**: Dashboard logs, Amplify hosting

### Security
- **Cognito User Pool**: User authentication
- **IAM Roles**: Lambda execution roles

### AI
- **Bedrock Agent**: Claude AI integration
- **Knowledge Base**: Document retrieval

### Frontend Hosting
- **Amplify App**: React app hosting + CDN

---

## Environment Variables

### Backend (from Parameter Store)
- `/learning-navigator/github-owner` - GitHub username
- `/learning-navigator/github-repo` - Repository name
- `/learning-navigator/admin-email` - Admin email

### Frontend (injected by CodeBuild)
- `REACT_APP_API_ENDPOINT` - REST API URL
- `REACT_APP_WS_ENDPOINT` - WebSocket URL
- `REACT_APP_COGNITO_USER_POOL_ID` - Cognito User Pool
- `REACT_APP_COGNITO_CLIENT_ID` - Cognito Client ID
- `REACT_APP_COGNITO_REGION` - AWS Region

---

## Deployment Flow

1. **AWS Console → CodeBuild → Start Build**
2. CodeBuild clones GitHub repo
3. **Phase 1**: Deploy backend (CDK → CloudFormation)
   - Creates Lambda, API Gateway, DynamoDB, Cognito, Bedrock
4. **Phase 2**: Build frontend (React)
   - Injects backend API URLs
   - Builds production bundle
5. **Phase 3**: Deploy frontend (Amplify)
   - Uploads to Amplify CDN
6. **Output**: Application URLs in build logs

---

## Tech Stack

**Backend:**
- AWS CDK (TypeScript)
- Python 3.12 (Lambda)
- AWS Bedrock (Claude AI)
- DynamoDB (NoSQL)
- API Gateway (WebSocket + REST)

**Frontend:**
- React 18
- Material-UI
- AWS Amplify (hosting)
- Cognito (auth)

**Infrastructure:**
- AWS CloudFormation
- AWS CodeBuild (CI/CD)
- AWS Amplify (hosting)

---

## Getting Started

1. **Deploy**: Follow [CODEBUILD_DIRECT_DEPLOY.md](CODEBUILD_DIRECT_DEPLOY.md)
2. **Test**: Visit Amplify URL
3. **Admin**: Login with admin email (check email for password)

---

## Support

- **Logs**: CloudWatch → `/aws/codebuild/learning-navigator`
- **Stack**: CloudFormation → `national_council_backend`
- **Frontend**: Amplify console
