# Custom RAG Migration Plan: Replacing Bedrock Agent with Lambda

## Overview
This document outlines the plan to replace Amazon Bedrock Agents with a custom Lambda-based RAG (Retrieval Augmented Generation) implementation while maintaining all existing functionality.

## Current Architecture

```
┌─────────┐    WebSocket    ┌──────────┐    invoke_agent    ┌───────────────┐
│ Frontend│ ──────────────► │  Lambda  │ ─────────────────► │ Bedrock Agent │
└─────────┘                 │(cfEvaluator)                   │   (Managed)   │
                            └──────────┘                     └───────┬───────┘
                                                                     │
                                                    ┌────────────────┴────────────┐
                                                    ▼                             ▼
                                            ┌──────────────┐            ┌─────────────┐
                                            │Knowledge Base│            │Claude 3.5   │
                                            │(Vector Store)│            │Sonnet v2    │
                                            └──────────────┘            └─────────────┘
```

## Proposed Architecture

```
┌─────────┐    WebSocket    ┌──────────────────────────────────────────┐
│ Frontend│ ──────────────► │  Lambda (Custom RAG Handler)             │
└─────────┘                 │                                          │
                            │  1. Query Knowledge Base (retrieve API)  │
                            │  2. Format context with documents        │
                            │  3. Call Claude via Bedrock Runtime      │
                            │  4. Stream response with citations       │
                            │  5. Manage session in DynamoDB           │
                            └──────┬───────────────────────────────────┘
                                   │
                    ┌──────────────┼──────────────┬──────────────┐
                    ▼              ▼              ▼              ▼
            ┌──────────────┐ ┌─────────┐ ┌──────────┐ ┌──────────────┐
            │Knowledge Base│ │ Claude  │ │ DynamoDB │ │  S3 Bucket   │
            │  (retrieve)  │ │(invoke) │ │(sessions)│ │   (docs)     │
            └──────────────┘ └─────────┘ └──────────┘ └──────────────┘
```

## Migration Phases

### Phase 1: Knowledge Base Retrieval (Week 1)

**Objective**: Replace Agent's knowledge base query with direct `retrieve()` API

**Files to Modify**:
- `cdk_backend/lambda/customRagHandler/handler.py` (new)
- `cdk_backend/lib/cdk_backend-stack.ts`

**Implementation Steps**:

1. Create new Lambda function `customRagHandler`:
```python
import boto3

bedrock_agent_runtime = boto3.client('bedrock-agent-runtime')

def retrieve_documents(knowledge_base_id, query, max_results=5):
    """
    Query knowledge base directly without agent orchestration
    """
    response = bedrock_agent_runtime.retrieve(
        knowledgeBaseId=knowledge_base_id,
        retrievalQuery={
            'text': query
        },
        retrievalConfiguration={
            'vectorSearchConfiguration': {
                'numberOfResults': max_results,
                'overrideSearchType': 'HYBRID'  # Combines vector + keyword search
            }
        }
    )

    documents = []
    for result in response['retrievalResults']:
        documents.append({
            'content': result['content']['text'],
            'source': result['location']['s3Location']['uri'],
            'score': result['score'],
            'metadata': result.get('metadata', {})
        })

    return documents
```

2. Add IAM permissions in CDK:
```typescript
customRagHandler.addToRolePolicy(new iam.PolicyStatement({
  actions: [
    'bedrock:Retrieve',
    'bedrock:RetrieveAndGenerate'
  ],
  resources: [kb.knowledgeBaseArn]
}));
```

**Testing**:
- Verify documents are retrieved correctly
- Compare relevance scores with Agent results
- Test with various query types

---

### Phase 2: Direct Claude Invocation (Week 2)

**Objective**: Call Claude directly via Bedrock Runtime API with streamed responses

**Implementation**:

```python
import boto3
import json

bedrock_runtime = boto3.client('bedrock-runtime')

def invoke_claude_streaming(prompt, system_prompt, model_id='anthropic.claude-3-5-sonnet-20241022-v2:0'):
    """
    Call Claude directly with streaming support
    """
    request = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 4096,
        "temperature": 0.7,
        "system": system_prompt,
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ]
    }

    response = bedrock_runtime.invoke_model_with_response_stream(
        modelId=model_id,
        contentType='application/json',
        accept='application/json',
        body=json.dumps(request)
    )

    # Stream response chunks
    for event in response['body']:
        chunk = json.loads(event['chunk']['bytes'].decode())

        if chunk['type'] == 'content_block_delta':
            yield chunk['delta']['text']
        elif chunk['type'] == 'message_stop':
            break
```

