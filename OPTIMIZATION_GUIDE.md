# Chat Response Lambda - Latency Optimization Guide

## Current Performance Baseline
- **With Cold Start:** 24.6 seconds (includes 394ms initialization)
- **Warm Start:** 17.3 seconds
- **Memory Usage:** 94 MB (out of 1024 MB allocated)

## Performance Breakdown
1. **Bedrock Agent Processing:** 15-20 seconds (MAIN BOTTLENECK)
2. **Knowledge Base Search:** 5-7 seconds
3. **Lambda Processing:** <1 second
4. **Cold Start:** 400ms (first request only)

---

## ✅ Applied Optimizations

### 1. Memory Increase: 128MB → 1024MB
**Status:** Applied ✅
**Expected Impact:** 30-40% reduction in Lambda processing time
**Cost Impact:** Minimal (only pay for execution time)

---

## 🎯 Recommended Further Optimizations

### 2. Reduce Bedrock Agent Latency (HIGHEST IMPACT)

**Option A: Use Provisioned Throughput for Bedrock**
```bash
# Enable provisioned throughput for faster model access
# Reduces Bedrock latency by 40-60%
aws bedrock create-provisioned-model-throughput \
  --model-id anthropic.claude-4-sonnet-v1:0 \
  --provisioned-model-name mhfa-chatbot-provisioned \
  --model-units 1
```
- **Expected Impact:** 6-10 seconds reduction
- **Cost:** ~$8-10/hour for provisioned capacity
- **Best for:** Production with consistent traffic

**Option B: Use Claude Sonnet 3.5 Instead of 4**
- **Expected Impact:** 3-5 seconds reduction
- **Trade-off:** Slightly lower quality responses
- **Cost:** Same pricing

**Option C: Optimize Agent Instructions**
- Remove verbose instructions
- Simplify system prompts
- **Expected Impact:** 1-2 seconds reduction

### 3. Enable Lambda Response Streaming
**Status:** To be implemented
Instead of buffering entire response, stream directly to WebSocket:

```javascript
// Current: Buffer entire response, then send
// Optimized: Stream each chunk immediately (already doing this!)
```
**Current Status:** ✅ Already implemented!

### 4. Optimize Knowledge Base Search

**Option A: Reduce maxResults in KB query**
```typescript
// In Bedrock Agent configuration
retrieveAndGenerateConfiguration: {
  knowledgeBaseConfiguration: {
    maxResults: 3  // Instead of default 5
  }
}
```
- **Expected Impact:** 1-2 seconds reduction
- **Trade-off:** Potentially less comprehensive answers

**Option B: Add Semantic Cache**
Cache common queries and responses:
- "What is MHFA?" → Cache for 1 hour
- **Expected Impact:** Sub-second response for cached queries
- **Cost:** Redis/ElastiCache (~$15/month)

### 5. Parallel Processing Optimizations

**Current Code Structure:** Sequential processing
**Optimization:** Process log classifier invocation in parallel

```javascript
// Current (sequential)
await sendWsResponse(connectionId, result);
await lambdaClient.send(invokeCommand);

// Optimized (parallel)
await Promise.all([
  sendWsResponse(connectionId, result),
  lambdaClient.send(invokeCommand)
]);
```
**Expected Impact:** 100-200ms reduction

### 6. Connection Pooling
The AWS SDK clients are already initialized globally ✅
- Reuses connections across invocations
- Reduces connection overhead

### 7. Remove Verbose Logging in Production
Current code logs extensively. In production:
```javascript
// Only log errors and critical info
const DEBUG = process.env.DEBUG === 'true';
if (DEBUG) console.log('📨 Received chunk...');
```
**Expected Impact:** 50-100ms reduction

---

## 🏆 Recommended Implementation Order

### Phase 1: Quick Wins (Already Done!)
✅ Memory increase to 1024MB
✅ Streaming implementation

### Phase 2: Low-Hanging Fruit (15 minutes)
1. Parallel log classifier invocation
2. Reduce verbose logging in production
3. Optimize Knowledge Base maxResults

**Expected total improvement:** 2-3 seconds
**Cost:** $0

### Phase 3: Medium Effort (1-2 hours)
1. Implement semantic caching for common queries
2. Optimize agent instructions
3. Consider Claude 3.5 Sonnet for faster responses

**Expected total improvement:** 4-6 seconds
**Cost:** ~$15/month for caching

### Phase 4: High Impact, High Cost (If needed)
1. Enable Provisioned Throughput for Bedrock
2. Multi-region deployment

**Expected total improvement:** 6-10 seconds
**Cost:** ~$200-300/month

---

## 📊 Expected Results After All Optimizations

| Scenario | Current | After Phase 2 | After Phase 3 | After Phase 4 |
|----------|---------|---------------|---------------|---------------|
| Cold Start | 24.6s | 21-22s | 17-19s | 11-13s |
| Warm Start | 17.3s | 14-15s | 11-13s | 6-8s |
| Cached Query | N/A | N/A | <1s | <1s |

---

## 🔧 Quick Implementation: Phase 2 Optimizations

### 1. Parallel Processing
Edit `/cdk_backend/lambda/chatResponseHandler/handler.js`:

```javascript
// Around line 338, change this:
if (connectionId) {
    await sendWsResponse(connectionId, result);
}

// Invoke log classifier asynchronously
const invokeCommand = new InvokeCommand({
    FunctionName: LOG_CLASSIFIER_FN_NAME,
    InvocationType: 'Event',
    Payload: Buffer.from(JSON.stringify(payload))
});
await lambdaClient.send(invokeCommand);

// TO THIS:
const promises = [];

if (connectionId) {
    promises.push(sendWsResponse(connectionId, result));
}

// Invoke log classifier in parallel
const invokeCommand = new InvokeCommand({
    FunctionName: LOG_CLASSIFIER_FN_NAME,
    InvocationType: 'Event',
    Payload: Buffer.from(JSON.stringify(payload))
});
promises.push(lambdaClient.send(invokeCommand));

// Wait for both to complete
await Promise.all(promises);
```

### 2. Reduce Logging Overhead
Add at the top of handler.js:

```javascript
const DEBUG = process.env.DEBUG === 'true';
const log = (...args) => DEBUG && console.log(...args);

// Replace all console.log with log()
// Keep console.error() as is for errors
```

Then update Lambda environment:
```bash
aws lambda update-function-configuration \
  --function-name BlueberryStackLatest-cfEvaluatorFC18B8AA-IHPtXe2az5N8 \
  --environment "Variables={DEBUG=false,...other vars...}"
```

---

## 💡 Most Important Takeaway

**The main bottleneck is Bedrock Agent processing (15-20 seconds), not Lambda.**

Your best options for significant improvement:
1. ✅ Memory increase (done!)
2. 🎯 Provisioned Throughput for Bedrock (if budget allows)
3. 🎯 Semantic caching for common queries
4. 🎯 Consider Claude 3.5 for faster responses

The Lambda function itself is already well-optimized with streaming!
