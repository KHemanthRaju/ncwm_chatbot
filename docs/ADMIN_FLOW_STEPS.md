# Admin Flow - Step-by-Step Technical Breakdown

This document provides a detailed technical walkthrough of the administrative workflows in the Learning Navigator application, from admin authentication through various admin operations.

---

## Table of Contents

1. [Admin Authentication Flow](#admin-authentication-flow)
2. [Dashboard Analytics View Flow](#dashboard-analytics-view-flow)
3. [Document Management Flow](#document-management-flow)
4. [Escalated Queries Management Flow](#escalated-queries-management-flow)
5. [Conversation Logs Viewing Flow](#conversation-logs-viewing-flow)
6. [Timing Summary](#timing-summary)

---

## Admin Authentication Flow

**Scenario**: Admin user logs in to access the administrative portal

### Step 1: Admin Opens Login Page
- **Component**: `AdminLogin.jsx` (frontend)
- **Location**: [frontend/src/Components/AdminLogin.jsx](../frontend/src/Components/AdminLogin.jsx)
- **Action**: Admin navigates to `/admin-login` route
- **UI Display**: Login form with username and password fields

### Step 2: Admin Submits Credentials
- **Component**: `AdminLogin.jsx` → AWS Cognito
- **Action**: Admin clicks "Sign In" button
- **Frontend Call**:
```javascript
import { Auth } from 'aws-amplify';

const handleLogin = async (username, password) => {
  const user = await Auth.signIn(username, password);
  // user contains idToken, accessToken, refreshToken
};
```

### Step 3: Cognito Validates Credentials
- **Service**: Amazon Cognito User Pool
- **Action**: Cognito validates username and password against user pool
- **Response**: Returns JWT tokens if valid:
  - **ID Token**: Contains user identity claims
  - **Access Token**: Used for authorizing API calls
  - **Refresh Token**: Used to renew expired tokens

**ID Token Example** (decoded JWT payload):
```json
{
  "sub": "abcd1234-5678-90ef-ghij-klmnopqrstuv",
  "cognito:username": "admin@example.com",
  "email": "admin@example.com",
  "email_verified": true,
  "iat": 1704995400,
  "exp": 1705081800
}
```

### Step 4: Frontend Stores Authentication
- **Component**: `AdminLogin.jsx`
- **Storage**: Tokens stored securely in browser
- **Action**: Redirect to admin dashboard

### Step 5: Navigate to Admin Dashboard
- **Component**: `AdminDashboard.jsx`
- **Location**: [frontend/src/Components/AdminDashboard.jsx](../frontend/src/Components/AdminDashboard.jsx)
- **Route**: `/admin`
- **Display**: Shows 4 action cards:
  1. Manage Documents
  2. Analytics
  3. Escalated Queries
  4. Conversation Logs

---

## Dashboard Analytics View Flow

**Scenario**: Admin views today's analytics on the dashboard

### Step 6: Dashboard Loads and Fetches Analytics
- **Component**: `AdminDashboard.jsx`
- **Action**: `useEffect` triggers on component mount
- **Frontend Code**:
```javascript
const fetchAnalytics = async () => {
  const token = await getIdToken(); // Extract ID token from Cognito
  const { data } = await axios.get(ANALYTICS_API, {
    params: { timeframe: 'today' },
    headers: { Authorization: `Bearer ${token}` }
  });
};
```

### Step 7: API Gateway Receives Analytics Request
- **Service**: AWS API Gateway (REST API)
- **Endpoint**: `GET /session-logs?timeframe=today`
- **Authorization**: API Gateway validates JWT token using Cognito User Pool authorizer
- **Validation Steps**:
  1. Extract Bearer token from Authorization header
  2. Verify token signature using Cognito public keys
  3. Check token expiration (exp claim)
  4. Validate issuer and audience claims
- **On Success**: Route to Lambda function
- **On Failure**: Return `401 Unauthorized`

### Step 8: retrieveSessionLogs Lambda Invoked
- **Lambda Function**: `retrieveSessionLogs`
- **Location**: [cdk_backend/lambda/retrieveSessionLogs/handler.py](../cdk_backend/lambda/retrieveSessionLogs/handler.py)
- **Purpose**: Aggregates session analytics from DynamoDB
- **Handler**: `lambda_handler(event, context)`

**Event Payload**:
```json
{
  "httpMethod": "GET",
  "queryStringParameters": {
    "timeframe": "today"
  },
  "headers": {
    "Authorization": "Bearer eyJraWQiOiJ...",
    "Content-Type": "application/json"
  },
  "requestContext": {
    "authorizer": {
      "claims": {
        "sub": "abcd1234-5678-90ef-ghij-klmnopqrstuv",
        "email": "admin@example.com"
      }
    }
  }
}
```

### Step 9: Lambda Queries DynamoDB Tables
- **Tables Accessed**:
  1. **NCMWDashboardSessionlogs** - Main session logs table
  2. **NCMWResponseFeedback** - User feedback (thumbs up/down)

**DynamoDB Query 1** (Session Logs):
```python
# Filter sessions by timeframe
start_iso = datetime(now.year, now.month, now.day).isoformat()
end_iso = now.isoformat()

filter_exp = Attr("original_ts").between(start_iso, end_iso)
projection = "session_id, category, sentiment, satisfaction_score, query, response, original_ts"

response = table.scan(
    FilterExpression=filter_exp,
    ProjectionExpression=projection
)
items = response.get("Items", [])
```

**DynamoDB Query 2** (User Feedback):
```python
# Fetch all feedback entries
feedback_resp = feedback_table.scan()
feedback_items = feedback_resp.get("Items", [])

# Build feedback map: message_id -> "positive" or "negative"
feedback_map = {}
for fb in feedback_items:
    msg_id = fb.get("message_id")
    feedback_type = fb.get("feedback")  # "positive" or "negative"
    if msg_id and feedback_type:
        feedback_map[msg_id] = feedback_type
```

### Step 10: Lambda Aggregates Analytics
- **Action**: Process session logs and match with user feedback
- **Logic**:
```python
sessions = set()
feedback_sentiment_counts = {"positive": 0, "negative": 0, "neutral": 0}
satisfaction_scores = []
conversations = []

for item in items:
    sessions.add(item.get("session_id"))

    # Match user feedback (thumbs up/down)
    user_feedback = feedback_map.get(item.get("message_id"))

    # Determine sentiment:
    # - positive: User clicked thumbs up 👍
    # - negative: User clicked thumbs down 👎
    # - neutral: No feedback (user didn't click either)
    sentiment = user_feedback if user_feedback else "neutral"

    feedback_sentiment_counts[sentiment] += 1
    satisfaction_scores.append(float(item.get("satisfaction_score", 50)))

    conversations.append({
        "session_id": item.get("session_id"),
        "timestamp": item.get("original_ts"),
        "query": item.get("query", ""),
        "response": item.get("response", ""),
        "sentiment": sentiment,
        "satisfaction_score": float(item.get("satisfaction_score", 50))
    })

avg_satisfaction = sum(satisfaction_scores) / len(satisfaction_scores)
```

### Step 11: Lambda Returns Analytics Response
- **Response Format**:
```json
{
  "statusCode": 200,
  "headers": {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  },
  "body": {
    "timeframe": "today",
    "start_date": "2026-01-11",
    "end_date": "2026-01-11",
    "user_count": 45,
    "sentiment": {
      "positive": 32,
      "negative": 8,
      "neutral": 5
    },
    "avg_satisfaction": 78.5,
    "conversations": [
      {
        "session_id": "sess_abc123",
        "timestamp": "2026-01-11T14:32:10Z",
        "query": "How do I become an MHFA instructor?",
        "response": "To become a Mental Health First Aid instructor...",
        "sentiment": "positive",
        "satisfaction_score": 85.0
      }
    ]
  }
}
```

### Step 12: Dashboard Displays Analytics
- **Component**: `AdminDashboard.jsx`
- **UI Elements**:
  1. **Positive Sentiment Card**: Green gradient showing positive count
  2. **Negative Sentiment Card**: Red gradient showing negative count
  3. **User Count**: Total unique sessions today
  4. **Average Satisfaction**: Overall quality score (0-100)

---

## Document Management Flow

**Scenario**: Admin uploads a new PDF to the knowledge base

### Step 13: Admin Opens Document Management
- **Component**: `ManageDocuments.jsx`
- **Location**: [frontend/src/Components/ManageDocuments.jsx](../frontend/src/Components/ManageDocuments.jsx)
- **Route**: `/admin-documents`
- **Action**: Admin clicks "Manage Documents" from dashboard

### Step 14: Frontend Fetches Existing Documents
- **Component**: `ManageDocuments.jsx`
- **Action**: Component mount triggers `fetchDocuments()`
- **Frontend Code**:
```javascript
const fetchDocuments = async () => {
  const token = await getIdToken();
  const res = await fetch(`${DOCUMENTS_API}files`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });
  const data = await res.json();
  setDocuments(data.files); // Array of file metadata
};
```

### Step 15: API Gateway Routes to adminFile Lambda (LIST)
- **Service**: AWS API Gateway (REST API)
- **Endpoint**: `GET /files`
- **Authorization**: Cognito User Pool authorizer validates token
- **Lambda Invoked**: `adminFile`

### Step 16: adminFile Lambda Lists S3 Files
- **Lambda Function**: `adminFile`
- **Location**: [cdk_backend/lambda/adminFile/handler.py](../cdk_backend/lambda/adminFile/handler.py:139-160)
- **Handler**: `handle_list_files()`

**Lambda Code**:
```python
def handle_list_files():
    log("LIST files in bucket:", BUCKET_NAME)

    # List all objects in S3 bucket
    objects = s3.list_objects_v2(Bucket=BUCKET_NAME)

    files = [
        {
            "key": obj["Key"],  # Filename
            "size": obj["Size"],  # Size in bytes
            "last_modified": obj["LastModified"].isoformat(),
            "actions": {
                "download": {"method": "GET", "endpoint": f"/files/{obj['Key']}"},
                "delete": {"method": "DELETE", "endpoint": f"/files/{obj['Key']}"}
            }
        }
        for obj in objects.get("Contents", [])
    ]

    return {
        "statusCode": 200,
        "headers": CORS_HEADERS,
        "body": json.dumps({"files": files})
    }
```

### Step 17: Frontend Displays Document Table
- **Component**: `ManageDocuments.jsx`
- **UI Display**: Table with columns:
  - **Name**: Filename with folder icon
  - **Type**: File extension (PDF, DOCX, etc.)
  - **Last Modified**: Date formatted as "Jan 11, 2026"
  - **Size**: File size in KB/MB
  - **Action**: Download and Delete buttons

### Step 18: Admin Clicks Upload Button
- **Component**: `ManageDocuments.jsx`
- **Action**: Admin clicks upload icon → Opens file picker modal
- **UI**: Modal dialog with "Select File" button

### Step 19: Admin Selects File
- **Action**: Admin selects PDF file from file system
- **Frontend Code**:
```javascript
const handleFileUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Read file as base64
  const reader = new FileReader();
  reader.onloadend = async () => {
    const base64 = reader.result.split(",")[1]; // Remove data:application/pdf;base64, prefix

    // Upload to API
    const token = await getIdToken();
    const res = await fetch(`${DOCUMENTS_API}files`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        filename: file.name,
        content_type: file.type,
        content: base64  // Base64-encoded file content
      })
    });
  };
  reader.readAsDataURL(file);
};
```

### Step 20: API Gateway Routes to adminFile Lambda (UPLOAD)
- **Service**: AWS API Gateway (REST API)
- **Endpoint**: `POST /files`
- **Authorization**: Cognito User Pool authorizer validates token
- **Lambda Invoked**: `adminFile`

**Event Payload**:
```json
{
  "httpMethod": "POST",
  "body": "{\"filename\":\"mhfa_instructor_guide.pdf\",\"content_type\":\"application/pdf\",\"content\":\"JVBERi0xLjQKJeLjz9MKMyAwIG9iago...\"}",
  "headers": {
    "Authorization": "Bearer eyJraWQiOiJ...",
    "Content-Type": "application/json"
  }
}
```

### Step 21: adminFile Lambda Uploads to S3
- **Lambda Function**: `adminFile`
- **Location**: [cdk_backend/lambda/adminFile/handler.py](../cdk_backend/lambda/adminFile/handler.py:163-175)
- **Handler**: `handle_upload_file(event)`

**Lambda Code**:
```python
def handle_upload_file(event):
    body = json.loads(event["body"])
    filename = body.get("filename") or f"doc_{datetime.utcnow():%Y%m%d_%H%M%S}"
    content_type = body.get("content_type", "application/octet-stream")

    log("UPLOAD filename:", filename)

    # Decode base64 content
    file_content = b64decode(body["content"])

    # Upload to S3 bucket
    s3.put_object(
        Bucket=BUCKET_NAME,
        Key=filename,
        Body=file_content,
        ContentType=content_type
    )

    log("UPLOAD OK")
    return respond(200, {
        "message": "Uploaded",
        "file": {
            "name": filename,
            "url": f"/files/{urllib.parse.quote_plus(filename)}"
        }
    })
```

### Step 22: adminFile Lambda Triggers Knowledge Base Sync
- **Lambda Function**: `adminFile`
- **Location**: [cdk_backend/lambda/adminFile/handler.py](../cdk_backend/lambda/adminFile/handler.py:96-98)
- **Trigger Point**: After successful upload
- **Action**: Calls `sync_knowledge_base()` function

**Lambda Code**:
```python
if raw_path == "/files" and http_method == "POST":
    out = handle_upload_file(event)
    sync_knowledge_base()  # Automatically sync Knowledge Base
    return out

def sync_knowledge_base():
    log("KB sync → start_ingestion_job()")

    # Trigger Bedrock Knowledge Base ingestion
    response = bedrock_agent.start_ingestion_job(
        knowledgeBaseId=KNOWLEDGE_BASE_ID,
        dataSourceId=DATA_SOURCE_ID
    )

    job_id = response.get("ingestionJobId")
    log("KB sync job id:", job_id)
    return {"status": "success", "jobId": job_id}
```

### Step 23: Bedrock Knowledge Base Ingests New Document
- **Service**: Amazon Bedrock Knowledge Base
- **Action**: Bedrock ingests the PDF from S3
- **Process**:
  1. **Extract text** from PDF using Bedrock's document parser
  2. **Chunk text** into semantic segments (default: 300 tokens per chunk)
  3. **Generate embeddings** using Titan Embeddings model
  4. **Store vectors** in OpenSearch Serverless index
  5. **Update metadata** with document source information

**Ingestion Job Status**:
```json
{
  "ingestionJobId": "job-abc123xyz",
  "status": "IN_PROGRESS",
  "knowledgeBaseId": "KB1234567890",
  "dataSourceId": "DS0987654321",
  "startedAt": "2026-01-11T14:45:22Z"
}
```

### Step 24: Frontend Refreshes Document List
- **Component**: `ManageDocuments.jsx`
- **Action**: Automatically calls `fetchDocuments()` after upload completes
- **UI Update**: New document appears in the table

---

## Escalated Queries Management Flow

**Scenario**: Admin views and manages queries that require human attention

### Step 25: Admin Opens Escalated Queries
- **Component**: `EscalatedQueries.jsx`
- **Location**: [frontend/src/Components/EscalatedQueries.jsx](../frontend/src/Components/EscalatedQueries.jsx)
- **Route**: `/admin-queries`
- **Action**: Admin clicks "Escalated Queries" from dashboard

### Step 26: Frontend Fetches Escalated Queries
- **Component**: `EscalatedQueries.jsx`
- **Action**: Component mount triggers API call
- **Frontend Code**:
```javascript
const fetchQueries = async () => {
  const token = await getIdToken();
  const { data } = await axios.get(`${DOCUMENTS_API}escalated-queries`, {
    params: { status: 'pending' }, // Filter by status
    headers: { Authorization: `Bearer ${token}` }
  });
  setQueries(data.queries);
  setSummary(data.summary);
};
```

### Step 27: API Gateway Routes to escalatedQueries Lambda
- **Service**: AWS API Gateway (REST API)
- **Endpoint**: `GET /escalated-queries?status=pending`
- **Authorization**: Cognito User Pool authorizer validates token
- **Lambda Invoked**: `escalatedQueries`

### Step 28: escalatedQueries Lambda Queries DynamoDB
- **Lambda Function**: `escalatedQueries`
- **Location**: [cdk_backend/lambda/escalatedQueries/handler.py](../cdk_backend/lambda/escalatedQueries/handler.py:59-103)
- **Table**: `NCMWEscalatedQueries`

**Lambda Code**:
```python
def lambda_handler(event, context):
    params = event.get("queryStringParameters") or {}
    status_filter = params.get("status")  # "pending", "in_progress", "resolved"
    limit = int(params.get("limit", 50))

    # Query by status using GSI (Global Secondary Index)
    if status_filter:
        log(f"Querying by status: {status_filter}")
        response = table.query(
            IndexName="StatusIndex",
            KeyConditionExpression=Key("status").eq(status_filter),
            ScanIndexForward=False,  # Most recent first
            Limit=limit
        )
    else:
        # Scan all queries if no filter
        response = table.scan(Limit=limit)

    items = response.get("Items", [])

    # Sort by timestamp descending
    items.sort(key=lambda x: x.get("timestamp", ""), reverse=True)

    # Calculate summary stats
    pending_count = sum(1 for item in items if item.get("status") == "pending")
    in_progress_count = sum(1 for item in items if item.get("status") == "in_progress")
    resolved_count = sum(1 for item in items if item.get("status") == "resolved")

    return cors_response(200, {
        "queries": items,
        "summary": {
            "pending": pending_count,
            "in_progress": in_progress_count,
            "resolved": resolved_count
        }
    })
```

**DynamoDB Item Example**:
```json
{
  "query_id": "escalated_sess_xyz789_1704995400",
  "timestamp": "2026-01-11T14:30:00Z",
  "session_id": "sess_xyz789",
  "status": "pending",
  "query": "What is the process for reporting a training incident?",
  "user_email": "instructor@example.com",
  "confidence_score": 35.0,
  "admin_notes": "",
  "created_at": "2026-01-11T14:30:00Z",
  "updated_at": "2026-01-11T14:30:00Z"
}
```

### Step 29: Frontend Displays Escalated Queries
- **Component**: `EscalatedQueries.jsx`
- **UI Display**: List of cards showing:
  - **Query text**: User's original question
  - **User email**: Contact information
  - **Confidence score**: Why it was escalated (e.g., 35%)
  - **Status badge**: Pending (orange), In Progress (blue), Resolved (green)
  - **Admin notes**: Text area for admin comments
  - **Action buttons**: Mark as In Progress, Mark as Resolved

### Step 30: Admin Updates Query Status
- **Component**: `EscalatedQueries.jsx`
- **Action**: Admin clicks "Mark as In Progress" or "Mark as Resolved"
- **Frontend Code**:
```javascript
const updateQueryStatus = async (queryId, timestamp, newStatus, notes) => {
  const token = await getIdToken();
  await axios.put(`${DOCUMENTS_API}escalated-queries`, {
    query_id: queryId,
    timestamp: timestamp,
    status: newStatus,  // "in_progress" or "resolved"
    admin_notes: notes
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });

  // Refresh the list
  fetchQueries();
};
```

### Step 31: API Gateway Routes to escalatedQueries Lambda (UPDATE)
- **Service**: AWS API Gateway (REST API)
- **Endpoint**: `PUT /escalated-queries`
- **Lambda Invoked**: `escalatedQueries`
- **Handler**: `handle_update_query_status(event)`

**Event Payload**:
```json
{
  "httpMethod": "PUT",
  "body": "{\"query_id\":\"escalated_sess_xyz789_1704995400\",\"timestamp\":\"2026-01-11T14:30:00Z\",\"status\":\"resolved\",\"admin_notes\":\"Responded via email with policy document\"}",
  "headers": {
    "Authorization": "Bearer eyJraWQiOiJ...",
    "Content-Type": "application/json"
  }
}
```

### Step 32: Lambda Updates DynamoDB Item
- **Lambda Function**: `escalatedQueries`
- **Location**: [cdk_backend/lambda/escalatedQueries/handler.py](../cdk_backend/lambda/escalatedQueries/handler.py:110-144)

**Lambda Code**:
```python
def handle_update_query_status(event):
    body = json.loads(event.get("body", "{}"))
    query_id = body.get("query_id")
    new_status = body.get("status")  # "pending", "in_progress", "resolved"
    admin_notes = body.get("admin_notes", "")

    if new_status not in ["pending", "in_progress", "resolved"]:
        return cors_response(400, {"error": "Invalid status"})

    # Update the DynamoDB item
    table.update_item(
        Key={
            "query_id": query_id,
            "timestamp": body.get("timestamp")
        },
        UpdateExpression="SET #status = :status, admin_notes = :notes, updated_at = :updated",
        ExpressionAttributeNames={"#status": "status"},
        ExpressionAttributeValues={
            ":status": new_status,
            ":notes": admin_notes,
            ":updated": datetime.utcnow().isoformat() + "Z"
        }
    )

    return cors_response(200, {"message": "Status updated successfully"})
```

### Step 33: Frontend Updates UI
- **Component**: `EscalatedQueries.jsx`
- **Action**: Query status badge changes color
- **UI Update**: Query moves to appropriate status section (if filtered view)

---

## Conversation Logs Viewing Flow

**Scenario**: Admin reviews detailed conversation logs with sentiment analysis

### Step 34: Admin Opens Conversation Logs
- **Component**: `ConversationLogs.jsx`
- **Location**: [frontend/src/Components/ConversationLogs.jsx](../frontend/src/Components/ConversationLogs.jsx)
- **Route**: `/admin-conversations`
- **Action**: Admin clicks "Conversation Logs" from dashboard

### Step 35: Frontend Fetches Conversation Logs
- **Component**: `ConversationLogs.jsx`
- **Action**: Component mount triggers API call with detailed flag
- **Frontend Code**:
```javascript
const fetchConversations = async () => {
  const token = await getIdToken();
  const { data } = await axios.get(`${DOCUMENTS_API}session-logs`, {
    params: {
      timeframe: 'today',
      detailed: 'true'  // Request full conversation details
    },
    headers: { Authorization: `Bearer ${token}` }
  });
  setConversations(data.conversations);
};
```

### Step 36: API Gateway Routes to retrieveSessionLogs Lambda
- **Service**: AWS API Gateway (REST API)
- **Endpoint**: `GET /session-logs?timeframe=today&detailed=true`
- **Lambda Invoked**: `retrieveSessionLogs` (same as Step 8, but with detailed flag)

### Step 37: Lambda Returns Full Conversation Details
- **Lambda Function**: `retrieveSessionLogs`
- **Response**: Includes full query and response text (not just summaries)

**Response Format**:
```json
{
  "statusCode": 200,
  "body": {
    "conversations": [
      {
        "session_id": "sess_abc123",
        "timestamp": "2026-01-11T14:32:10Z",
        "query": "How do I become an MHFA instructor?",
        "response": "To become a Mental Health First Aid instructor, you need to: 1. Complete the MHFA Instructor Training Course...",
        "category": "Training Information",
        "sentiment": "positive",
        "satisfaction_score": 85.0
      },
      {
        "session_id": "sess_abc123",
        "timestamp": "2026-01-11T14:35:22Z",
        "query": "What are the prerequisites?",
        "response": "The prerequisites for MHFA Instructor Training include...",
        "category": "Training Information",
        "sentiment": "neutral",
        "satisfaction_score": 75.0
      }
    ]
  }
}
```

### Step 38: Frontend Displays Conversation Logs
- **Component**: `ConversationLogs.jsx`
- **UI Display**: Expandable conversation cards showing:
  - **Session ID**: Unique identifier for the conversation
  - **Timestamp**: When the conversation occurred
  - **Query and Response**: Full text of user question and bot answer
  - **Sentiment Badge**:
    - 😊 Positive (green) - User clicked thumbs up
    - 😞 Negative (red) - User clicked thumbs down
    - 😐 Neutral (gray) - No user feedback
  - **Satisfaction Score**: Quality score (0-100)
  - **Category**: Conversation topic classification

### Step 39: Admin Filters Conversations
- **Component**: `ConversationLogs.jsx`
- **Action**: Admin can filter by:
  - **Sentiment**: Positive, Negative, Neutral
  - **Timeframe**: Today, Weekly, Monthly, Yearly
  - **Score Range**: Low (0-50), Medium (50-75), High (75-100)
- **UI**: Dropdown filters and search bar

---

## Timing Summary

### Admin Authentication Flow (Steps 1-5)
- **Total Duration**: ~2-3 seconds
- **Breakdown**:
  - Step 1-2 (User input): Variable
  - Step 3 (Cognito validation): ~500-800ms
  - Step 4-5 (Frontend processing): ~200-300ms

### Dashboard Analytics View (Steps 6-12)
- **Total Duration**: ~1.5-2.5 seconds
- **Breakdown**:
  - Step 7 (API Gateway auth): ~100-200ms
  - Step 8-9 (Lambda + DynamoDB): ~800-1500ms
  - Step 10-11 (Aggregation): ~200-400ms
  - Step 12 (Frontend render): ~100-200ms

### Document Upload Flow (Steps 18-24)
- **Total Duration**: ~3-5 seconds (depends on file size)
- **Breakdown**:
  - Step 19 (Base64 encoding): ~500-1000ms (for 5MB PDF)
  - Step 20-21 (API + S3 upload): ~1-2 seconds
  - Step 22-23 (KB sync trigger): ~200-400ms (async job continues)
  - Step 24 (Frontend refresh): ~500-800ms

**Note**: Knowledge Base ingestion (Step 23) runs asynchronously and can take 2-5 minutes to complete depending on document size and complexity.

### Escalated Queries Management (Steps 25-33)
- **Total Duration**: ~1-1.5 seconds (fetch + display)
- **Status Update**: ~500-800ms
- **Breakdown**:
  - Step 27-28 (API + DynamoDB query): ~400-700ms
  - Step 29 (Frontend render): ~200-300ms
  - Step 31-32 (Status update): ~300-500ms

### Conversation Logs Viewing (Steps 34-39)
- **Total Duration**: ~1.5-2.5 seconds
- **Breakdown**:
  - Step 36-37 (API + DynamoDB scan): ~1-2 seconds (depends on data volume)
  - Step 38 (Frontend render): ~300-500ms

---

## Service Summary

| Service | Purpose | Used In |
|---------|---------|---------|
| **Amazon Cognito** | User authentication and authorization | All admin flows (Steps 3, 7, 15, 20, 27, 31, 36) |
| **API Gateway** | REST API endpoint routing and auth validation | All admin flows (Steps 7, 15, 20, 27, 31, 36) |
| **adminFile Lambda** | Document management (upload, list, delete) | Document Management (Steps 15-16, 20-21) |
| **retrieveSessionLogs Lambda** | Analytics aggregation and conversation logs | Dashboard Analytics (Steps 8-11), Conversation Logs (Steps 36-37) |
| **escalatedQueries Lambda** | Escalated query management (list, update status) | Escalated Queries (Steps 27-28, 31-32) |
| **DynamoDB** | Persistent storage for logs, feedback, and escalated queries | All read/write operations (Steps 9, 28, 32, 37) |
| **S3** | Document storage for knowledge base | Document Management (Steps 16, 21) |
| **Bedrock Knowledge Base** | Document ingestion and vector indexing | Document Management (Step 23) |

---

## Architecture Integration

All admin flows integrate with the main architecture:

1. **Frontend** (React + Amplify) → Admin components
2. **Authentication** (Cognito) → JWT token validation
3. **API Layer** (API Gateway) → REST endpoints with authorizers
4. **Business Logic** (Lambda Functions) → Admin-specific operations
5. **Data Layer** (DynamoDB + S3) → Persistent storage
6. **AI Layer** (Bedrock) → Knowledge base sync and ingestion

**Security Model**:
- All admin routes require Cognito authentication
- API Gateway validates JWT tokens on every request
- Lambda functions inherit IAM roles with least-privilege access
- S3 buckets enforce server-side encryption
- DynamoDB tables use encryption at rest

---

## Related Documentation

- [AWS Architecture](AWS_ARCHITECTURE.md) - Complete system architecture with diagrams
- [User Flow Steps](USER_FLOW_STEPS.md) - User perspective flow (non-admin)
- [Admin Features](features/ADMIN_FEATURES.md) - Admin feature descriptions
- [Deployment Guide](deployment/CLIENT_DEPLOYMENT_GUIDE.md) - Deployment instructions

---

**Date**: January 11, 2026
**Status**: ✅ Complete - All admin flows documented
**Total Steps**: 39 steps across 5 major admin workflows