**Context Formatting**:

```python
def format_rag_prompt(query, documents, user_role, conversation_history=[]):
    """
    Build prompt with retrieved context
    """
    # Format documents as context
    context = "\n\n".join([
        f"Document {i+1} (Source: {doc['source']}):\n{doc['content']}"
        for i, doc in enumerate(documents)
    ])

    # Build conversation history
    history = "\n".join([
        f"{msg['role']}: {msg['content']}"
        for msg in conversation_history[-5:]  # Last 5 messages
    ])

    prompt = f"""Based on the following context from our knowledge base, answer the user's question.

Context:
{context}

Previous conversation:
{history}

User Question: {query}

Instructions:
- Answer based primarily on the provided context
- If the context doesn't contain the answer, say so clearly
- Cite specific documents when referencing information
- Maintain a {user_role}-appropriate tone and detail level"""

    return prompt
```

**System Prompt**:

```python
def get_system_prompt(user_role):
    """
    Role-based system instructions
    """
    base_prompt = """You are the Learning Navigator, an AI assistant for the MHFA Learning Ecosystem.
You help users navigate training resources, understand courses, and access administrative information."""

    role_instructions = get_role_specific_instructions(user_role)

    return f"{base_prompt}\n\n{role_instructions}"
```

**Testing**:
- Compare response quality with Agent
- Test streaming performance
- Verify role-based personalization

---

### Phase 3: Session & History Management (Week 3)

**Objective**: Implement conversation context management with DynamoDB

**DynamoDB Schema**:

```typescript
// In CDK Stack
const conversationHistoryTable = new dynamodb.Table(this, 'ConversationHistory', {
  tableName: 'NCMWConversationHistory',
  partitionKey: { name: 'session_id', type: dynamodb.AttributeType.STRING },
  sortKey: { name: 'timestamp', type: dynamodb.AttributeType.STRING },
  timeToLiveAttribute: 'ttl',  // Auto-expire after 24 hours
  removalPolicy: cdk.RemovalPolicy.DESTROY
});
```

**Session Management**:

```python
import boto3
from datetime import datetime, timedelta

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('NCMWConversationHistory')

def save_message(session_id, role, content):
    """
    Save message to conversation history
    """
    timestamp = datetime.utcnow().isoformat()
    ttl = int((datetime.utcnow() + timedelta(days=1)).timestamp())

    table.put_item(Item={
        'session_id': session_id,
        'timestamp': timestamp,
        'role': role,
        'content': content,
        'ttl': ttl
    })

def get_conversation_history(session_id, limit=10):
    """
    Retrieve recent conversation history
    """
    response = table.query(
        KeyConditionExpression='session_id = :sid',
        ExpressionAttributeValues={':sid': session_id},
        ScanIndexForward=False,  # Most recent first
        Limit=limit
    )

    messages = [
        {'role': item['role'], 'content': item['content']}
        for item in reversed(response['Items'])
    ]

    return messages
```

**Context Window Management**:

```python
def manage_context_window(messages, max_tokens=100000):
    """
    Ensure conversation fits within Claude's context window
    """
    # Estimate tokens (rough: 1 token ≈ 4 chars)
    estimated_tokens = sum(len(m['content']) // 4 for m in messages)

    # Trim oldest messages if exceeding limit
    while estimated_tokens > max_tokens and len(messages) > 2:
        removed = messages.pop(0)
        estimated_tokens -= len(removed['content']) // 4

    return messages
```

**Testing**:
- Test multi-turn conversations
- Verify history retrieval
- Test session expiration
- Load test with concurrent sessions

---

### Phase 4: Citations & Source Tracking (Week 4)

**Objective**: Implement citation tracking matching current functionality

**Citation Structure**:

```python
def track_citations(documents, response_text):
    """
    Match response segments to source documents
    """
    citations = []
    seen_sources = set()

    for doc in documents:
        if doc['source'] not in seen_sources:
            # Extract filename from S3 URI
            filename = doc['source'].split('/')[-1]

            citations.append({
                'text': '',
                'references': [{
                    'source': doc['source'],
                    'title': filename,
                    'score': doc['score']
                }]
            })
            seen_sources.add(doc['source'])

    return citations
```

**Response Format**:

