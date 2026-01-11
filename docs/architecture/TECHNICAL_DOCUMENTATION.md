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
│  ┌─────────────────┐  ┌──────────────────┐        │
│  │ WebSocket       │  │ CF Evaluator     │        │
│  │ Handler         │→ │ (Role Context)   │        │
│  └─────────────────┘  └────────┬─────────┘        │
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
- CF Evaluator creates role-specific instructions
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

## Role-Based Personalization

### Implementation Overview

#### Frontend Components

**LandingPage Component**
- Manages 2-step flow (language then role)
- Does NOT store role in localStorage
- Passes role via React Router navigation state
- Includes LanguageSelector and RoleSelector

**RoleSelector Component**
- Displays three role cards (Instructor, Staff, Learner)
- Each card has icon, title, description
- Color-coded for visual distinction
- Accepts skipLocalStorage prop to prevent persistence
- Calls parent callback with selected role

**ChatBody Component**
- Extracts role from location.state (React Router)
- Stores role in component state
- Generates role-specific sample queries (9 per role)
- Displays role badge in navigation drawer
- Sends role with every WebSocket message
- Updates UI when role changes

**ChatHeader Component**
- Displays role switcher dropdown
- Shows current role with icon and color
- Three menu items (one per role)
- Calls onRoleChange callback when role changes
- Triggers chat reset to show new queries

#### Backend Processing

**websocketHandler Lambda**
- Entry point for WebSocket messages
- Extracts user_role from message body
- Validates query text
- Forwards complete payload to cfEvaluator
- Includes connectionId for WebSocket response

**cfEvaluator Lambda**
- Core chat evaluation function
- Receives query, session_id, user_role
- Calls get_role_specific_instructions() function
- Creates detailed instructions based on role
- Invokes Bedrock Agent with sessionState
- Passes role context via sessionAttributes
- Streams response back via WebSocket
- Invokes logclassifier for analytics

**Role-Specific Instructions**
- Three distinct instruction sets (instructor, staff, learner)
- Each focuses on role-appropriate topics
- Uses role-appropriate language and tone
- Defaults to learner instructions if role unknown
- Instructor: Professional, pedagogical
- Staff: Administrative, strategic
- Learner: Educational, supportive

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

## Frontend Architecture

### Component Structure

**App.jsx**
- Main application component
- React Router setup
- Route definitions
- AWS Amplify configuration

**LandingPage.jsx**
- Entry point for new users
- 2-step onboarding flow
- Language selection (Step 0)
- Role selection (Step 1)
- Navigation to chat with state

**ChatBody.jsx**
- Main chat interface
- WebSocket connection management
- Message display and streaming
- Role badge and sample queries
- Left navigation drawer

**ChatHeader.jsx**
- Top navigation bar
- Role switcher dropdown
- Language toggle button
- Profile menu (for authenticated users)

**RoleSelector.jsx**
- Role selection cards
- Visual role representation
- Skip localStorage option
- Callback to parent on selection

**AdminDashboard.jsx**
- Protected admin interface
- Document management
- Session analytics
- Escalated queries
- User profiles

### State Management

**React Context**
- User authentication state
- Language preference
- Theme settings

**Component State**
- Chat messages
- WebSocket connection status
- Current user role
- Loading states

**Navigation State**
- User role (passed from landing page)
- Session ID
- Return URLs

### WebSocket Integration

**Connection Lifecycle**
1. User lands on chat page
2. Component establishes WebSocket connection
3. Connection stored in component ref
4. Messages sent via socket.send()
5. Incoming messages handled by socket.onmessage
6. Connection closed on component unmount

**Message Format**
- Outgoing: JSON with action, querytext, session_id, user_role
- Incoming: JSON with message chunks or complete responses
- Streaming: Multiple messages for long responses

---

## Backend Architecture

### Lambda Functions

#### 1. websocketHandler
- **Runtime**: Python 3.12
- **Trigger**: API Gateway WebSocket (sendMessage route)
- **Timeout**: 120 seconds
- **Memory**: 128 MB
- **Purpose**: Entry point for chat messages

