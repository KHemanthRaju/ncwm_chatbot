# MHFA Learning Navigator - User Flow (Step-by-Step)

## Complete User Journey from Query to Response

This document provides a detailed, numbered step-by-step breakdown of how a user query flows through the system from the frontend to the response.

---

## Flow 1: User Asks a Question (High Confidence Response)

### Step 1: User Opens Chatbot
- **Component**: React Web Application hosted on **AWS Amplify**
- **Action**: User navigates to the chatbot interface
- **URL**: `https://<amplify-domain>.amplifyapp.com`

### Step 2: WebSocket Connection Established
- **From**: React App (Amplify)
- **To**: **API Gateway WebSocket API**
- **Protocol**: WSS (WebSocket Secure)
- **Action**: Frontend establishes persistent WebSocket connection
- **Connection ID**: Unique ID assigned by API Gateway (e.g., `abc123xyz`)

### Step 3: User Types and Sends Question
- **Component**: React App (Amplify)
- **User Action**: Types "How do I register for an MHFA course?" and clicks Send
- **Data Prepared**:
  ```json
  {
    "action": "sendMessage",
    "querytext": "How do I register for an MHFA course?",
    "session_id": "user-session-12345",
    "user_role": "learner",
    "location": "New York"
  }
  ```

### Step 4: Message Sent via WebSocket
- **From**: React App (Amplify)
- **To**: **API Gateway WebSocket API**
- **Endpoint**: `wss://<api-id>.execute-api.us-west-2.amazonaws.com/production`
- **Route**: `sendMessage`

### Step 5: API Gateway Routes to websocketHandler Lambda
- **Component**: **API Gateway WebSocket API**
- **Action**: Routes the `sendMessage` request to Lambda
- **Target**: **websocketHandler Lambda Function**
- **Invocation Type**: Synchronous (request-response)

### Step 6: websocketHandler Receives Message
- **Lambda Function**: **websocketHandler**
- **Code Location**: `cdk_backend/lambda/websocketHandler/handler.py`
- **Actions**:
  - Extracts connection ID from request context
  - Parses message body (query, session_id, user_role, location)
  - Validates that query is not empty
  - Prepares payload for next Lambda

### Step 7: websocketHandler Invokes chatResponseHandler Lambda
- **From**: **websocketHandler Lambda**
- **To**: **chatResponseHandler Lambda Function**
- **Invocation Type**: Asynchronous (Event - fire and forget)
- **Payload Sent**:
  ```json
  {
    "querytext": "How do I register for an MHFA course?",
    "connectionId": "abc123xyz",
    "session_id": "user-session-12345",
    "user_role": "learner",
    "location": "New York"
  }
  ```
- **Why Async**: Allows websocketHandler to return immediately while chatResponseHandler processes in background

### Step 8: chatResponseHandler Lambda Receives Query
- **Lambda Function**: **chatResponseHandler**
- **Code Location**: `cdk_backend/lambda/chatResponseHandler/handler.py`
- **Actions**:
  - Extracts query text, connection ID, session ID, user role
  - Determines role-specific instructions (learner, instructor, or staff)
  - Prepares to invoke Bedrock Agent

### Step 9: chatResponseHandler Calls Bedrock Agent
- **From**: **chatResponseHandler Lambda**
- **To**: **Amazon Bedrock Agent** (Learning Navigator)
- **API Call**: `bedrock_agent.invoke_agent()`
- **Parameters**:
  - `agentId`: The Learning Navigator Agent ID
  - `agentAliasId`: Production alias ID
  - `sessionId`: User's session ID for conversation continuity
  - `inputText`: User's question
  - `enableTrace`: True (to get knowledge base citations)
  - `sessionState`: Includes user role and role-specific instructions

### Step 10: Bedrock Agent Processes Query
- **Component**: **Amazon Bedrock Agent**
- **Agent Name**: Learning Navigator
- **Actions**:
  - Receives user question
  - Applies content filtering via **Bedrock Guardrails** (HIGH input filter)
  - Determines query requires knowledge base lookup
  - Applies role-specific instruction overlay (learner-focused language)

### Step 11: Agent Queries Knowledge Base (RAG)
- **From**: **Bedrock Agent**
- **To**: **Bedrock Knowledge Base** (Vector Search)
- **Process**:
  - Agent converts question to embedding using **Titan Embed Text v2** (1024 dimensions)
  - Performs semantic similarity search against knowledge base vectors
  - Retrieves top relevant document chunks from S3