```python
def format_response(response_text, citations):
    """
    Format response matching current WebSocket structure
    """
    return {
        'type': 'complete',
        'responsetext': response_text,
        'citations': citations
    }
```

**Testing**:
- Verify citations match retrieved documents
- Test citation deduplication
- Compare with Agent citation format

---

### Phase 5: Guardrails Integration (Week 5)

**Objective**: Implement content filtering matching current guardrail

**Implementation**:

```python
def apply_guardrails(text, guardrail_id, guardrail_version):
    """
    Check content against Bedrock Guardrails
    """
    response = bedrock_runtime.apply_guardrail(
        guardrailIdentifier=guardrail_id,
        guardrailVersion=guardrail_version,
        source='INPUT',  # or 'OUTPUT'
        content=[{
            'text': {'text': text}
        }]
    )

    if response['action'] == 'GUARDRAIL_INTERVENED':
        # Content violated guardrail
        return {
            'allowed': False,
            'reason': response['assessments']
        }

    return {'allowed': True}
```

**Integration Points**:

1. **Input Filtering**:
```python
# Before querying knowledge base
guardrail_check = apply_guardrails(user_query, guardrail_id, guardrail_version)
if not guardrail_check['allowed']:
    return error_response("Query contains inappropriate content")
```

2. **Output Filtering**:
```python
# After Claude generates response
guardrail_check = apply_guardrails(response_text, guardrail_id, guardrail_version)
if not guardrail_check['allowed']:
    return error_response("Response filtered by content policy")
```

**Testing**:
- Test with PII input
- Test with inappropriate content
- Verify guardrail policies match Agent behavior

---

### Phase 6: Complete Handler Implementation (Week 6)

**Full Lambda Handler**:

```python
import json
import boto3
import os
from datetime import datetime

# Initialize clients
bedrock_agent_runtime = boto3.client('bedrock-agent-runtime')
bedrock_runtime = boto3.client('bedrock-runtime')
api_gateway = boto3.client('apigatewaymanagementapi', endpoint_url=os.environ['WS_API_ENDPOINT'])
dynamodb = boto3.resource('dynamodb')

# Environment variables
KNOWLEDGE_BASE_ID = os.environ['KNOWLEDGE_BASE_ID']
GUARDRAIL_ID = os.environ['GUARDRAIL_ID']
GUARDRAIL_VERSION = os.environ['GUARDRAIL_VERSION']
CONVERSATION_TABLE = os.environ['CONVERSATION_TABLE']
MODEL_ID = 'anthropic.claude-3-5-sonnet-20241022-v2:0'

def lambda_handler(event, context):
    """
    Custom RAG handler replacing Bedrock Agent
    """
    try:
        # Parse request
        query = event.get("querytext", "").strip()
        connection_id = event.get("connectionId")
        session_id = event.get("session_id", context.aws_request_id)
        user_role = event.get("user_role", "guest")

        print(f"Processing query - Session: {session_id}, Role: {user_role}")

        # 1. Apply input guardrails
        guardrail_check = apply_guardrails(query, GUARDRAIL_ID, GUARDRAIL_VERSION)
        if not guardrail_check['allowed']:
            send_error(connection_id, "Query contains inappropriate content")
            return {'statusCode': 400}

        # 2. Retrieve conversation history
        conversation_history = get_conversation_history(session_id)

        # 3. Query knowledge base
        documents = retrieve_documents(KNOWLEDGE_BASE_ID, query, max_results=5)
        print(f"Retrieved {len(documents)} documents")

        # 4. Build RAG prompt
        system_prompt = get_system_prompt(user_role)
        rag_prompt = format_rag_prompt(query, documents, user_role, conversation_history)

        # 5. Invoke Claude with streaming
        full_response = ""
        for chunk in invoke_claude_streaming(rag_prompt, system_prompt, MODEL_ID):
            full_response += chunk

            # Stream chunk to frontend
            send_chunk(connection_id, chunk)

        # 6. Apply output guardrails
        guardrail_check = apply_guardrails(full_response, GUARDRAIL_ID, GUARDRAIL_VERSION)
        if not guardrail_check['allowed']:
            send_error(connection_id, "Response filtered by content policy")
            return {'statusCode': 200}

        # 7. Track citations
        citations = track_citations(documents, full_response)

        # 8. Send complete message with citations
        send_complete(connection_id, full_response, citations)

        # 9. Save to conversation history
        save_message(session_id, 'user', query)
        save_message(session_id, 'assistant', full_response)

        # 10. Log for analytics
        log_interaction(session_id, query, full_response, user_role)

        return {'statusCode': 200}

    except Exception as e:
        print(f"Error: {str(e)}")
        send_error(connection_id, str(e))
        return {'statusCode': 500}

def send_chunk(connection_id, chunk):
    """Send streaming chunk via WebSocket"""
    if connection_id:
        api_gateway.post_to_connection(
            ConnectionId=connection_id,
            Data=json.dumps({'type': 'chunk', 'chunk': chunk})
        )

def send_complete(connection_id, response, citations):
    """Send complete message with citations"""
    if connection_id:
        api_gateway.post_to_connection(
            ConnectionId=connection_id,
            Data=json.dumps({
                'type': 'complete',
                'responsetext': response,
                'citations': citations
            })
        )

def send_error(connection_id, error):
    """Send error message"""
    if connection_id:
        api_gateway.post_to_connection(
            ConnectionId=connection_id,
            Data=json.dumps({'type': 'error', 'message': error})
        )
```

