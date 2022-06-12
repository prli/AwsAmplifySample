import { Amplify, Auth } from 'aws-amplify';
import * as constants from '../utils/constants';
import launchWebAuthFlow from './authentication';
import {
  CognitoIdToken,
  CognitoAccessToken,
  CognitoRefreshToken,
  CognitoUserSession,
  CognitoUser,
  CognitoUserPool,
} from 'amazon-cognito-identity-js';
import $ from 'jquery';

Amplify.configure(constants.AMPLIFY_CONFIG);

/*
 * Authentication profile that stores authenticated user session.
 * If there is no authenticated user session, launch chrome extension web authentication flow
 */
export class AuthProfile {
  static authProfile = null;

  static async authenticate() {
    try {
      this.authProfile = await Auth.currentAuthenticatedUser();
      // await Auth.signOut();
    } catch (err) {
      return launchWebAuthFlow().then((data) => {
        let cognitoIdToken = new CognitoIdToken({
          IdToken: data.id_token,
        });
        let cognitoAccessToken = new CognitoAccessToken({
          AccessToken: data.access_token,
        });
        let cognitoRefreshToken = new CognitoRefreshToken({
          RefreshToken: data.refresh_token,
        });
        const sessionData = {
          IdToken: cognitoIdToken,
          AccessToken: cognitoAccessToken,
          RefreshToken: cognitoRefreshToken,
        };

        AuthProfile.isAuthorized(cognitoIdToken.getJwtToken())
          .then((value) => {
            // Create the session
            let userSession = new CognitoUserSession(sessionData);
            const userData = {
              Username: userSession.getIdToken().payload['cognito:username'],
              Pool: new CognitoUserPool({
                UserPoolId: constants.COGNITO_POOL_ID,
                ClientId: constants.COGNITO_CLIENT_ID,
              }),
            };

            // Make a new cognito user
            const cognitoUser = new CognitoUser(userData);
            // Attach the session to the user
            cognitoUser.setSignInUserSession(userSession);
            //Now the session is stored; amplify framework will take over from here
          },
            (reason) => {
              throw new Error('not authorized'); // Error!
            }
          );
      });
    }
  }

  // Return the current authenticated user, or null
  static async getAuthProfile() {
    try {
      this.authProfile = await Auth.currentAuthenticatedUser();
      return this.authProfile;
    } catch (err) { }
  }

  // Return the JWT token associated with the user
  static isAuthorized(token) {
    var settings = {
      url: constants.API_ENDPOINT + '/authorize',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    };

    return new Promise((resolve, reject) => {
      $.ajax(settings)
        .done(function (data) {
          console.log('authorization succeeded');
          resolve(true);
        })
        .fail(function (err) {
          console.log('authorization failed');
          reject(false);
        });
    });
  }

  // Return the JWT token associated with the user
  static async getJwtToken() {
    this.authProfile = await Auth.currentAuthenticatedUser();
    if (this.authProfile && this.authProfile.getSignInUserSession()) {
      const session = this.authProfile.getSignInUserSession();
      const idToken = session.getIdToken();
      return idToken.jwtToken;
    }
    return null;
  }
}
export default AuthProfile;
