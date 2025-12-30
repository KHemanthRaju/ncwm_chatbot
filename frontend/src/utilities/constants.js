// API Endpoints Configuration
// These values are obtained from the deployed AWS infrastructure

// WebSocket API endpoint for real-time chat communication
export const WEBSOCKET_API = 'wss://t8lev2pyz0.execute-api.us-west-2.amazonaws.com/production';

// REST API endpoint for admin operations (file management, analytics)
export const DOCUMENTS_API = 'https://tuvw7wkl4l.execute-api.us-west-2.amazonaws.com/prod/';

// Cognito configuration for authentication
export const COGNITO_CONFIG = {
  userPoolId: 'us-west-2_F4rwE0BpC',
  userPoolWebClientId: '42vl26qpi5kkch11ejg1747mj8',
  region: 'us-west-2'
};

// Feature flags
export const ALLOW_FILE_UPLOAD = true;
export const ALLOW_MARKDOWN_BOT = true;