**Responsibilities**
- Receive WebSocket messages
- Extract user query and role
- Validate input
- Invoke cfEvaluator asynchronously
- Return 200 OK to client

**Environment Variables**
- RESPONSE_FUNCTION_ARN: cfEvaluator Lambda ARN

#### 2. cfEvaluator
- **Runtime**: Python 3.12 (Docker build)
- **Trigger**: Invoked by websocketHandler
- **Timeout**: 120 seconds
- **Memory**: 512 MB
- **Purpose**: Core chat logic and Bedrock invocation

**Responsibilities**
- Extract role and create role-specific instructions
- Invoke Bedrock Agent with sessionState
- Stream responses back via WebSocket
- Compute confidence scores
- Handle escalations (call action group)
- Invoke log classifier for analytics

**Environment Variables**
- WS_API_ENDPOINT: WebSocket callback URL
- AGENT_ID: Bedrock Agent ID
- AGENT_ALIAS_ID: Bedrock Agent Alias
- LOG_CLASSIFIER_FN_NAME: logclassifier function name

#### 3. notifyAdmin (Action Group)
- **Runtime**: Python 3.12 (Docker build)
- **Trigger**: Bedrock Agent action group
- **Timeout**: 60 seconds
- **Memory**: 256 MB
- **Purpose**: Send escalation emails

**Responsibilities**
- Receive parameters from Bedrock Agent
- Compose email with query details
- Send email via SES
- Store escalated query in DynamoDB
- Return success to agent

**Environment Variables**
- VERIFIED_SOURCE_EMAIL: Sender email
- ADMIN_EMAIL: Recipient email
- ESCALATED_QUERIES_TABLE: DynamoDB table

#### 4. emailHandler
- **Runtime**: Python 3.12
- **Trigger**: Amazon SES (incoming email)
- **Timeout**: 120 seconds
- **Memory**: 2048 MB
- **Purpose**: Process admin replies

**Responsibilities**
- Download email from S3
- Parse email body
- Extract admin answer
- Convert to PDF
- Upload to knowledge base S3
- Trigger Bedrock ingestion job
- Monitor sync status

**Environment Variables**
- SOURCE_BUCKET_NAME: emailBucket
- DESTINATION_BUCKET_NAME: Knowledge base bucket
- KNOWLEDGE_BASE_ID: Bedrock KB ID
- DATA_SOURCE_ID: Bedrock data source ID

#### 5. adminFile
- **Runtime**: Python 3.12
- **Trigger**: API Gateway REST (/files, /sync)
- **Timeout**: 30 seconds
- **Memory**: 1024 MB
- **Purpose**: Document management

**Responsibilities**
- List files in knowledge base S3
- Upload new PDF documents
- Generate pre-signed download URLs
- Delete documents
- Trigger knowledge base sync
- Return job status

**Environment Variables**
- BUCKET_NAME: Knowledge base bucket
- KNOWLEDGE_BASE_ID: Bedrock KB ID
- DATA_SOURCE_ID: Bedrock data source ID

#### 6. sessionLogsFn
- **Runtime**: Python 3.12
- **Trigger**: EventBridge (daily at 23:59 UTC)
- **Timeout**: 30 seconds
- **Memory**: 512 MB
- **Purpose**: Daily log aggregation

**Responsibilities**
- Query CloudWatch Logs Insights
- Extract session metadata
- Aggregate daily statistics
- Store in S3 (dashboardLogsBucket)
- Update DynamoDB with summary

**Environment Variables**
- GROUP_NAME: CloudWatch log group
- BUCKET: Dashboard logs bucket
- DYNAMODB_TABLE: Session logs table

#### 7. retrieveSessionLogsFn
- **Runtime**: Python 3.12
- **Trigger**: API Gateway REST (/session-logs)
- **Timeout**: 10 seconds
- **Memory**: 256 MB
- **Purpose**: Fetch session logs for admin

**Responsibilities**
- Parse query parameters (date range, filters)
- Query DynamoDB
- Return session logs as JSON
- Support pagination

**Environment Variables**
- DYNAMODB_TABLE: Session logs table

