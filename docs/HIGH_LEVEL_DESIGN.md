# Learning Navigator - High-Level Design

**System Overview for Client Review**

---

## 🎯 System Purpose

The Learning Navigator is an AI-powered chatbot designed to serve the Mental Health First Aid (MHFA) Learning Ecosystem by providing instant, accurate answers to training-related questions for instructors, learners, and administrative staff.

### Primary Goals
1. **Reduce Administrative Burden** - Automate responses to common MHFA training questions
2. **Improve Accessibility** - 24/7 availability in English and Spanish
3. **Enhance User Experience** - Personalized content based on user roles
4. **Maintain Knowledge Quality** - Admin-managed document repository with AI-powered retrieval

---

## 🏗️ System Architecture

### High-Level Components

```
┌─────────────────────────────────────────────────────────────────┐
│                        End Users                                 │
│         (Instructors, Staff, Learners, General Public)          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Web Application (React)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐   │
│  │ Chat Interface│  │  Admin Portal │  │ Role Selector      │   │
│  │ - Real-time   │  │  - Analytics  │  │ - Personalization │   │
│  │ - Streaming   │  │  - Documents  │  │ - Recommendations │   │
│  └──────────────┘  └──────────────┘  └────────────────────┘   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                     AWS Cloud Services                           │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           API Gateway (WebSocket + REST)                  │  │
│  │  - Real-time chat communication                           │  │
│  │  - Document upload/management APIs                        │  │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       │                                          │
│         ┌─────────────┼─────────────┐                          │
│         ▼             ▼             ▼                          │
│  ┌────────────┐ ┌──────────┐ ┌──────────────┐                │
│  │ Lambda     │ │ Lambda   │ │ Lambda       │                │
│  │ Chat       │ │ WebSocket│ │ Admin/       │                │
│  │ Handler    │ │ Handler  │ │ Analytics    │                │
│  └──────┬─────┘ └──────────┘ └──────────────┘                │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────┐                 │
│  │     AWS Bedrock Agent (AI Engine)        │                 │
│  │  ┌────────────────────────────────────┐  │                 │
│  │  │  Claude Sonnet 4                 │  │                 │
│  │  │  - Natural language understanding  │  │                 │
│  │  │  - Context-aware responses         │  │                 │
│  │  └────────────────────────────────────┘  │                 │
│  │  ┌────────────────────────────────────┐  │                 │
│  │  │  Knowledge Base (Vector DB)        │  │                 │
│  │  │  - MHFA training documents         │  │                 │
│  │  │  - Semantic search capabilities    │  │                 │
│  │  └────────────────────────────────────┘  │                 │
│  └──────────────────────────────────────────┘                 │
│                       │                                          │
│         ┌─────────────┼─────────────┐                          │
│         ▼             ▼             ▼                          │
│  ┌────────────┐ ┌──────────┐ ┌──────────────┐                │
│  │ DynamoDB   │ │ S3       │ │ Amazon SES   │                │
│  │ - Logs     │ │ - PDFs   │ │ - Email      │                │
│  │ - Analytics│ │ - Docs   │ │ - Alerts     │                │
│  └────────────┘ └──────────┘ └──────────────┘                │
│                                                                  │
│  ┌──────────────────────────────────────────┐                 │
│  │     Amazon Cognito                       │                 │
│  │     - Admin authentication               │                 │
│  │     - User management                    │                 │
│  └──────────────────────────────────────────┘                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Key User Flows

### 1. Public User Chat Flow (No Login Required)

```
User → Opens App → Selects Language → Chooses Role (Optional)
  ↓
Asks Question → WebSocket Connection → Lambda Handler
  ↓
AWS Bedrock Agent → Searches Knowledge Base → Generates Response
  ↓
Streams Response Back → User Sees Real-Time Answer with Citations
```

**Key Features:**
- No authentication required for chat
- Real-time streaming responses
- Citation links to source documents
- Multilingual support (EN/ES)

### 2. Admin Portal Flow (Requires Login)

```
Admin → Logs In (Cognito) → Accesses Admin Dashboard
  ↓
Uploads PDF Document → S3 Storage → Knowledge Base Sync
  ↓
Views Analytics → DynamoDB Query → Charts and Metrics Display
  ↓
Reviews Logs → Sentiment Analysis → Conversation Quality Scores
```

**Key Features:**
- Secure admin authentication
- Document management
- Real-time analytics
- Sentiment analysis

### 3. Escalation Flow (Low Confidence Queries)

```
User Question → AI Confidence Score < 90%
  ↓
