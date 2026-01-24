# Learning Navigator - Technical Documentation

**Version:** 1.0
**Last Updated:** January 21, 2026

---

## 🎯 Project Overview

Learning Navigator is an AI-powered chatbot for the Mental Health First Aid (MHFA) Learning Ecosystem. It answers questions about MHFA training using natural language processing and a knowledge base of PDF documents.

**Live URL:** https://main.d1disyogbqgwn4.amplifyapp.com

---

## 🏗️ High-Level Architecture

```
┌─────────────┐
│   Users     │ (Instructors, Staff, Learners)
└──────┬──────┘
       │
       ↓
┌─────────────────────────────────────────┐
│  Frontend (React)                       │
│  - Chat interface                       │
│  - Admin portal                         │
│  - Hosted on AWS Amplify               │
└──────┬──────────────────────────────────┘
       │
       ↓
┌─────────────────────────────────────────┐
│  API Gateway                            │
│  - WebSocket (real-time chat)          │
│  - REST API (admin functions)          │
└──────┬──────────────────────────────────┘
       │
       ↓
┌─────────────────────────────────────────┐
│  Lambda Functions (Python)              │
│  - Chat handler                         │
│  - WebSocket handler                    │
│  - Analytics                            │
│  - Document management                  │
└──────┬──────────────────────────────────┘
       │
       ↓
┌─────────────────────────────────────────┐
│  AWS Bedrock Agent                      │
│  - Claude Sonnet 4 (AI model)          │
│  - Knowledge Base (vector search)      │
└──────┬──────────────────────────────────┘
       │
       ↓
┌─────────────────────────────────────────┐
│  Data Storage                           │
│  - DynamoDB (conversation logs)        │
│  - S3 (PDF documents)                  │
└─────────────────────────────────────────┘
```

---

## 👥 User Features

### 1. **AI Chat Interface**
Users can ask questions and receive instant AI-generated answers with source citations.

### 2. **Real-Time Streaming**
Responses appear progressively as the AI generates them, not all at once.

### 3. **Bilingual Support**
Toggle between English and Spanish with one click.

### 4. **Role-Based Personalization**
Select your role (Instructor/Staff/Learner) to get customized quick-action queries and recommendations.

### 5. **Guest Access**
No login required to use the chat - anyone can start asking questions immediately.

### 6. **Citation Links**
Every answer includes links to source documents for verification.

### 7. **Feedback System**
Users can rate responses with thumbs up/down for quality tracking.

### 8. **Mobile Responsive**
Works on phones, tablets, and desktops.

---

## 🛠️ Admin Features

### 1. **Analytics Dashboard**
- View total queries, user counts, and usage trends
- 7-day usage trend chart
- User sentiment distribution pie chart

### 2. **Conversation Logs**
- Browse all chat transcripts with timestamps
- Filter by date, role, or language
- View user feedback (positive/negative/neutral)

### 3. **Document Management**
- Upload PDF documents to knowledge base
- View all uploaded documents with status
- Trigger manual knowledge base sync

### 4. **Escalated Queries**
- Review questions the AI couldn't answer confidently
- Respond to users via email
- Responses automatically added to knowledge base

### 5. **Top Questions**
- See most frequently asked questions
- Identify knowledge gaps

### 6. **Secure Access**
- Login via AWS Cognito
- Admin-only features protected

---

## ☁️ AWS Services Used

### **1. AWS Amplify**
**What it does:** Hosts the React frontend
**Why we use it:** Automatic deployment from GitHub, built-in CI/CD, global CDN distribution

### **2. API Gateway**
**What it does:** Routes incoming requests
**Why we use it:**
- WebSocket API for real-time chat streaming
- REST API for admin operations (document upload, analytics)

### **3. AWS Lambda**
**What it does:** Runs backend code without managing servers
**Why we use it:** Pay only for actual usage, auto-scales with demand, no server maintenance