### Step 12: Knowledge Base Retrieves Documents
- **Component**: **Bedrock Knowledge Base**
- **Data Source**: **S3 Bucket** (`national-council-s3-pdfs`)
- **Actions**:
  - Searches indexed PDF documents
  - Returns relevant passages about course registration
  - Includes document citations (file names, page numbers)
  - Confidence score calculated based on semantic similarity

### Step 13: Agent Generates Response with LLM
- **Component**: **Bedrock Agent**
- **LLM Model**: **Claude 4 Sonnet** (Cross-Region Inference Profile - US region)
- **Process**:
  - Takes retrieved knowledge base passages
  - Applies instruction prompt (helpful, professional tone)
  - Generates natural language response
  - Includes citations and source references
  - Applies output content filtering (MEDIUM strength)

### Step 14: Agent Calculates Confidence Score
- **Component**: **Bedrock Agent** (within chatResponseHandler processing)
- **Logic**:
  - Analyzes retrieval scores from knowledge base
  - Checks if query is in-scope (MHFA-related)
  - Computes confidence percentage (0-100%)
  - **In this example**: Confidence = 95% (High - direct answer found)

### Step 15: chatResponseHandler Receives Agent Response
- **Lambda Function**: **chatResponseHandler**
- **Receives**:
  - Complete generated response text
  - Knowledge base citations
  - Trace data (retrieval scores, model usage)
  - Confidence score: 95%

### Step 16: chatResponseHandler Extracts Confidence and Citations
- **Lambda Function**: **chatResponseHandler**
- **Actions**:
  - Parses agent response stream
  - Extracts confidence score from trace data
  - Formats citations for display
  - Determines response strategy: HIGH CONFIDENCE (≥90%) → Direct answer

### Step 17: chatResponseHandler Sends Response Back via WebSocket
- **From**: **chatResponseHandler Lambda**
- **To**: **API Gateway WebSocket API**
- **API Call**: `api_gateway.post_to_connection()`
- **Parameters**:
  - `ConnectionId`: "abc123xyz"
  - `Data`: JSON response with answer and citations
- **Response Format**:
  ```json
  {
    "type": "response",
    "message": "To register for an MHFA course, visit https://www.mentalhealthfirstaid.org/take-a-course/find-a-course/ to find available courses in your area. You can filter by location, course type, and date. Once you find a course, click 'Register' to complete enrollment. (confidence: 95%)\n\nSources:\n- MHFA Course Registration Guide.pdf (page 3)\n- Getting Started with MHFA.pdf (page 7)",
    "confidence": 95,
    "citations": [...]
  }
  ```

### Step 18: API Gateway Forwards Response to User
- **Component**: **API Gateway WebSocket API**
- **Action**: Pushes message through open WebSocket connection
- **Target**: React App (Amplify) in user's browser

### Step 19: React App Displays Response
- **Component**: React Web Application (Amplify)
- **Actions**:
  - Receives WebSocket message
  - Parses JSON response
  - Renders answer in chat interface
  - Displays confidence score badge
  - Shows clickable citation links
  - Adds thumbs up/down feedback buttons

### Step 20: User Sees Answer
- **Component**: Browser UI
- **Display**:
  - Answer text with proper formatting
  - Confidence badge (95%)
  - Citation references
  - Thumbs up 👍 and thumbs down 👎 buttons

---

## Flow 2: Background Logging and Classification

