export const COGNITO_REDIRECT_URL = () =>
  'https://' + chrome.runtime.id + '.chromiumapp.org/federate';

export const COGNITO_AUTH_ENDPOINT = process.env.COGNITO_AUTH_ENDPOINT;
export const COGNITO_REGION = process.env.COGNITO_REGION;
export const COGNITO_POOL_ID = process.env.COGNITO_POOL_ID;
export const COGNITO_CLIENT_ID = process.env.COGNITO_CLIENT_ID;
export const COGNITO_DOMAIN = process.env.COGNITO_DOMAIN;
export const COGNITO_SCOPE = ['openid'];
export const COGNITO_RESPONSE_TYPE = 'code';
export const COGNITO_GRANT_TYPE = 'authorization_code';

export const API_ENDPOINT = process.env.API_ENDPOINT;

export const AMPLIFY_CONFIG = {
  Auth: {
    mandatorySignIn: true,
    region: COGNITO_REGION,
    userPoolId: COGNITO_POOL_ID,
    userPoolWebClientId: COGNITO_CLIENT_ID,
  },
  oauth: {
    domain: COGNITO_DOMAIN,
    redirectSignIn: COGNITO_REDIRECT_URL,
    redirectSignOut: COGNITO_REDIRECT_URL,
    scope: COGNITO_SCOPE,
    responseType: COGNITO_RESPONSE_TYPE,
  },
};