**Key Lambda Functions:**
- `chatResponseHandler` - Processes chat requests
- `websocketHandler` - Manages WebSocket connections
- `retrieveSessionLogs` - Fetches analytics data
- `adminFile` - Handles document uploads

### **4. AWS Bedrock**
**What it does:** Provides AI capabilities
**Why we use it:**
- Claude Sonnet 4 for natural language understanding
- Knowledge Base with vector search for document retrieval
- Managed service (no AI infrastructure to maintain)

### **5. DynamoDB**
**What it does:** NoSQL database for storing data
**Why we use it:** Fast queries, unlimited scale, pay-per-use pricing

**Tables:**
- `NCMWDashboardSessionlogs` - Conversation history and analytics
- `NCMWUserProfiles` - User role preferences
- `NCMWEscalatedQueries` - Questions needing human review
- `NCMWResponseFeedback` - User thumbs up/down ratings

### **6. Amazon S3**
**What it does:** File storage
**Why we use it:** Store PDF documents that feed the knowledge base, extremely reliable and cheap

### **7. Amazon SES**
**What it does:** Sends emails
**Why we use it:** Notify admins of escalated queries, send responses to users

### **8. Amazon Cognito**
**What it does:** User authentication
**Why we use it:** Secure admin login, no need to build custom auth system

---

## 🔗 How Services Connect

### **Chat Flow (User Asks Question)**

1. **User types question** → Frontend (React)
2. **Frontend sends via WebSocket** → API Gateway
3. **API Gateway triggers** → Lambda (chatResponseHandler)
4. **Lambda invokes** → AWS Bedrock Agent
5. **Bedrock searches** → Knowledge Base (finds relevant PDFs in S3)
6. **Bedrock generates answer** → Claude Sonnet 4
7. **Lambda streams response back** → API Gateway → Frontend
8. **Lambda saves conversation** → DynamoDB

---

### **Document Upload Flow (Admin Adds PDF)**

1. **Admin uploads PDF** → Frontend admin portal
2. **Frontend sends file** → API Gateway (REST)
3. **API Gateway triggers** → Lambda (adminFile)
4. **Lambda uploads file** → S3 bucket
5. **Lambda triggers sync** → Bedrock Knowledge Base
6. **Knowledge Base processes PDF** → Extracts text, creates embeddings
7. **Lambda returns success** → Frontend shows confirmation

---

### **Analytics Flow (Admin Views Dashboard)**

1. **Admin opens dashboard** → Frontend
2. **Frontend requests data** → API Gateway (REST)
3. **API Gateway triggers** → Lambda (retrieveSessionLogs)
4. **Lambda queries** → DynamoDB (scan with date filter)
5. **Lambda returns results** → Frontend
6. **Frontend displays charts** → Usage trends, sentiment pie chart

---

### **Escalation Flow (Low Confidence Answer)**

1. **AI confidence < 90%** → Lambda detects
2. **User provides email** → Frontend collects
3. **Lambda sends notification** → Amazon SES → Admin email
4. **Admin replies with answer** → Email
5. **System processes reply** → Lambda
6. **Answer added to knowledge base** → S3 + Bedrock
7. **Future queries improved** → Better answers automatically

---

## 💾 Data Flow Summary

```
User Query
    ↓
WebSocket (real-time)
    ↓
Lambda Function
    ↓
Bedrock Agent ←→ Knowledge Base (S3)
    ↓
Claude Sonnet 4
    ↓
Stream Response Back
    ↓
Save to DynamoDB
```

---

## 📱 Technology Stack

**Frontend:**
- React 18
- Material-UI (MUI)
- WebSocket API
- Axios (HTTP requests)
- Recharts (analytics graphs)

**Backend:**
- Python 3.12
- AWS Lambda
- Boto3 (AWS SDK)

**Infrastructure:**
- AWS CDK (TypeScript)
- CloudFormation

**AI:**
- AWS Bedrock
- Claude Sonnet 4
- Vector embeddings (Titan)