System Asks for User Email → Email Collected
  ↓
SES Notification → Admin Receives Email → Admin Responds
  ↓
Admin Answer → Knowledge Base Update → Future Queries Improved
```

**Key Features:**
- Human-in-the-loop for uncertain responses
- Automated email notifications
- Continuous knowledge base improvement

---

## 🎨 Frontend Architecture

### Technology Stack
- **Framework**: React 18
- **UI Components**: Material-UI (MUI)
- **State Management**: React Context API
- **Real-Time Communication**: WebSocket API
- **Authentication**: AWS Amplify + Cognito
- **Hosting**: AWS Amplify (CI/CD integrated)

### Key Components

1. **ChatBody** - Main chat interface
   - Real-time message streaming
   - Citation rendering
   - Message history

2. **RoleSelector** - User role selection
   - Instructor, Staff, Learner options
   - Personalized recommendations
   - Quick action queries

3. **AdminDashboard** - Analytics and management
   - Document upload interface
   - Conversation logs viewer
   - Sentiment analysis charts

4. **LanguageToggle** - Multilingual support
   - One-click language switching
   - UI translations
   - Preference persistence

---

## ⚙️ Backend Architecture

### Technology Stack
- **Infrastructure**: AWS CDK (TypeScript)
- **Compute**: AWS Lambda (Python 3.12)
- **AI Engine**: AWS Bedrock (Claude Sonnet 4)
- **Database**: DynamoDB (NoSQL)
- **Storage**: Amazon S3
- **Authentication**: Amazon Cognito
- **Email**: Amazon SES

### Lambda Functions

| Function | Purpose | Trigger |
|----------|---------|---------|
| `chatResponseHandler` | Process chat requests via Bedrock | API Gateway |
| `websocketHandler` | Manage WebSocket connections | WebSocket events |
| `adminFile` | Handle document uploads and sync | REST API |
| `email` | Send escalation notifications | SQS/Direct invoke |
| `logclassifier` | AI sentiment analysis | DynamoDB Stream |
| `userProfile` | User profile management | REST API |
| `escalatedQueries` | Escalation workflow | REST API |
| `responseFeedback` | User feedback collection | REST API |

---

## 🤖 AI & Knowledge Base

### AWS Bedrock Integration

**Model Used:** Claude Sonnet 4
- **Strengths**: Long context window, accurate reasoning, citation generation
- **Use Case**: Natural language understanding and response generation
- **Configuration**: Temperature 0.7, Max tokens 2048

**Knowledge Base:**
- **Type**: Amazon Bedrock Knowledge Base (OpenSearch Serverless)
- **Embedding Model**: Amazon Titan Embeddings G1
- **Data Source**: S3 bucket with MHFA PDF documents
- **Search Type**: Hybrid (semantic + keyword)
- **Retrieval**: Top 5 relevant chunks per query

### Response Generation Process

1. **Query Received** → User question captured via WebSocket
2. **Agent Invocation** → Bedrock Agent processes query
3. **Knowledge Retrieval** → Vector search in knowledge base
4. **Context Assembly** → Top relevant document chunks retrieved
5. **Response Generation** → Claude generates answer with context
6. **Citation Extraction** → Source documents identified
7. **Streaming Response** → Text streamed back to user in real-time

**Typical Response Time:**
- First-time queries: 15-25 seconds (includes KB search)
- Cached/similar queries: Faster response times

---

## 💾 Data Storage & Management

### DynamoDB Tables

1. **SessionLogs** - Chat conversation history
   - Partition Key: `sessionId`
   - Sort Key: `timestamp`
   - Attributes: `userId`, `query`, `response`, `citations`, `confidence`

2. **UserProfiles** - User role preferences
   - Partition Key: `userId`
   - Attributes: `role`, `language`, `preferences`, `lastActive`

3. **EscalatedQueries** - Low-confidence questions
   - Partition Key: `queryId`
   - Attributes: `query`, `userEmail`, `status`, `adminResponse`

### S3 Buckets

1. **Document Storage** - PDF knowledge base files
   - Versioning enabled
   - Lifecycle policies for old versions
   - Automatic sync with Knowledge Base

2. **Log Archives** - Long-term log storage
   - Compressed JSON logs
   - 7-year retention policy

---

## 🔐 Security & Authentication

### Public Chat Interface
- **No authentication required** for read-only chat access
- Rate limiting applied at API Gateway level
- WebSocket connections monitored for abuse

### Admin Portal
- **AWS Cognito User Pool** for authentication
- **Multi-Factor Authentication (MFA)** optional
- **Role-Based Access Control (RBAC)** for admin features
- Session timeout after 1 hour of inactivity

### Data Protection
- **Encryption at rest**: All DynamoDB tables and S3 buckets
- **Encryption in transit**: TLS 1.2+ for all connections
- **PII Handling**: User emails encrypted, no chat content contains PII
- **WCAG 2.1 Level AA** compliance for accessibility

---

## 📊 Analytics & Monitoring

### Sentiment Analysis System

**Evaluation Factors:**
- **Relevance** (30%): How well response addresses query
- **Completeness** (30%): Thoroughness of answer
- **Clarity** (20%): Readability and structure
- **Actionability** (20%): Practical guidance provided

**Scoring:**
- 90-100: Excellent
- 75-89: Good
- 60-74: Acceptable
- 45-59: Needs Improvement
- 0-44: Poor

**AI Model**: Amazon Bedrock Nova Lite (cost-effective for analysis)

### Dashboard Metrics

- **Total Conversations**: Daily/weekly/monthly counts
- **Average Sentiment Score**: Quality trend over time
- **User Roles**: Distribution of instructor/staff/learner queries
- **Language Distribution**: English vs Spanish usage
- **Response Times**: Performance monitoring
- **Escalation Rate**: % of queries requiring human assistance

---

## 🌍 Multilingual Support

### Supported Languages
1. **English** - Primary language
2. **Spanish** - Full UI and response translation

### Implementation
- **UI Translation**: Static text via constants file
- **Response Translation**: Amazon Translate for AI responses
- **User Preference**: Stored in browser localStorage
- **Language Detection**: Automatic or manual selection

---

## 🚀 Deployment & CI/CD

### Infrastructure as Code
- **AWS CDK**: TypeScript-based infrastructure definitions
- **Stack Name**: `LearningNavigatorFeatures`
- **Region**: us-west-2 (Oregon)

### Continuous Deployment
- **Frontend**: AWS Amplify auto-deployment on git push to `main`
- **Backend**: CDK deployment via AWS CodeBuild or manual
- **Lambda Updates**: Direct function update for rapid iteration

### Environment Management
- **Production**: https://main.d1disyogbqgwn4.amplifyapp.com
- **Environment Variables**: Managed via Amplify console
- **Secrets**: AWS Secrets Manager for sensitive data

---

## 📈 Scalability & Performance

### Current Capacity
- **WebSocket Connections**: Up to 10,000 concurrent
- **Lambda Concurrency**: 1,000 concurrent executions
- **Bedrock Throughput**: On-demand (no throttling expected)
- **DynamoDB**: Auto-scaling enabled

### Performance Targets
- **First Response**: < 25 seconds (KB search included)
- **Streaming Latency**: < 500ms per chunk
- **Page Load Time**: < 3 seconds
- **Uptime**: 99.9% availability

### Cost Optimization
- **Lambda**: Pay-per-invocation (serverless)
- **Bedrock**: Pay-per-token usage
- **DynamoDB**: On-demand pricing
- **S3**: Standard storage with lifecycle policies

---

## 🔄 Future Enhancements

### Planned Features
1. **Voice Input** - Speech-to-text integration
2. **Multi-Document Upload** - Batch document processing
3. **Advanced Analytics** - Predictive insights and trends
4. **Mobile App** - Native iOS/Android applications
5. **API Access** - Public API for third-party integrations

### Performance Improvements
1. **Response Caching** - Cache frequent queries
2. **Provisioned Throughput** - Bedrock for faster responses
3. **CDN Integration** - CloudFront for global distribution

---

## 📞 Technical Support

### Infrastructure Monitoring
- **CloudWatch Alarms**: Lambda errors, high latency, failed invocations
- **X-Ray Tracing**: Distributed request tracing
- **CloudWatch Logs**: Centralized logging for all services

### Issue Escalation
1. **Client Reports Issue** → Support team triages
2. **Support Reviews Logs** → CloudWatch and error traces
3. **Development Team Fixes** → Code update and deployment
4. **Verification** → Test in production, confirm resolution

---

**Document Version:** 1.0
**Last Updated:** January 21, 2026
**Prepared For:** Client Testing Review
