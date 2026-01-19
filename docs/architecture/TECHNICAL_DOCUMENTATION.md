# Technical Documentation - MHFA Learning Navigator Chatbot

## Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Core Features](#core-features)
5. [Role-Based Personalization](#role-based-personalization)
6. [AWS Services Integration](#aws-services-integration)
7. [Frontend Architecture](#frontend-architecture)
8. [Backend Architecture](#backend-architecture)
9. [Database Design](#database-design)
10. [API Documentation](#api-documentation)
11. [Authentication & Authorization](#authentication--authorization)
12. [AI/ML Integration](#aiml-integration)
13. [Email System](#email-system)
14. [Monitoring & Logging](#monitoring--logging)
15. [Security Implementation](#security-implementation)
16. [Performance Optimization](#performance-optimization)
17. [Deployment Guide](#deployment-guide)
18. [Development Workflow](#development-workflow)
19. [Testing Strategy](#testing-strategy)
20. [Troubleshooting Guide](#troubleshooting-guide)

---

## Project Overview

### Purpose
The MHFA Learning Navigator Chatbot is an AI-powered conversational assistant designed to support the Mental Health First Aid (MHFA) Learning Ecosystem. It provides intelligent, role-based guidance to instructors, staff members, and learners through natural language interactions.

### Key Objectives
- **Intelligent Support**: Answer questions about MHFA training, certification, and resources
- **Role-Based Personalization**: Tailor responses based on user roles (Instructor, Staff, Learner)
- **Multilingual Support**: Provide seamless English ↔ Spanish translation
- **Self-Improving Knowledge Base**: Continuously learn from admin feedback
- **Admin Analytics**: Track usage patterns and user satisfaction

### Target Users
1. **Instructors**: Certified MHFA trainers seeking teaching resources and guidance
2. **Staff**: Organizational administrators managing MHFA programs
3. **Learners**: Course participants seeking information about training and certification
4. **Administrators**: System admins managing content and monitoring performance

---

## System Architecture

### High-Level Architecture

```
┌─────────────┐
│   Users     │
│ (3 Roles)   │
└──────┬──────┘
       │
       ├─── Language Selection (EN/ES)
       └─── Role Selection (Instructor/Staff/Learner)
       │
┌──────▼──────────────────────┐
│   AWS Amplify               │
│   React Frontend            │
│   - Material-UI             │
│   - WebSocket Client        │
│   - Admin Dashboard         │
└──────┬──────────────────────┘
       │
       ├─── WebSocket API ───┐
       └─── REST API ────────┼─── Amazon Cognito (Auth)
                             │
┌────────────────────────────▼────────────────────────┐
│              AWS Lambda Functions                   │
│  ┌─────────────────┐  ┌──────────────────────┐    │
│  │ WebSocket       │  │ chatResponseHandler  │    │
│  │ Handler         │→ │ (Role Context)       │    │
│  └─────────────────┘  └────────┬─────────────┘    │
│                                 │                   │
│  ┌─────────────────┐  ┌────────▼─────────┐        │
│  │ Email Handler   │  │ Admin APIs       │        │
│  │ (Reply Ingestion)│  │ (File/Analytics) │        │
│  └─────────────────┘  └──────────────────┘        │
└────────────────────────────┬────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────┐
│           Amazon Bedrock (AI Engine)                │
│  ┌──────────────────────────────────────────────┐  │
│  │  Bedrock Agent (Claude 3.5 Sonnet v2)       │  │
│  │  - Receives role-specific instructions      │  │
│  │  - Confidence scoring                        │  │
│  │  - Action groups (notify-admin)              │  │
│  └──────────────────┬───────────────────────────┘  │
│                     │                               │
│  ┌──────────────────▼───────────────────────────┐  │
│  │  Knowledge Base (RAG)                        │  │
│  │  - Vector embeddings (Titan v2)              │  │
│  │  - S3 data source                            │  │
│  │  - Bedrock Data Automation                   │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │  Guardrails                                  │  │
│  │  - Content filtering                         │  │
│  │  - Topic enforcement                         │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
       │
       ├─── Amazon Translate (EN ↔ ES)
       │
┌──────▼──────────────────────┐
│   Data Layer                │
│  ┌────────────────────────┐ │
│  │  S3 Buckets            │ │
│  │  - Knowledge Base PDFs │ │
│  │  - Email Storage       │ │
│  │  - Dashboard Logs      │ │
│  └────────────────────────┘ │
│                              │
│  ┌────────────────────────┐ │
│  │  DynamoDB Tables       │ │
│  │  - Session Logs        │ │
│  │  - Escalated Queries   │ │
│  │  - User Profiles       │ │
│  └────────────────────────┘ │
└──────────────────────────────┘
       │
┌──────▼──────────────────────┐
│   Supporting Services       │
│  - Amazon SES (Email)       │
│  - EventBridge (Scheduler)  │
│  - CloudWatch (Monitoring)  │
│  - Secrets Manager          │
└──────────────────��──────────┘
```

### Architecture Principles

1. **Serverless-First**: All compute is serverless (Lambda, Bedrock) for auto-scaling
2. **Event-Driven**: Decoupled services communicate via events (SES, EventBridge)
3. **Infrastructure as Code**: Complete deployment via AWS CDK (TypeScript)
4. **Defense in Depth**: Multiple security layers (Cognito, IAM, Guardrails)
5. **Observability**: Comprehensive logging and metrics (CloudWatch)

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.x | UI framework |
| **TypeScript** | 4.x | Type safety |
| **Material-UI (MUI)** | 5.x | Component library |
| **WebSocket** | Native | Real-time communication |
| **React Router** | 6.x | Client-side routing |
| **Axios** | 1.x | HTTP client for REST APIs |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **AWS Lambda** | Python 3.12 | Serverless compute |
| **AWS CDK** | TypeScript | Infrastructure as Code |
| **Boto3** | Latest | AWS SDK for Python |

### AI/ML Services
| Service | Model/Type | Purpose |
|---------|-----------|---------|
| **Amazon Bedrock Agent** | Claude 3.5 Sonnet v2 | Main chatbot responses |
| **Bedrock Knowledge Base** | Titan Embed Text v2 | Vector search (RAG) |
| **Amazon Translate** | Neural | EN ↔ ES translation |
| **Bedrock Guardrails** | Content Filters | Safety & topic enforcement |

### Data Services
| Service | Type | Purpose |
|---------|------|---------|
| **Amazon S3** | Object Storage | PDFs, emails, logs |
| **Amazon DynamoDB** | NoSQL Database | Sessions, queries, profiles |
| **Amazon SES** | Email Service | Notifications & ingestion |

### Security & Auth
| Service | Purpose |
|---------|---------|
| **Amazon Cognito** | User authentication (JWT) |
| **AWS IAM** | Role-based access control |
| **AWS Secrets Manager** | Secure credential storage |

### DevOps & Monitoring
| Service | Purpose |
|---------|---------|
| **AWS Amplify** | Frontend hosting & CI/CD |
| **Amazon CloudWatch** | Logs, metrics, alarms |
| **Amazon EventBridge** | Scheduled tasks |
| **AWS CloudTrail** | API audit logs |

---

## Core Features

### 1. Role-Based Personalization ⭐ **NEW**

#### Overview
The system provides different experiences based on user roles, from the landing page through AI responses.

#### User Roles
1. **Instructor**
   - Focus: Teaching methodologies, classroom management, instructor resources
   - Sample Queries: "How do I prepare for my first MHFA class?"
   - Response Style: Peer-to-peer, pedagogical insights

2. **Staff**
   - Focus: Program implementation, organizational rollout, metrics
   - Sample Queries: "How do we track employee certifications?"
   - Response Style: Administrative, strategic guidance

3. **Learner**
   - Focus: Basic concepts, course registration, ALGEE action plan
   - Sample Queries: "What is the ALGEE action plan?"
   - Response Style: Educational, supportive, accessible

#### Implementation Flow

**Landing Page (2-Step Flow)**
- Step 1: Language Selection (EN | ES)
- Step 2: Role Selection (Instructor | Staff | Learner)
- Role stored in navigation state (NOT localStorage)
- User must select role every session

**Chat Interface**
- Display role badge with color coding:
  - Instructor: Orange (#EA5E29)
  - Staff: Blue (#064F80)
  - Learner: Light Blue (#7FD3EE)
- Show 9 role-specific sample queries (3 categories × 3 queries each)
- Role switcher dropdown in header
- Chat resets when role changes

**WebSocket Message Payload**
- Includes: action, querytext, session_id, user_role
- Role sent with every message to backend

**Backend Processing**
- WebSocket Handler extracts user_role from payload
- chatResponseHandler creates role-specific instructions
- Bedrock Agent receives role context via sessionState
- Agent tailors response based on role instructions

### 2. Intelligent Chat with Confidence Scoring

#### Confidence-Based Response Strategy

**High Confidence (≥ 90%)**
- Return direct answer with citations
- Include source references from knowledge base
- Show confidence percentage to user
- Include URLs exactly as they appear in sources

**Low Confidence (< 90%)**
- Inform user: "I don't have a reliable answer"
- Request user's email address
- Call action group: notify-admin
- Send escalation email to administrator
- Store query in DynamoDB (EscalatedQueries table)
- Confirm to user: "Admin will follow up at [email]"

#### URL Preservation Rules

The agent is instructed to **always include URLs exactly** as they appear in the knowledge base:
- Copy URLs character-by-character including http:// or https://
- Never say "visit the website" without the actual URL
- Place URLs on their own line or clearly embedded
- Example: "Submit your certificate at: https://www.mentalhealthfirstaid.org/form"

### 3. Multilingual Support (English ↔ Spanish)

#### Translation Flow

**Spanish User Experience**
1. User selects Spanish language on landing page
2. User types query in Spanish: "¿Qué es ALGEE?"
3. Frontend sends via WebSocket to backend
4. Lambda function uses Amazon Translate (ES → EN)
5. Translated query: "What is ALGEE?"
6. Bedrock Agent processes in English
7. Agent generates response in English
8. Lambda function uses Amazon Translate (EN → ES)
9. Frontend displays Spanish response

**Why Process in English?**
- Knowledge base documents are primarily in English
- Better AI comprehension and accuracy
- More consistent quality across languages
- Easier to maintain single knowledge base

### 4. Self-Improving Knowledge Base

#### Admin Reply Ingestion Pipeline

**Complete Flow**
1. User asks complex question (low confidence)
2. System sends escalation email to admin
3. Admin receives notification with query details
4. Admin replies with detailed answer via email
5. SES Receipt Rule captures incoming email
6. Email stored in S3 (emailBucket/incoming/)
7. SES triggers emailHandler Lambda function
8. Lambda downloads and parses email
9. Lambda extracts admin's answer from email body
10. Lambda converts answer to PDF format
11. PDF uploaded to knowledge base S3 bucket
12. Lambda triggers Bedrock ingestion job
13. Bedrock parses PDF and chunks content
14. Bedrock generates embeddings (Titan v2)
15. Bedrock indexes content for future queries
16. Future queries can now retrieve this answer! ✅

**Benefits**
- Continuous learning from expert feedback
- Reduces repeat escalations
- Improves response quality over time
- No manual knowledge base updates needed

### 5. Admin Dashboard

#### Features

**1. Document Management**
- Upload PDF documents to knowledge base
- List all documents with metadata (size, date)
- Download documents via pre-signed URLs
- Delete outdated or incorrect documents
- Trigger manual knowledge base sync
- View sync job status and progress

**2. Session Analytics**
- View complete chat session history
- Filter by date range, role, language
- View sentiment analysis scores
- Track average confidence scores
- Identify common questions by role
- Export data for further analysis

**3. Escalated Queries Management**
- List all escalated queries with status
- Filter by status (pending/resolved)
- View user email and original query
- See AI's partial response
- Mark queries as resolved
- Track resolution time metrics

**4. User Profile Management**
- View user role preferences
- Track interaction history
- Analyze usage patterns by role
- Identify power users
- Generate usage reports

---

## AWS Services Integration

### Amazon Bedrock

#### Agent Configuration
- **Name**: Learning-Navigator
- **Model**: Claude 3.5 Sonnet v2
- **Inference**: Cross-Region Inference Profile (US region)
- **Knowledge Bases**: 1 vector knowledge base
- **Guardrails**: Enabled with content filtering
- **User Input**: Enabled
- **Preparation**: Auto-prepare on changes

#### Knowledge Base Configuration
- **Type**: Vector Knowledge Base
- **Embeddings**: Amazon Titan Embed Text v2 (1024 dimensions)
- **Data Source**: S3 bucket (national-council-s3-pdfs)
- **Parsing**: Bedrock Data Automation (advanced PDF parsing)
- **Chunking**: Default (300 tokens per chunk, 20% overlap)
- **Supplemental Storage**: Separate S3 bucket for multimodal data

#### Guardrails Configuration
- **Name**: LearningNavigator-Guardrails
- **Content Filters**: Hate speech, insults, sexual content, violence, misconduct
- **Input Strength**: HIGH (strict filtering)
- **Output Strength**: MEDIUM (balanced filtering)
- **Prompt Attack**: HIGH input, NONE output (prevent injection)
- **Modalities**: TEXT and IMAGE support
- **Blocked Message**: Custom message for out-of-scope queries

#### Action Groups
- **Name**: notify-admin
- **Purpose**: Send escalation emails for low-confidence queries
- **Executor**: Lambda function (notifyAdmin)
- **Schema**: OpenAPI specification
- **Parameters**: email, querytext, agentResponse
- **Trigger**: Automatically called by agent when confidence < 90%

### Amazon Translate

**Configuration**
- **Supported Languages**: English (en), Spanish (es)
- **Model Type**: Neural Machine Translation
- **Usage**: Bidirectional translation (EN ↔ ES)

**Integration Points**
- Frontend language selection
- Pre-processing: Translate Spanish queries to English
- Post-processing: Translate English responses to Spanish
- Knowledge base remains English-only
- Future: Add more languages without KB changes

### Amazon DynamoDB

#### Session Logs Table
- **Table Name**: NCMWDashboardSessionlogs
- **Partition Key**: session_id (STRING)
- **Sort Key**: timestamp (STRING, ISO 8601)
- **Capacity**: On-demand (auto-scaling)
- **Purpose**: Store chat interactions with metadata

**Attributes**
- user_id (optional for guests)
- user_query (full question text)
- agent_response (AI response)
- confidence_score (0-100)
- sentiment_score (0-100)
- language (EN or ES)
- role (instructor/staff/learner/guest)

#### Escalated Queries Table
- **Table Name**: NCMWEscalatedQueries
- **Partition Key**: query_id (STRING, UUID)
- **Sort Key**: timestamp (STRING)
- **GSI**: StatusIndex (status + timestamp)
- **Purpose**: Track low-confidence queries sent to admin

**Attributes**
- user_email (for admin follow-up)
- query_text (original question)
- agent_response (partial answer)
- status (pending/resolved)
- admin_reply (optional, from email)
- resolved_at (timestamp when marked resolved)

#### User Profiles Table
- **Table Name**: NCMWUserProfiles
- **Partition Key**: userId (STRING)
- **Purpose**: Store user preferences and interaction history

**Attributes**
- role (instructor/staff/learner)
- language (EN or ES)
- preferences (MAP, customizable settings)
- interaction_history (LIST, recent queries)
- created_at (timestamp)
- last_login (timestamp)

### Amazon S3

#### Bucket 1: Knowledge Base (national-council-s3-pdfs)
- **Purpose**: Store PDF documents for RAG
- **Contents**: MHFA training materials, guides, FAQs
- **Access**: Read by Bedrock, Read/Write by Lambda
- **Versioning**: Enabled for disaster recovery
- **Lifecycle**: Archive to Glacier after 90 days

#### Bucket 2: Email Storage (emailBucket)
- **Purpose**: Store incoming SES emails
- **Contents**: Raw email messages (MIME format)
- **Access**: Write by SES, Read by emailHandler
- **Lifecycle**: Delete after 7 days (temporary)

#### Bucket 3: Supplemental Data (supplementalBucket)
- **Purpose**: Multimodal data from Bedrock parsing
- **Contents**: Extracted images, tables, charts
- **Access**: Read/Write by Bedrock Knowledge Base
- **Auto-delete**: Yes (ephemeral data)

#### Bucket 4: Dashboard Logs (dashboardLogsBucket)
- **Purpose**: Archived session logs
- **Contents**: Daily aggregated logs from CloudWatch
- **Access**: Write by sessionLogsFn, Read by admin
- **Retention**: Indefinite (analytics)
---

## Deployment Guide

### Prerequisites

**AWS Account Setup**
- AWS account with admin access
- AWS CLI installed and configured
- Valid payment method
- Region: us-west-2 recommended

**Development Tools**
- Node.js 18.x or later
- Python 3.12
- AWS CDK CLI (npm install -g aws-cdk)
- Git for version control

**GitHub Repository**
- Repository for source code
- GitHub personal access token (for private repos)
- Branch: main or master

**Email Configuration**
- Admin email address
- Email verification in SES
- Domain ownership (optional)

### Deployment Steps

**Step 1: Clone and Install**
- Clone repository to local machine
- Install CDK dependencies (npm install)
- Install frontend dependencies (npm install)

**Step 2: Configure CDK Context**
- Set githubOwner (your GitHub username)
- Set githubRepo (repository name)
- Set adminEmail (verified email)
- Set githubToken (optional for public repos)

**Step 3: Bootstrap CDK**
- Run once per account/region
- Creates S3 bucket for CDK assets
- Creates IAM roles for deployment

**Step 4: Deploy Infrastructure**
- Run cdk synth to generate CloudFormation
- Run cdk deploy --all for complete deployment
- Confirm IAM changes when prompted
- Wait 15-20 minutes for completion

**Step 5: Verify Deployment**
- Check CloudFormation stacks in console
- Verify Lambda functions created
- Confirm Bedrock Agent prepared
- Test WebSocket API endpoint

**Step 6: Upload Initial Content**
- Upload PDF documents to S3
- Trigger knowledge base sync
- Wait for ingestion completion
- Verify documents indexed

**Step 7: Create Admin User**
- Use Cognito console or CLI
- Create user with email
- Set temporary password
- User changes password on first login

**Step 8: Test Application**
- Open Amplify URL in browser
- Select language and role
- Send test query
- Verify AI response

### Post-Deployment Configuration

**SES Production Access**
- Request via AWS Console
- Explain use case
- Wait for approval (24-48 hours)

**CloudWatch Alarms**
- Create alarms for critical metrics
- Set up SNS topics
- Configure email notifications

**Backup Configuration**
- Enable S3 versioning
- Enable DynamoDB PITR
- Configure backup schedules

---

## Development Workflow

### Local Development

**Frontend Development**
- Run React dev server (npm start)
- Configure environment variables
- Connect to deployed backend
- Test on localhost:3000

**Backend Development**
- Edit Lambda code locally
- Use SAM CLI for local testing
- Deploy with hotswap for quick iteration
- Test with curl or Postman

---

## Appendix

### Environment Variables Reference

**Frontend**
- REACT_APP_WEBSOCKET_API: WebSocket endpoint
- REACT_APP_COGNITO_USER_POOL_ID: Cognito User Pool
- REACT_APP_COGNITO_CLIENT_ID: Cognito Client
- REACT_APP_ANALYTICS_API: REST API endpoint
- REACT_APP_AWS_REGION: AWS region

**Backend (Lambda)**
- WS_API_ENDPOINT: WebSocket callback URL
- AGENT_ID: Bedrock Agent ID
- AGENT_ALIAS_ID: Bedrock Agent Alias
- BUCKET_NAME: S3 bucket name
- KNOWLEDGE_BASE_ID: Bedrock KB ID
- DATA_SOURCE_ID: Bedrock data source ID
- DYNAMODB_TABLE: DynamoDB table name
- ADMIN_EMAIL: Admin email address

### Useful Commands

**CDK Commands**
- cdk diff: Show infrastructure changes
- cdk synth: Generate CloudFormation
- cdk deploy: Deploy stacks
- cdk destroy: Delete stacks
- cdk hotswap: Fast dev deployment

**AWS CLI Commands**
- aws lambda invoke: Test Lambda
- aws s3 ls: List S3 contents
- aws dynamodb scan: Query DynamoDB
- aws cognito-idp list-users: List users
- aws logs tail: View logs

**Git Commands**
- git status: Check status
- git add: Stage changes
- git commit: Commit changes
- git push: Push to remote
- git pull: Pull updates

### Additional Resources

**AWS Documentation**
- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [Amazon Bedrock User Guide](https://docs.aws.amazon.com/bedrock/)
- [AWS Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
- [DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)

**Frontend Documentation**
- [React Documentation](https://react.dev/)
- [Material-UI Documentation](https://mui.com/)

**Project Architecture Documentation**
- [Simple Architecture](../SIMPLE_ARCHITECTURE.md) - High-level overview for stakeholders
- [User AWS Architecture](../USER_AWS_ARCHITECTURE.md) - Detailed user flow diagrams
- [Admin AWS Architecture](../ADMIN_AWS_ARCHITECTURE.md) - Detailed admin flow diagrams
- [User Flow Steps](../USER_FLOW_STEPS.md) - 32-step user interaction breakdown
- [Admin Flow Steps](../ADMIN_FLOW_STEPS.md) - 39-step admin workflow breakdown
- [Complete AWS Architecture](../AWS_ARCHITECTURE.md) - Full system architecture

**Deployment & Operations**
- [Deployment Guide](../deployment/CLIENT_DEPLOYMENT_GUIDE.md)
- [Troubleshooting Guide](../TROUBLESHOOTING_FILE_UPLOAD.md)
- [Lambda Renaming Guide](../RENAMING_CFEVALUATOR.md)