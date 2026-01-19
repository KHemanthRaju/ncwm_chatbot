# Kafka-Based Streaming Architecture for Chatbot Responses

## Overview

This document outlines how to implement Kafka (Amazon MSK) for streaming chatbot responses, providing message persistence, replay capabilities, and better scalability.

## Architecture Options

### Option 1: Kafka as Message Queue (Recommended for Multi-Consumer)

```
User → WebSocket API → Lambda (chatResponseHandler) → Kafka Topic → Consumer Lambda → WebSocket Response
                                                      ↓
                                              Analytics/Logging Consumers
```

**Benefits:**
- Multiple consumers can process the same messages
- Message persistence for replay
- Better for analytics and logging

**Implementation:**
1. Lambda (chatResponseHandler) publishes chunks to Kafka topic
2. Consumer Lambda reads from Kafka and sends to WebSocket
3. Additional consumers for analytics/logging

### Option 2: Kafka as Buffer with Direct WebSocket (Hybrid)

```
User → WebSocket API → Lambda (chatResponseHandler) → Kafka Topic (async)
                                              ↓
                                         WebSocket (direct, real-time)
```

**Benefits:**
- Real-time streaming via WebSocket
- Kafka for persistence and analytics only
- Best of both worlds

**Implementation:**
1. Lambda sends chunks directly to WebSocket (current approach)
2. Also publishes to Kafka for persistence/analytics
3. Frontend consumes from WebSocket (no change needed)

## Implementation Guide

### Step 1: Create MSK Cluster

```typescript
// In cdk_backend-stack.ts
import * as msk from 'aws-cdk-lib/aws-msk';

const kafkaCluster = new msk.Cluster(this, 'ChatbotKafkaCluster', {
  clusterName: 'chatbot-streaming-cluster',
  kafkaVersion: '3.5.1',
  numberOfBrokerNodes: 2,
  instanceType: 'kafka.m5.large',
  vpc: vpc, // You'll need a VPC
  removalPolicy: cdk.RemovalPolicy.RETAIN,
});
```

### Step 2: Update Lambda to Publish to Kafka

```python
# In chatResponseHandler/handler.py
import boto3
from kafka import KafkaProducer
import json

# Initialize Kafka producer
kafka_producer = KafkaProducer(
    bootstrap_servers=kafka_brokers,
    value_serializer=lambda v: json.dumps(v).encode('utf-8'),
    security_protocol='SSL',
    ssl_context=ssl.create_default_context()
)

# In the streaming loop:
for part in parts:
    if part.strip():
        chunk_payload = {
            'type': 'chunk',
            'chunk': part,
            'connection_id': connection_id,
            'session_id': session_id,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        # Send to WebSocket (existing)
        send_ws_response(connection_id, chunk_payload)
        
        # Also publish to Kafka
        kafka_producer.send(
            'chatbot-responses',
            key=connection_id.encode('utf-8'),
            value=chunk_payload
        )
```

### Step 3: Create Consumer Lambda

```python
# New lambda: kafkaConsumer/handler.py
from kafka import KafkaConsumer
import json
import boto3

api_gateway = boto3.client('apigatewaymanagementapi', 
                          endpoint_url=os.environ['WS_API_ENDPOINT'])

def lambda_handler(event, context):
    consumer = KafkaConsumer(
        'chatbot-responses',
        bootstrap_servers=kafka_brokers,
        group_id='websocket-consumer-group',
        value_deserializer=lambda m: json.loads(m.decode('utf-8'))
    )
    
    for message in consumer:
        payload = message.value
        connection_id = payload['connection_id']
        
        # Send to WebSocket
        api_gateway.post_to_connection(
            ConnectionId=connection_id,
            Data=json.dumps({
                'type': payload['type'],
                'chunk': payload['chunk']
            })
        )
```

## Alternative: AWS Kinesis Data Streams

For AWS-native streaming, consider **Kinesis Data Streams** instead of Kafka:

**Benefits:**
- Fully managed (no cluster management)
- Better integration with AWS services
- Lower operational overhead
- Pay-per-use pricing

**Architecture:**
```
Lambda → Kinesis Stream → Lambda Consumer → WebSocket
```

## Recommendation

For your current use case (single-user chat streaming), **stick with direct WebSocket** because:

1. ✅ **Lower latency** - Direct connection, no intermediate queue
2. ✅ **Simpler architecture** - Fewer moving parts
3. ✅ **Lower cost** - No MSK cluster to maintain
4. ✅ **Already working** - Current implementation is effective

**Consider Kafka/Kinesis if you need:**
- Message replay/recovery
- Multiple consumers (analytics, logging, backup)
- High-throughput multi-user scenarios
- Message persistence for compliance

## Hybrid Approach (Best of Both Worlds)

Keep WebSocket for real-time streaming, add Kafka/Kinesis for analytics:

```python
# In chatResponseHandler/handler.py
for part in parts:
    # Real-time: Send directly to WebSocket
    send_ws_response(connection_id, chunk_payload)
    
    # Analytics: Also publish to Kafka/Kinesis (async, non-blocking)
    kafka_producer.send('chatbot-analytics', value=chunk_payload)
```

This gives you:
- ✅ Real-time streaming (WebSocket)
- ✅ Message persistence (Kafka/Kinesis)
- ✅ Analytics capabilities
- ✅ No impact on user experience