---

### Phase 7: CDK Stack Updates (Week 7)

**Update Infrastructure**:

```typescript
// In cdk_backend/lib/cdk_backend-stack.ts

// Create conversation history table
const conversationHistoryTable = new dynamodb.Table(this, 'ConversationHistory', {
  tableName: 'NCMWConversationHistory',
  partitionKey: { name: 'session_id', type: dynamodb.AttributeType.STRING },
  sortKey: { name: 'timestamp', type: dynamodb.AttributeType.STRING },
  timeToLiveAttribute: 'ttl',
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
  removalPolicy: cdk.RemovalPolicy.DESTROY
});

// Create custom RAG handler
const customRagHandler = new lambda.Function(this, 'CustomRagHandler', {
  runtime: lambda.Runtime.PYTHON_3_12,
  handler: 'handler.lambda_handler',
  code: lambda.Code.fromAsset('lambda/customRagHandler'),
  timeout: cdk.Duration.seconds(120),
  memorySize: 512,
  environment: {
    KNOWLEDGE_BASE_ID: kb.knowledgeBaseId,
    GUARDRAIL_ID: guardrail.guardrailId,
    GUARDRAIL_VERSION: 'DRAFT',
    CONVERSATION_TABLE: conversationHistoryTable.tableName,
    WS_API_ENDPOINT: websocketApi.apiEndpoint,
    LOG_CLASSIFIER_FN_NAME: logclassifier.functionName
  }
});

// Grant permissions
conversationHistoryTable.grantReadWriteData(customRagHandler);
knowledgeBaseDataBucket.grantRead(customRagHandler);
logclassifier.grantInvoke(customRagHandler);

customRagHandler.addToRolePolicy(new iam.PolicyStatement({
  actions: [
    'bedrock:Retrieve',
    'bedrock:InvokeModel',
    'bedrock:InvokeModelWithResponseStream',
    'bedrock:ApplyGuardrail'
  ],
  resources: ['*']
}));

// Update WebSocket route to use new handler instead of cfEvaluator
const sendMessageRoute = websocketApi.addRoute('sendMessage', {
  integration: new apigatewayv2_integrations.WebSocketLambdaIntegration(
    'SendMessageIntegration',
    customRagHandler
  )
});
```

---

## Comparison: Agent vs Custom Implementation

### Feature Parity Matrix

| Feature | Bedrock Agent | Custom Lambda | Status |
|---------|--------------|---------------|--------|
| Knowledge Base Query | ✅ Automatic | ✅ `retrieve()` API | Same |
| LLM Invocation | ✅ Managed | ✅ Direct API | Same |
| Streaming | ✅ Built-in | ✅ `invoke_model_with_response_stream` | Same |
| Citations | ✅ Automatic | ✅ Manual tracking | Same |
| Session Management | ✅ Built-in | ⚠️ DynamoDB required | Additional work |
| Guardrails | ✅ Integrated | ✅ `apply_guardrail()` API | Same |
| Role Personalization | ✅ Session attributes | ✅ Custom logic | Same |
| Cost | 💰 Per token + per request | 💰 Per token only | **Cheaper** |
| Control | ⚠️ Limited | ✅ Full control | **Better** |
| Maintenance | ✅ AWS managed | ⚠️ Self-managed | **More work** |
| Complexity | ✅ Simple | ⚠️ Complex | **Higher** |

---

## Cost Analysis