### Step 21: chatResponseHandler Triggers logclassifier (Async)
- **From**: **chatResponseHandler Lambda**
- **To**: **logclassifier Lambda Function**
- **Invocation Type**: Asynchronous (Event)
- **Timing**: Happens in parallel with Step 17 (doesn't delay user response)
- **Payload**:
  ```json
  {
    "session_id": "user-session-12345",
    "timestamp": "2026-01-11T10:30:45.123Z",
    "query": "How do I register for an MHFA course?",
    "response": "To register for an MHFA course...",
    "location": "New York",
    "confidence": 95
  }
  ```

### Step 22: logclassifier Lambda Receives Data
- **Lambda Function**: **logclassifier**
- **Code Location**: `cdk_backend/lambda/logclassifier/handler.py`
- **Actions**:
  - Receives conversation details
  - Prepares for AI classification

### Step 23: logclassifier Calls Bedrock for Category Classification
- **From**: **logclassifier Lambda**
- **To**: **Amazon Bedrock** (Nova Lite model)
- **API Call**: `bedrock.converse()`
- **Model**: `us.amazon.nova-lite-v1:0` (lightweight, fast classification model)
- **Prompt**: "Classify this MHFA question into one category: [Training & Courses, Instructor Certification, Learner Support, ...]"
- **Response**: "Training & Courses"

### Step 24: logclassifier Calls Bedrock for Sentiment Analysis
- **From**: **logclassifier Lambda**
- **To**: **Amazon Bedrock** (Nova Lite model)
- **Purpose**: Analyze conversation sentiment (AI-based, not user feedback)
- **Prompt**: "Analyze sentiment of this conversation and determine user satisfaction"
- **Response**:
  ```json
  {
    "sentiment": "positive",
    "score": 85,
    "reason": "User received helpful answer with clear instructions"
  }
  ```

### Step 25: logclassifier Writes to DynamoDB
- **From**: **logclassifier Lambda**
- **To**: **DynamoDB Table** (`NCMWDashboardSessionlogs`)
- **Action**: `table.put_item()`
- **Data Stored**:
  ```json
  {
    "session_id": "user-session-12345",  // Partition Key
    "timestamp": "2026-01-11T10:30:45.123Z#abc12345",  // Sort Key
    "original_ts": "2026-01-11T10:30:45.123Z",
    "query": "How do I register for an MHFA course?",
    "response": "To register for an MHFA course...",
    "location": "New York",
    "category": "Training & Courses",
    "sentiment": "positive",  // AI-generated (will be overridden by user feedback)
    "satisfaction_score": 85,
    "confidence": 95
  }
  ```

---

## Flow 3: User Provides Feedback (Thumbs Up/Down)

### Step 26: User Clicks Thumbs Up 👍
- **Component**: React App (Amplify)
- **User Action**: Clicks thumbs up button on the response
- **Reason**: User found the answer helpful

### Step 27: React App Calls Feedback API
- **From**: React App (Amplify)
- **To**: **API Gateway REST API** (Admin API)
- **Method**: POST
- **Endpoint**: `https://<api-id>.execute-api.us-west-2.amazonaws.com/prod/feedback`
- **Headers**: `Content-Type: application/json`
- **Body**:
  ```json
  {
    "messageId": "user-session-12345_2026-01-11T10:30:45.123Z",
    "sessionId": "user-session-12345",
    "feedback": "positive",
    "message": "To register for an MHFA course..."
  }
  ```
- **Note**: No authentication required (public endpoint for user feedback)

### Step 28: API Gateway Routes to feedback Lambda
- **Component**: **API Gateway REST API**
- **Action**: Routes POST /feedback request
- **Target**: **feedback Lambda Function**
- **Invocation Type**: Synchronous

### Step 29: feedback Lambda Receives Request
- **Lambda Function**: **feedback**
- **Code Location**: `cdk_backend/lambda/feedback/handler.py`
- **Actions**:
  - Parses request body
  - Validates messageId and sessionId are present
  - Converts messageId to string (avoid DynamoDB float issues)
  - Prepares to store feedback

### Step 30: feedback Lambda Writes to DynamoDB
- **From**: **feedback Lambda**
- **To**: **DynamoDB Table** (`NCMWResponseFeedback`)
- **Action**: `table.put_item()`
- **Data Stored**:
  ```json
  {
    "message_id": "user-session-12345_2026-01-11T10:30:45.123Z",  // Partition Key
    "timestamp": "2026-01-11T10:31:00.456Z",  // Sort Key (feedback time)
    "session_id": "user-session-12345",
    "feedback": "positive",  // "positive" or "negative"
    "message_preview": "To register for an MHFA course...",
    "created_at": "2026-01-11T10:31:00.456Z"
  }
  ```

### Step 31: feedback Lambda Returns Success
- **From**: **feedback Lambda**
- **To**: React App (Amplify) via API Gateway
- **Status Code**: 200
- **Response**:
  ```json
  {
    "message": "Feedback submitted successfully",
    "messageId": "user-session-12345_2026-01-11T10:30:45.123Z",
    "feedback": "positive"
  }
  ```

### Step 32: React App Shows Confirmation
- **Component**: React App (Amplify)
- **Action**:
  - Displays success message ("Thank you for your feedback!")
  - Highlights the clicked thumbs up button in green
  - Disables feedback buttons to prevent duplicate submissions

---

## Flow 4: Low Confidence Query → Email Escalation

### Alternative Flow: If Confidence < 90%

If in Step 14 the confidence score was < 90%, the flow changes:

### Step 14b: Agent Detects Low Confidence
- **Confidence**: 65% (Low - partial information found)
- **Decision**: Request user email for escalation

### Step 15b: chatResponseHandler Requests Email
- **Lambda Function**: **chatResponseHandler**
- **Action**: Sends message asking for user email
- **Response Sent**:
  ```json
  {
    "type": "request_email",
    "message": "I don't have much information on this. Could you please share your email so I can escalate this to an administrator for further follow-up?"
  }
  ```

### Step 16b: User Provides Email
- **Component**: React App (Amplify)
- **User Action**: Types email address: "user@example.com"
- **Frontend**: Sends follow-up message with email

### Step 17b: Bedrock Agent Triggers notify-admin Action
- **Component**: **Bedrock Agent**
- **Action Group**: `notify-admin`
- **Target**: **email Lambda Function** (NotifyAdminFn)
- **Invocation**: Bedrock Agent calls Lambda via action group
- **Parameters Passed**:
  ```json
  {
    "email": "user@example.com",
    "querytext": "Original user question",
    "agentResponse": "Partial answer provided by agent"
  }
  ```

### Step 18b: email Lambda Receives Request
- **Lambda Function**: **email** (NotifyAdminFn)
- **Code Location**: `cdk_backend/lambda/email/handler.py`
- **Actions**:
  - Receives escalation request from Bedrock Agent
  - Validates email address format
  - Prepares email notification

### Step 19b: email Lambda Stores in Escalated Queries Table
- **From**: **email Lambda**
- **To**: **DynamoDB Table** (`NCMWEscalatedQueries`)
- **Action**: `table.put_item()`
- **Data Stored**:
  ```json
  {
    "query_id": "escalation-uuid-67890",  // Partition Key
    "timestamp": "2026-01-11T10:35:00.789Z",  // Sort Key
    "user_email": "user@example.com",
    "query_text": "Original user question",
    "agent_response": "Partial answer",
    "status": "pending",  // pending, in_progress, or resolved
    "confidence": 65,
    "session_id": "user-session-12345",
    "created_at": "2026-01-11T10:35:00.789Z"
  }
  ```

### Step 20b: email Lambda Sends Email via SES
- **From**: **email Lambda**
- **To**: **Amazon SES** (Simple Email Service)
- **API Call**: `ses.send_email()`
- **Recipients**: Admin email (configured in environment variable)
- **Email Content**:
  ```
  Subject: New Escalated Query - Learning Navigator

  A user has submitted a query that needs your attention:

  User Email: user@example.com
  Question: [Original user question]
  Bot Response: [Partial answer]
  Confidence: 65%
  Timestamp: 2026-01-11 10:35:00 UTC

  Please log into the admin dashboard to review and respond.
  ```

### Step 21b: User Receives Confirmation
- **Component**: React App (Amplify)
- **Display**: "Thanks! An administrator has been notified and will follow up at user@example.com. Would you like to ask any other questions?"

---

## Summary of AWS Services Involved in User Flow

| Step | Service | Component | Purpose |
|------|---------|-----------|---------|
| 1 | **AWS Amplify** | Frontend Hosting | Serves React application to user's browser |
| 2-4 | **API Gateway WebSocket** | WebSocket API | Maintains persistent connection for real-time chat |
| 5-7 | **AWS Lambda** | websocketHandler | Routes incoming messages to processing pipeline |
| 8-17 | **AWS Lambda** | chatResponseHandler | Orchestrates AI response generation |
| 9-14 | **Amazon Bedrock** | Agent + KB + Claude 4 | AI processing, RAG, and response generation |
| 12 | **Amazon S3** | Knowledge Base Storage | Stores PDF documents for retrieval |
| 21-25 | **AWS Lambda** | logclassifier | Classifies and analyzes conversation |
| 23-24 | **Amazon Bedrock** | Nova Lite | Fast classification and sentiment analysis |
| 25 | **Amazon DynamoDB** | SessionLogs Table | Stores conversation history |
| 27-31 | **AWS Lambda** | feedback | Handles user thumbs up/down |
| 30 | **Amazon DynamoDB** | Feedback Table | Stores user feedback ratings |
| 17b-21b | **AWS Lambda** | email (NotifyAdminFn) | Handles query escalation |
| 19b | **Amazon DynamoDB** | EscalatedQueries Table | Tracks escalated queries |
| 20b | **Amazon SES** | Email Service | Sends admin notification emails |

---

## Key Timing Considerations

- **Steps 1-20 (High Confidence)**: Total time ~3-5 seconds
  - WebSocket setup: <1 second
  - Bedrock Agent processing: 2-4 seconds
  - Response display: Immediate

- **Steps 21-25 (Background Logging)**: Runs asynchronously, doesn't delay user response
  - Classification: ~1 second
  - DynamoDB write: <100ms

- **Steps 26-32 (Feedback)**: <500ms total
  - API call: ~200ms
  - DynamoDB write: ~100ms
  - UI update: Immediate

---

*This step-by-step flow documentation is maintained as part of the MHFA Learning Navigator project.*
*Last Updated: January 11, 2026*