#### 8. escalatedQueriesFn
- **Runtime**: Python 3.12
- **Trigger**: API Gateway REST (/escalated-queries)
- **Timeout**: 10 seconds
- **Memory**: 256 MB
- **Purpose**: List escalated queries

**Responsibilities**
- Query DynamoDB with GSI
- Filter by status (pending/resolved)
- Support date range filtering
- Return query details

**Environment Variables**
- ESCALATED_QUERIES_TABLE: DynamoDB table

#### 9. updateQueryStatusFn
- **Runtime**: Python 3.12
- **Trigger**: API Gateway REST (PUT /escalated-queries)
- **Timeout**: 10 seconds
- **Memory**: 256 MB
- **Purpose**: Update query status

**Responsibilities**
- Parse request body
- Update DynamoDB item
- Set resolved_at timestamp
- Return success/failure

**Environment Variables**
- ESCALATED_QUERIES_TABLE: DynamoDB table

#### 10. userProfileFn
- **Runtime**: Python 3.12
- **Trigger**: API Gateway REST (/user-profile, /recommendations)
- **Timeout**: 30 seconds
- **Memory**: 256 MB
- **Purpose**: Manage user profiles

**Responsibilities**
- Get user profile from DynamoDB
- Create/update profile
- Store role preferences
- Generate personalized recommendations
- Track interaction history

**Environment Variables**
- USER_PROFILE_TABLE: DynamoDB table
- USER_POOL_ID: Cognito User Pool ID

#### 11. logclassifier
- **Runtime**: Python 3.12
- **Trigger**: Invoked by cfEvaluator
- **Timeout**: 30 seconds
- **Memory**: 512 MB
- **Purpose**: Sentiment analysis

**Responsibilities**
- Receive session data
- Invoke Bedrock Nova Lite for sentiment
- Compute sentiment score (0-100)
- Store results in DynamoDB
- Return score to caller

**Environment Variables**
- BUCKET: S3 backup bucket
- DYNAMODB_TABLE: Session logs table

---

## Database Design

### DynamoDB Schema Design

#### Session Logs Table

**Access Patterns**
1. Get all sessions for a date range
2. Get single session by ID
3. Query by role
4. Query by confidence score range

**Attributes**
- session_id (PK): Unique UUID for each chat session
- timestamp (SK): ISO 8601 timestamp
- user_id: Optional, Cognito sub or guest UUID
- user_query: Full text of user's question
- agent_response: Complete AI response
- confidence_score: Integer 0-100
- sentiment_score: Integer 0-100
- language: "EN" or "ES"
- role: "instructor", "staff", "learner", or "guest"

**Indexes**
- Primary: session_id + timestamp
- Consider GSI: role + timestamp (for role-based analytics)

#### Escalated Queries Table

**Access Patterns**
1. List all pending queries
2. List all resolved queries
3. Get single query by ID
4. Query by date range

**Attributes**
- query_id (PK): UUID
- timestamp (SK): ISO 8601 timestamp
- user_email: Email for admin follow-up
- query_text: Original user question
- agent_response: Partial/low-confidence answer
- status: "pending" or "resolved"
- admin_reply: Optional text from email
- resolved_at: Optional timestamp

**Indexes**
- Primary: query_id + timestamp
- GSI StatusIndex: status + timestamp

#### User Profiles Table

**Access Patterns**
1. Get profile by userId
2. List all profiles of a specific role
3. Find users by language preference

**Attributes**
- userId (PK): Cognito sub or guest UUID
- role: "instructor", "staff", or "learner"
- language: "EN" or "ES"
- preferences: MAP type for flexible settings
- interaction_history: LIST of recent queries
- created_at: ISO 8601 timestamp
- last_login: ISO 8601 timestamp

**Indexes**
- Primary: userId only

---

## API Documentation

### WebSocket API

**Endpoint**: `wss://<api-id>.execute-api.<region>.amazonaws.com/production`

#### Routes

**$connect**
- Establishes WebSocket connection
- No payload needed
- Returns connection ID

**sendMessage**
- Sends chat message to backend
- Payload structure:
  - action: "sendMessage"
  - querytext: User's question
  - session_id: Unique session identifier
  - user_role: "instructor" | "staff" | "learner"

