import { COGNITO_CONFIG } from './constants';

const cognitoConfig = {
  Auth: {
    Cognito: {
      userPoolId: COGNITO_CONFIG.userPoolId,
      userPoolClientId: COGNITO_CONFIG.userPoolWebClientId,
      region: COGNITO_CONFIG.region
    }
  }
};

export default cognitoConfig;
