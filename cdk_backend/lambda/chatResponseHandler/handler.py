"""
Chat Response Handler Lambda Function
(Formerly known as cfEvaluator)

This is the core chatbot orchestration engine that:
1. Receives user queries from websocketHandler Lambda
2. Invokes Amazon Bedrock Agent with role-specific personalization (learner, instructor, staff)
3. Streams AI-generated responses back to users via WebSocket API Gateway
4. Extracts confidence scores and knowledge base citations from agent responses
5. Triggers background analytics via logclassifier Lambda for sentiment analysis

The function handles both high-confidence responses (direct answers) and low-confidence
scenarios (email escalation to administrators).
"""

import json
import boto3
import os
import re
from datetime import datetime

# Initialize AWS clients
bedrock_agent = boto3.client('bedrock-agent-runtime', region_name='us-west-2')
api_gateway = boto3.client('apigatewaymanagementapi', endpoint_url=os.environ['WS_API_ENDPOINT'])
lambda_client = boto3.client('lambda')

agent_id = os.environ["AGENT_ID"]
agent_alias_id = os.environ["AGENT_ALIAS_ID"]
LOG_CLASSIFIER_FN_NAME = os.environ['LOG_CLASSIFIER_FN_NAME']

def send_ws_response(connection_id, response):
    if connection_id and connection_id.startswith("mock-"):
        print(f"[TEST] Skipping WebSocket send for mock ID: {connection_id}")
        return
    print(f"Sending response to WebSocket connection: {connection_id}")
    print(f"Response: {response}")
    try:
        api_gateway.post_to_connection(
            ConnectionId=connection_id,
            Data=json.dumps(response)
        )
    except Exception as e:
        print(f"WebSocket error: {str(e)}")

def get_role_specific_instructions(user_role):
    """
    Returns role-specific system instructions for the Bedrock Agent.
    """
    role_instructions = {
        'instructor': """You are assisting a certified MHFA Instructor. Focus your responses on:
- Teaching methodologies and best practices for conducting MHFA courses
- Course preparation, lesson planning, and classroom management
- Instructor certification requirements, renewals, and continuing education
- Accessing instructor-specific resources, manuals, and training materials
- Professional development and staying current with MHFA updates
- Handling challenging classroom scenarios and participant questions

Use professional, peer-to-peer language. Provide pedagogical insights and reference instructor resources.""",

        'staff': """You are assisting organizational staff implementing MHFA programs. Focus your responses on:
- Program implementation strategies and organizational rollout
- Scheduling, coordinating, and managing MHFA training sessions
- Tracking employee certifications and program metrics
- Budget considerations and resource allocation
- Measuring program effectiveness and ROI
- Integration with existing workplace wellness initiatives
- Case studies and organizational best practices

Use administrative, coordination-focused language. Provide strategic guidance for program management.""",

        'learner': """You are assisting a MHFA course participant or learner. Focus your responses on:
- Basic MHFA concepts, principles, and the ALGEE action plan
- Course registration, certification process, and requirements
- Practical application of MHFA skills in daily life
- Understanding mental health conditions and crisis situations
- Where to find additional learning resources and support
- Recertification process and maintaining skills
- Self-care and personal wellness while helping others

Use clear, educational, supportive language. Make concepts accessible and actionable."""
    }

    return role_instructions.get(user_role, role_instructions['learner'])