**$disconnect**
- Closes WebSocket connection
- Automatic cleanup

#### Response Format
- Streamed chunks for long responses
- Each chunk contains partial message
- Final message includes confidence score
- Citations included in response

### REST API

**Base URL**: `https://<api-id>.execute-api.<region>.amazonaws.com/prod`

**Authentication**: All endpoints require JWT token in Authorization header

#### Document Management Endpoints

**GET /files**
- Lists all documents in knowledge base
- Returns: Array of file objects with key, size, lastModified
- Auth: Required

**POST /files**
- Uploads new document
- Body: filename, content (base64)
- Returns: Success message
- Auth: Required

**GET /files/{key}**
- Downloads specific document
- Returns: Pre-signed S3 URL (5 min expiry)
- Auth: Required

**DELETE /files/{key}**
- Deletes document from knowledge base
- Returns: Success message
- Auth: Required

**POST /sync**
- Triggers knowledge base sync
- Returns: Job ID and status
- Auth: Required

#### Analytics Endpoints

**GET /session-logs**
- Lists all chat sessions
- Query params: startDate, endDate, limit
- Returns: Array of session objects
- Auth: Required

**GET /session-logs/{sessionId}**
- Gets single session details
- Returns: Complete session object
- Auth: Required

**GET /escalated-queries**
- Lists escalated queries
- Query params: status (pending/resolved)
- Returns: Array of query objects
- Auth: Required

**PUT /escalated-queries**
- Updates query status
- Body: query_id, status
- Returns: Success message
- Auth: Required

**GET /escalated-queries/{queryId}**
- Gets single query details
- Returns: Complete query object
- Auth: Required

#### User Profile Endpoints

**GET /user-profile**
- Gets current user's profile
- Returns: Profile object
- Auth: Required

**POST /user-profile**
- Creates new user profile
- Body: role, language, preferences
- Returns: Created profile
- Auth: Required

**PUT /user-profile**
- Updates existing profile
- Body: Fields to update
- Returns: Updated profile
- Auth: Required

**GET /recommendations**
- Gets personalized recommendations
- Based on user role
- Returns: Array of recommendation objects
- Auth: Required

---

## Authentication & Authorization

### Amazon Cognito Configuration

#### User Pool
- **Purpose**: Manage admin user authentication
- **Sign-in**: Email-based authentication
- **Self Sign-up**: Disabled (admin creates users)
- **Email Verification**: Automatic
- **Password Policy**: Minimum 8 characters
- **Account Recovery**: Email-only
- **MFA**: Optional (can be enabled per user)

#### Identity Pool
- **Purpose**: Provide temporary AWS credentials
- **Authentication**: Federated via User Pool
- **Unauthenticated Access**: Disabled
- **Role Mapping**: Authenticated users → IAM role

#### User Pool Client
- **Auth Flows**: USER_SRP_AUTH, USER_PASSWORD_AUTH
- **OAuth Flows**: Authorization code grant, implicit grant
- **OAuth Scopes**: openid, email, profile
- **Callback URLs**: Admin dashboard URL
- **Logout URLs**: Home page URL
- **Client Secret**: Not generated (public client)

### API Gateway Authorization

**Cognito User Pool Authorizer**
- Validates JWT tokens automatically
- Checks token signature
- Verifies token expiration
- Extracts user identity (Cognito sub)
- Passes user context to Lambda

**Protected Endpoints**
- All /files endpoints
- All /session-logs endpoints
- All /escalated-queries endpoints
- All /user-profile endpoints
- All /recommendations endpoints

**Public Endpoints**
- WebSocket connection (no auth required for chat)
- Guest chat mode

### Authentication Flow

**Admin Login**
1. User enters email and password
2. Frontend calls Cognito User Pool
3. Cognito validates credentials
4. Returns JWT tokens (ID, Access, Refresh)
5. Frontend stores tokens in localStorage
6. All API requests include ID token
7. API Gateway validates token
8. Lambda receives user identity

**Token Refresh**
- Access tokens expire after 1 hour
- Refresh tokens valid for 30 days
- Frontend automatically refreshes
- Seamless user experience

