import json
import boto3
import os
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

                for event in response['completion']:
                    if 'chunk' in event:
                        chunk = event['chunk']
                        if 'bytes' in chunk:
                            full_response += chunk['bytes'].decode('utf-8')

                        # Extract citations if present
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
                'responsetext': full_response,
                'citations': citations if citations else []
                 }

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