def lambda_handler(event, context):
    try:
        query = event.get("querytext", "").strip()
        connection_id = event.get("connectionId")
        session_id = event.get("session_id", context.aws_request_id)
        user_role = event.get("user_role", "guest")

        print(f"Received Query - Session: {session_id}, Role: {user_role}, Query: {query}")

        max_retries = 2
        full_response = ""

        # Get role-specific instructions
        role_instructions = get_role_specific_instructions(user_role)

        for attempt in range(max_retries):
            try:
                response = bedrock_agent.invoke_agent(
                    agentId=agent_id,
                    agentAliasId=agent_alias_id,
                    sessionId=session_id,
                    inputText=query,
                    enableTrace=True,  # CRITICAL: Enable trace to get knowledge base citations
                    sessionState={
                        'sessionAttributes': {
                            'user_role': user_role,
                            'role_instructions': role_instructions
                        },
                        'promptSessionAttributes': {
                            'role_context': role_instructions
                        }
                    }
                )

                full_response = ""
                citations = []

                print(f"🔄 Starting to stream response for connection: {connection_id}")
                for event in response['completion']:
                    if 'chunk' in event:
                        chunk = event['chunk']
                        if 'bytes' in chunk:
                            chunk_text = chunk['bytes'].decode('utf-8')
                            full_response += chunk_text
                            print(f"📨 Received chunk from Bedrock ({len(chunk_text)} chars): {chunk_text[:50]}...")

                            # Split large chunks into smaller pieces for smoother streaming
                            # Split by sentences first, then by words if still too large
                            if connection_id and chunk_text.strip():
                                # Split by sentences (period, exclamation, question mark followed by space or newline)
                                # This regex keeps the punctuation with the sentence
                                sentence_pattern = r'([.!?]+(?:\s+|$))'
                                sentences = re.split(sentence_pattern, chunk_text)

                                # Recombine sentences with their punctuation
                                parts = []
                                idx = 0
                                while idx < len(sentences):
                                    if idx + 1 < len(sentences):
                                        # Combine sentence with its punctuation
                                        combined = sentences[idx] + sentences[idx + 1]
                                        if combined.strip():  # Only add non-empty parts
                                            parts.append(combined)
                                        idx += 2
                                    else:
                                        if sentences[idx].strip():  # Only add non-empty parts
                                            parts.append(sentences[idx])
                                        idx += 1

                                # If we only got one part (no sentence breaks) or parts are still too large, split by words
                                if not parts or len(parts) == 1 or any(len(p) > 100 for p in parts if p):
                                    # Split by words for very long chunks or no sentence breaks
                                    words = [w for w in chunk_text.split(' ') if w.strip()]  # Filter empty words
                                    if words:
                                        # Group words into chunks of 8 words for smoother streaming
                                        word_chunks = []
                                        chunk_size = 8
                                        for word_idx in range(0, len(words), chunk_size):
                                            chunk = ' '.join(words[word_idx:word_idx + chunk_size])
                                            if word_idx + chunk_size < len(words):
                                                chunk += ' '
                                            word_chunks.append(chunk)
                                        parts = word_chunks if word_chunks else [chunk_text]
                                    else:
                                        parts = [chunk_text] if chunk_text.strip() else []

                                # Send each part immediately for visible streaming
                                for part in parts:
                                    if part and part.strip():  # Only send non-empty parts
                                        chunk_payload = {
                                            'type': 'chunk',
                                            'chunk': part
                                        }
                                        try:
                                            send_ws_response(connection_id, chunk_payload)
                                            print(f"📤 Sent streaming part ({len(part)} chars): {part[:30]}...")
                                        except Exception as chunk_error:
                                            print(f"⚠️ Error sending chunk: {str(chunk_error)}")
                                            # Continue streaming even if one chunk fails
                                            pass

                        # Extract citations if present in chunk attribution
                        if 'attribution' in chunk and 'citations' in chunk['attribution']:
                            for citation in chunk['attribution']['citations']:
                                citation_info = {
                                    'text': citation.get('generatedResponsePart', {}).get('textResponsePart', {}).get('text', ''),
                                    'references': []
                                }

                                # Extract reference sources
                                for ref in citation.get('retrievedReferences', []):
                                    location = ref.get('location', {})
                                    if location.get('type') == 'S3':
                                        s3_location = location.get('s3Location', {})
                                        citation_info['references'].append({
                                            'source': s3_location.get('uri', ''),
                                            'title': ref.get('metadata', {}).get('x-amz-bedrock-kb-source-uri', '').split('/')[-1]
                                        })

                                if citation_info['references']:
                                    citations.append(citation_info)

                    # Extract citations from trace events (Knowledge Base lookups)
                    if 'trace' in event:
                        trace = event['trace'].get('trace', {})
                        if 'orchestrationTrace' in trace:
                            orch_trace = trace['orchestrationTrace']
                            if 'observation' in orch_trace:
                                observation = orch_trace['observation']
                                if 'knowledgeBaseLookupOutput' in observation:
                                    kb_output = observation['knowledgeBaseLookupOutput']
                                    retrieved_refs = kb_output.get('retrievedReferences', [])
                                    print(f"📚 Found {len(retrieved_refs)} knowledge base references in trace")

                                    if retrieved_refs:
                                        # Create a citation object with all references
                                        citation_info = {
                                            'text': '',  # No specific text for KB references
                                            'references': []
                                        }

                                        # Use a set to track unique sources within this citation
                                        seen_sources = set()

                                        for ref in retrieved_refs:
                                            location = ref.get('location', {})
                                            s3_location = location.get('s3Location', {})
                                            uri = s3_location.get('uri', '')

                                            if uri and uri not in seen_sources:
                                                # Extract filename from URI
                                                filename = uri.split('/')[-1] if '/' in uri else uri

                                                citation_info['references'].append({
                                                    'source': uri,
                                                    'title': filename
                                                })
                                                seen_sources.add(uri)
                                                print(f"📚 Added citation: {filename}")

                                        # Only add if we have references and avoid duplicates
                                        if citation_info['references']:
                                            # Check if we already have these references
                                            existing_sources = set()
                                            for existing_citation in citations:
                                                for ref in existing_citation.get('references', []):
                                                    existing_sources.add(ref.get('source', ''))

                                            new_refs = [ref for ref in citation_info['references']
                                                       if ref['source'] not in existing_sources]

                                            if new_refs:
                                                citation_info['references'] = new_refs
                                                citations.append(citation_info)

                break
            except Exception as e:
                print(f"Attempt {attempt + 1} failed: {str(e)}")
                if attempt == max_retries - 1:
                    raise

        
        print(full_response)

        payload = {
            "session_id": session_id,
            "timestamp": datetime.utcnow().isoformat(),
            "query": query,
            "response": full_response
        }

        print(payload)

        result = {
                'type': 'complete',
                'responsetext': full_response,
                'citations': citations if citations else []
                 }

        print(f"✅ Streaming complete, sending final message with {len(citations)} citations")
        if connection_id:
            send_ws_response(connection_id, result)

        lambda_client.invoke(
            FunctionName   = LOG_CLASSIFIER_FN_NAME,
            InvocationType = 'Event',
            Payload        = json.dumps(payload).encode('utf-8')
        )

        return {'statusCode': 200, 'body': json.dumps(result)}

    except Exception as e:
        print(f"Error: {str(e)}")
        error_msg = {'error': str(e)}
        if connection_id:
            send_ws_response(connection_id, error_msg)
        return {'statusCode': 500, 'body': json.dumps(error_msg)}