### Current (Bedrock Agent):
- **Agent invocation**: $0.0008 per 1K input tokens, $0.0032 per 1K output tokens
- **Claude 3.5 Sonnet**: Included in agent pricing
- **Knowledge Base queries**: $0.0004 per query
- **Total per 1K tokens (estimate)**: ~$0.004

### Proposed (Custom Lambda):
- **Lambda**: $0.0000166667 per GB-second (negligible)
- **Claude 3.5 Sonnet direct**: $0.003 per 1K input, $0.015 per 1K output
- **Knowledge Base `retrieve()`**: $0.0004 per query
- **DynamoDB**: Pay-per-request (very low)
- **Total per 1K tokens (estimate)**: ~$0.018

**Analysis**: Custom implementation might actually be **more expensive** due to direct Claude pricing without agent bundling. **Recommendation**: Verify pricing before migrating.

---

## Migration Steps

### Step 1: Parallel Deployment (Week 8)
1. Deploy custom handler alongside existing Agent
2. Use feature flag to route 10% of traffic to custom handler
3. Compare responses, latency, and cost

### Step 2: Gradual Rollout (Week 9-10)
1. Increase traffic to 25%, 50%, 75%
2. Monitor metrics at each stage
3. Rollback if issues detected

### Step 3: Full Migration (Week 11)
1. Route 100% traffic to custom handler
2. Remove Agent dependencies from CDK
3. Clean up unused resources

### Step 4: Optimization (Week 12)
1. Fine-tune chunk sizes for streaming
2. Optimize DynamoDB queries
3. Implement caching for frequent queries
4. Performance testing and tuning

---

## Risks & Mitigation

### Risk 1: Response Quality Degradation
- **Mitigation**: A/B testing with quality metrics
- **Fallback**: Keep Agent as backup for 30 days

### Risk 2: Increased Latency
- **Mitigation**: Optimize query + LLM invocation
- **Target**: < 500ms first chunk, < 5s total

### Risk 3: Cost Increase
- **Mitigation**: Detailed cost tracking per component
- **Decision point**: Revert if cost > 20% higher

### Risk 4: Session Management Bugs
- **Mitigation**: Extensive testing with concurrent sessions
- **Monitoring**: DynamoDB throttling alerts

### Risk 5: Citation Accuracy
- **Mitigation**: Automated tests comparing citations
- **Validation**: Manual QA on sample queries

---

## Rollback Plan

If migration fails:

1. **Immediate** (< 1 hour):
   - Revert traffic to Bedrock Agent
   - Use CloudFormation rollback

2. **Short-term** (< 24 hours):
   - Investigate root cause
   - Fix critical issues
   - Retry with smaller traffic %

3. **Long-term** (< 1 week):
   - Re-evaluate migration necessity
   - Consider hybrid approach
   - Document lessons learned

---

## Success Criteria

Migration is successful when:

✅ Response quality matches or exceeds Agent (measured by user feedback)
✅ P95 latency < 5 seconds for complete response
✅ First chunk latency < 500ms
✅ Citation accuracy > 95%
✅ Cost delta < +20% (or negative)
✅ Zero data loss in session management
✅ Uptime > 99.9%
✅ Zero security vulnerabilities

---

## Recommendation

### ⚠️ **I do NOT recommend this migration** unless you have specific requirements because:

1. **Bedrock Agents is NOT retiring** - it's actively developed
2. **More complexity** - you'll own session management, orchestration, error handling
3. **Potentially higher cost** - direct Claude pricing may be more expensive
4. **Maintenance burden** - you'll need to handle updates, security, scaling
5. **Feature parity requires significant effort** - 12 weeks of development

### ✅ **Consider migration ONLY if**:

- You need custom orchestration logic Agent doesn't support
- You require fine-grained control over RAG pipeline
- You have specific latency optimizations needed
- Your use case doesn't fit Agent's model
- You have engineering resources for maintenance

### 🤔 **Alternative: Hybrid Approach**

Keep Bedrock Agent but add custom Lambda for:
- Pre-processing queries
- Post-processing responses
- Custom analytics
- Special case handling

This gives you control without full migration complexity.

---

## Next Steps

If you decide to proceed:

1. **Validate pricing** with AWS account team
2. **Prototype Phase 1-2** (2 weeks) to test feasibility
3. **Run cost comparison** with real traffic
4. **Get stakeholder buy-in** for 12-week migration
5. **Allocate engineering resources** (1-2 FTE)

Do you want me to proceed with implementing this plan, or would you like to discuss why you're considering this migration?
