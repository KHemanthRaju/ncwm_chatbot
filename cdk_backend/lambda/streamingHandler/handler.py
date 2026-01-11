import json
import boto3
import os
from datetime import datetime

# Initialize AWS clients
bedrock_agent = boto3.client('bedrock-agent-runtime', region_name='us-west-2')
lambda_client = boto3.client('lambda')

agent_id = os.environ["AGENT_ID"]
agent_alias_id = os.environ["AGENT_ALIAS_ID"]
LOG_CLASSIFIER_FN_NAME = os.environ['LOG_CLASSIFIER_FN_NAME']

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
    """
    Lambda handler that returns a generator for streaming responses.
    This works with Lambda Function URLs with InvokeMode: RESPONSE_STREAM
    """
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        query = body.get("querytext", "").strip()
        session_id = body.get("session_id", context.aws_request_id)
        user_role = body.get("user_role", "guest")

        print(f"🔵 Streaming Request - Session: {session_id}, Role: {user_role}, Query: {query}")

        if not query:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                'body': json.dumps({'error': 'Query text is required'})
            }

        # Get role-specific instructions
        role_instructions = get_role_specific_instructions(user_role)

        # Invoke Bedrock Agent with streaming
        response = bedrock_agent.invoke_agent(
            agentId=agent_id,
            agentAliasId=agent_alias_id,
            sessionId=session_id,
            inputText=query,
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

        # For streaming response, return response with stream
        return awslambda.stream_response(
            statusCode=200,
            headers={
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*',
                'X-Accel-Buffering': 'no',
            },
            body=stream_bedrock_response(response, session_id, query, user_role)
        )

    except Exception as e:
        print(f"❌ Error in streaming handler: {str(e)}")
        import traceback
        traceback.print_exc()

        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            'body': json.dumps({'error': str(e)})
        }

def stream_bedrock_response(response, session_id, query, user_role):
    """
    Generator function that yields SSE-formatted chunks.
    """
    full_response = ""
    citations = []

    try:
        print(f"🔄 Starting to stream response")

        for event in response['completion']:
            if 'chunk' in event:
                chunk = event['chunk']
                if 'bytes' in chunk:
                    chunk_text = chunk['bytes'].decode('utf-8')
                    full_response += chunk_text
                    print(f"📨 Streaming chunk ({len(chunk_text)} chars)")

                    # Yield SSE formatted chunk
                    chunk_data = json.dumps({'type': 'chunk', 'chunk': chunk_text})
                    yield f"data: {chunk_data}\n\n"

            # Extract citations
            if 'trace' in event:
                trace = event['trace'].get('trace', {})
                if 'orchestrationTrace' in trace:
                    orch_trace = trace['orchestrationTrace']
                    if 'observation' in orch_trace:
                        observation = orch_trace['observation']
                        if 'knowledgeBaseLookupOutput' in observation:
                            kb_output = observation['knowledgeBaseLookupOutput']
                            retrieved_refs = kb_output.get('retrievedReferences', [])
                            for ref in retrieved_refs:
                                location = ref.get('location', {})
                                s3_location = location.get('s3Location', {})
                                uri = s3_location.get('uri', '')
                                if uri and uri not in [c.get('uri') for c in citations]:
                                    citations.append({
                                        'uri': uri,
                                        'content': ref.get('content', {}).get('text', '')[:200]
                                    })

        print(f"✅ Streaming complete, {len(citations)} citations found")

        # Send final message with citations
        final_data = json.dumps({
            'type': 'complete',
            'responsetext': full_response,
            'citations': citations
        })
        yield f"data: {final_data}\n\n"

        # Log the interaction asynchronously
        try:
            lambda_client.invoke(
                FunctionName=LOG_CLASSIFIER_FN_NAME,
                InvocationType='Event',
                Payload=json.dumps({
                    'querytext': query,
                    'responsetext': full_response,
                    'session_id': session_id,
                    'user_role': user_role,
                    'timestamp': datetime.now().isoformat()
                })
            )
        except Exception as log_error:
            print(f"⚠️ Logging error: {str(log_error)}")

    except Exception as e:
        print(f"❌ Stream error: {str(e)}")
        import traceback
        traceback.print_exc()
        error_data = json.dumps({'type': 'error', 'message': str(e)})
        yield f"data: {error_data}\n\n"