---

## AI/ML Integration

### Bedrock Agent Workflow

**Agent Invocation Process**
1. Lambda receives user query and role
2. Lambda creates role-specific instructions
3. Lambda invokes Bedrock Agent with:
   - agentId
   - agentAliasId
   - sessionId (for conversation continuity)
   - inputText (user's question)
   - sessionState (role context and instructions)
4. Agent queries Knowledge Base
5. Agent generates embeddings for semantic search
6. Agent retrieves relevant document chunks
7. Agent passes chunks to LLM (Claude 3.5 Sonnet v2)
8. LLM generates response with citations
9. Agent streams response back
10. Lambda forwards to user via WebSocket

**Session State Structure**
- sessionAttributes: Persistent across conversation
  - user_role: Current user role
  - role_instructions: Detailed instructions for LLM
- promptSessionAttributes: Single-turn context
  - role_context: Role-specific guidance

### Knowledge Base (RAG) Process

**Document Ingestion**
1. PDF uploaded to S3 bucket
2. Ingestion job triggered (manual or automatic)
3. Bedrock Data Automation parses PDF
4. Extracts text, images, tables, charts
5. Chunks content (300 tokens, 20% overlap)
6. Generates embeddings (Titan Embed Text v2, 1024 dimensions)
7. Stores vectors in managed vector database
8. Indexes for fast semantic search
9. Status updated to "Available"

**Query Process**
1. User asks question
2. Agent generates query embedding
3. Agent performs vector similarity search
4. Retrieves top K relevant chunks (K=5)
5. Ranks by semantic similarity score
6. Includes chunks in LLM context
7. LLM generates response with citations
8. Agent returns response with source references

**Chunk Metadata**
- Document name
- Page number
- Chunk position
- Similarity score
- Source URL (if available)

### Guardrails Implementation

**Content Filtering**
- **Hate Speech**: HIGH input, MEDIUM output
- **Insults**: HIGH input, MEDIUM output
- **Sexual Content**: HIGH input, MEDIUM output
- **Violence**: HIGH input, MEDIUM output
- **Misconduct**: HIGH input, MEDIUM output
- **Prompt Attack**: HIGH input, NONE output

**Topic Enforcement**
- Only MHFA-related topics
- Blocks off-topic queries
- Returns custom blocked message
- Maintains focus on learning ecosystem

**Modality Support**
- Text input and output
- Image input (future multimodal queries)
- Text-only output currently

---

## Email System

### Amazon SES Configuration

#### Email Sending

**Verified Identities**
- Admin email address must be verified
- Domain verification optional but recommended
- SPF, DKIM, DMARC records configured

**Sending Quotas**
- Sandbox: 200 emails/day, 1 email/second
- Production: 50,000 emails/day (adjustable)
- Request production access via AWS Console

**Email Templates**
- Escalation notification template
- Professional formatting
- Includes query details
- Clear call-to-action

#### Email Receiving

**MX Records Configuration**
- Point domain to AWS SES
- Priority: 10
- Value: inbound-smtp.us-west-2.amazonaws.com

**Receipt Rule Set**
- Name: learning-navigator-email-rules
- Status: Active (set via CDK custom resource)
- Recipients: Admin email address

**Receipt Rule Actions**
1. Store in S3 (emailBucket/incoming/)
2. Trigger Lambda (emailHandler)

**Email Processing**
- Spam scanning enabled
- Virus scanning enabled
- TLS policy: Optional
- Auto-reply: Disabled

### Email-to-Knowledge Base Pipeline

**Complete Pipeline**
1. Admin receives escalation email
2. Admin replies with detailed answer
3. SES receives incoming email
4. Email stored in S3 as raw MIME
5. Lambda triggered by SES
6. Lambda downloads email from S3
7. Lambda parses MIME format
8. Extract reply text (handle multipart)
9. Create PDF with Q&A format
10. Upload PDF to knowledge base S3
11. Trigger Bedrock ingestion job
12. Wait for ingestion completion
13. New content available in KB
14. Future queries retrieve this answer

**Error Handling**
- Invalid email format: Log and skip
- PDF generation failure: Retry logic
- S3 upload failure: DLQ processing
- Ingestion job failure: Alert admin

---

## Monitoring & Logging

### CloudWatch Logs

**Log Groups**
- /aws/lambda/websocketHandler
- /aws/lambda/cfEvaluator
- /aws/lambda/logclassifier
- /aws/lambda/emailHandler
- /aws/lambda/adminFile
- /aws/lambda/sessionLogsFn
- /aws/lambda/retrieveSessionLogsFn
- /aws/lambda/escalatedQueriesFn
- /aws/lambda/updateQueryStatusFn
- /aws/lambda/userProfileFn
- /aws/lambda/notifyAdmin

**Log Retention**
- Default: 7 days (cost optimization)
- Production: 30 days recommended
- Compliance: 90+ days if required

**Structured Logging**
- JSON format preferred
- Include session_id, user_role
- Log levels: INFO, WARN, ERROR
- No sensitive data (PII, passwords)

### CloudWatch Metrics

**Lambda Metrics**
- Invocations (count)
- Errors (count)
- Duration (milliseconds)
- Throttles (count)
- Concurrent executions (count)
- Iterator age (for stream processing)

**API Gateway Metrics**
- Request count
- 4XX errors
- 5XX errors
- Latency (p50, p90, p99)
- Integration latency
- WebSocket connections

**DynamoDB Metrics**
- Consumed read capacity
- Consumed write capacity
- Throttled requests
- System errors
- Conditional check failures

**Bedrock Metrics**
- Model invocations
- Input tokens
- Output tokens
- Latency
- Throttles
- Errors

**Custom Metrics**
- Confidence scores by role
- Escalation rate
- Average sentiment score
- Queries per role

### CloudWatch Alarms

**Critical Alarms**
1. Lambda error rate > 5%
2. API Gateway 5XX errors > 5 in 5 minutes
3. DynamoDB throttling > 0
4. Bedrock daily token usage > 10M
5. WebSocket connection failures > 10 in 5 minutes

**Warning Alarms**
1. Lambda duration > 60 seconds (p99)
2. API Gateway latency > 2 seconds (p90)
3. DynamoDB read capacity > 80%
4. S3 bucket size > 50 GB
5. Low confidence rate > 30%

**Budget Alarms**
- Daily Bedrock spend > $50
- Monthly AWS spend > $500
- Unexpected cost spikes

### Log Insights Queries

**Common Queries**
- Find all errors in last hour
- Calculate average confidence by role
- List most common queries
- Track escalation rate over time
- Identify slow Lambda executions

---

## Security Implementation

### Defense in Depth

**Layer 1: Edge (CloudFront - Optional)**
- DDoS protection (AWS Shield)
- WAF rules (rate limiting, geo-blocking)
- SSL/TLS termination

**Layer 2: Application (API Gateway)**
- CORS policies
- Request throttling
- JWT validation
- Request/response validation

**Layer 3: Authentication (Cognito)**
- Email verification
- Password policies
- MFA support
- Account recovery

**Layer 4: Authorization (IAM)**
- Least privilege policies
- Service-specific roles
- Resource-based policies

**Layer 5: Business Logic (Lambda)**
- Input validation
- Output sanitization
- Error handling

**Layer 6: Content (Bedrock Guardrails)**
- Content filtering
- Topic enforcement
- Prompt injection prevention

**Layer 7: Data (Encryption)**
- At rest: S3 SSE, DynamoDB encryption
- In transit: TLS 1.2+
- Secrets: Secrets Manager with KMS

### IAM Roles & Policies

**Bedrock Agent Role**
- S3 full access (knowledge base)
- Bedrock full access (model invocation)
- CloudWatch full access (logging)

**Lambda Execution Roles**
- Base: CloudWatch Logs write
- Function-specific: Minimal required permissions
- Example: cfEvaluator needs Bedrock, API Gateway, S3 read

**Cognito Authenticated Role**
- S3 PutObject (knowledge base bucket)
- S3 GetObject (knowledge base bucket)
- Scoped to specific bucket paths

### Security Best Practices

**Input Validation**
- Validate query length (max 5000 characters)
- Sanitize special characters
- Check for SQL injection patterns (defense in depth)
- Validate email format

**Output Sanitization**
- Remove internal error details
- Sanitize URLs in responses
- Escape HTML/JavaScript

**Secret Management**
- GitHub token in Secrets Manager
- Admin email via context parameters
- No hardcoded credentials
- Environment variables encrypted

**Network Security**
- Lambda in VPC (optional for private resources)
- S3 buckets private (no public access)
- DynamoDB private endpoints
- API Gateway with throttling

---

## Performance Optimization

### Lambda Optimization

**Right-Size Memory**
- Balance cost vs. speed
- More memory = faster CPU
- Test with different sizes
- cfEvaluator: 512 MB - 1 GB
- adminFile: 1 GB (file processing)
- Others: 256 MB - 512 MB

**Reduce Cold Starts**
- Minimize dependencies
- Use native Python libraries
- Avoid heavy imports (pandas, numpy)
- Provisioned concurrency (production)
- Keep functions warm with pings

**Architecture Choice**
- ARM64 (Graviton2): 20% cheaper, 19% faster
- x86_64: Maximum compatibility
- Use ARM64 for cost optimization

**Timeout Configuration**
- Set appropriate timeouts
- cfEvaluator: 120s (Bedrock calls)
- websocketHandler: 120s (async invocation)
- adminFile: 30s (S3 operations)
- Others: 10-30s

### DynamoDB Optimization

**Capacity Mode**
- On-demand: Unpredictable workloads
- Provisioned: Steady, predictable traffic
- Start with on-demand
- Switch to provisioned if steady

**Query Optimization**
- Use partition key efficiently
- Leverage sort keys for range queries
- Create GSIs for alternate access patterns
- Use sparse indexes

**Item Size**
- Keep items < 4 KB if possible
- Compress large text fields
- Store large content in S3
- Reference via S3 URL in DynamoDB

**Batch Operations**
- Use BatchGetItem for multiple reads
- Use BatchWriteItem for multiple writes
- Reduces API calls and cost

### S3 Optimization

**Storage Class**
- Standard: Frequently accessed
- Intelligent-Tiering: Unknown patterns
- Glacier: Long-term archives
- Use lifecycle policies

**Transfer Acceleration**
- Enable for large uploads
- Use CloudFront edge locations
- Faster uploads from distant regions

**Multipart Upload**
- For files > 100 MB
- Parallel uploads
- Resume capability
- Better performance

**Request Optimization**
- Use prefix for parallelization
- 5,500 GET/s per prefix
- 3,500 PUT/s per prefix
- Design key structure wisely

### Bedrock Optimization

**Model Selection**
- Haiku: Fast, cheap, simple queries
- Sonnet: Balanced, most use cases
- Opus: Complex, high-quality responses
- Use appropriate model per query

**Prompt Optimization**
- Reduce instruction length
- Cache common prompts
- Avoid repetitive context
- Fewer tokens = lower cost

**Response Caching**
- Cache identical queries
- Use DynamoDB or ElastiCache
- Set appropriate TTL
- Invalidate on KB updates

**Batch Processing**
- Group similar queries
- Process in batches
- Reduce API calls
- Lower latency

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

**DNS Setup (Optional)**
- Configure custom domain
- Add CNAME records
- SSL certificate via ACM

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

### Git Workflow

**Feature Development**
- Create feature branch
- Make code changes
- Test locally
- Commit with descriptive messages

**Pull Request**
- Push branch to GitHub
- Create pull request
- Amplify creates preview environment
- Review and test preview

**Merge to Main**
- Approve pull request
- Merge to main branch
- Amplify auto-deploys production
- Monitor deployment status

### Testing Lambda Locally

**Using SAM CLI**
- Install AWS SAM CLI
- Create test event JSON
- Run sam local invoke
- View function output

**Using AWS Console**
- Navigate to Lambda function
- Create test event
- Click "Test" button
- View execution results

---

## Testing Strategy

### Unit Testing

**Frontend Tests**
- Framework: Jest + React Testing Library
- Component rendering tests
- User interaction tests
- State management tests
- Mock WebSocket connections

**Backend Tests**
- Framework: pytest
- Function unit tests
- Mock AWS service calls
- Test error handling
- Validate input/output

### Integration Testing

**API Testing**
- Test WebSocket message flow
- Test REST API endpoints
- Verify authentication
- Check data persistence

**Service Integration**
- Test Lambda → Bedrock
- Test Lambda → DynamoDB
- Test Lambda → S3
- Test SES → Lambda

### End-to-End Testing

**User Flows**
- Complete chat flow
- Role selection flow
- Admin dashboard flow
- Document upload flow

**Tools**
- Playwright or Cypress
- Automated browser testing
- Visual regression testing

### Performance Testing

**Load Testing**
- Simulate multiple users
- Test WebSocket connections
- Measure response times
- Identify bottlenecks

**Stress Testing**
- Test system limits
- Maximum concurrent users
- Recovery from failures
- Auto-scaling verification

---

## Troubleshooting Guide

### Common Issues

#### Issue 1: WebSocket Connection Fails

**Symptoms**
- Chat messages not sending
- Connection timeout errors
- Console shows WebSocket errors

**Solutions**
- Verify WebSocket URL in environment variables
- Check API Gateway WebSocket API status
- Verify Lambda execution role permissions
- Check CloudWatch logs for errors
- Ensure CORS configured correctly

#### Issue 2: Bedrock Agent Empty Response

**Symptoms**
- Chat shows loading indefinitely
- No response from AI
- Timeout errors

**Solutions**
- Check Bedrock Agent status (must be "Prepared")
- Verify knowledge base has documents
- Check IAM role has Bedrock permissions
- Review guardrails configuration
- Check CloudWatch logs for errors

#### Issue 3: Knowledge Base Sync Fails

**Symptoms**
- New documents not appearing in responses
- Ingestion job fails
- Sync status stuck

**Solutions**
- Verify PDFs are valid (not corrupted)
- Check PDF not password-protected
- Ensure files in correct S3 bucket
- Verify Bedrock has S3 read permissions
- Wait 10-15 minutes for large documents
- Check ingestion job logs

#### Issue 4: Role Not Persisting

**Symptoms**
- Chat always shows "Learner"
- Selected role doesn't appear
- Role badge incorrect

**Solutions**
- Verify LandingPage passes role in navigation state
- Check ChatBody extracts role from location.state
- Ensure RoleSelector uses skipLocalStorage prop
- Clear browser cache and test again
- Check browser console for errors

#### Issue 5: Admin Cannot Login

**Symptoms**
- "Incorrect username or password"
- "User does not exist"
- Token validation errors

**Solutions**
- Verify user exists in Cognito User Pool
- Check email address spelling
- Reset user password via console
- Verify Cognito User Pool ID correct
- Check Amplify auth configuration

#### Issue 6: High AWS Costs

**Symptoms**
- Unexpected large bill
- Bedrock charges high
- Cost alerts triggered

**Solutions**
- Check Bedrock token usage in CloudWatch
- Implement response caching
- Use Haiku model for simple queries
- Optimize prompt lengths
- Set daily spending alarms
- Review Lambda memory allocation

### Diagnostic Commands

**Check Lambda Logs**
- aws logs tail /aws/lambda/cfEvaluator --follow

**Check DynamoDB Item**
- aws dynamodb get-item --table-name TableName --key {...}

**Check S3 Bucket**
- aws s3 ls s3://bucket-name/

**Check Bedrock Agent**
- aws bedrock-agent get-agent --agent-id <ID>

**Check Ingestion Job**
- aws bedrock-agent get-ingestion-job --knowledge-base-id <ID> --data-source-id <ID> --ingestion-job-id <ID>

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

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [Amazon Bedrock User Guide](https://docs.aws.amazon.com/bedrock/)
- [React Documentation](https://react.dev/)
- [Material-UI Documentation](https://mui.com/)
- [AWS Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
- [DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)

---

**Document Version**: 2.0 (Code-Free)
**Last Updated**: January 9, 2026
**Authors**: Development Team
**Status**: Production Ready