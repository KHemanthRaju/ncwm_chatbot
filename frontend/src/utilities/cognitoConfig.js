import { CognitoUserPool } from 'amazon-cognito-identity-js';
import { COGNITO_CONFIG } from './constants';

const poolData = {
  UserPoolId: COGNITO_CONFIG.userPoolId,
  ClientId: COGNITO_CONFIG.userPoolWebClientId
};

const UserPool = new CognitoUserPool(poolData);

export default UserPool;
