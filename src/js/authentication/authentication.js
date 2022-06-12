import $ from 'jquery';
import * as constants from '../utils/constants';
import { chromeStorageGetLocalValuePromise } from '../utils/util';
import * as Authentication from './authentication';
import * as crypto from 'crypto';

export default function launchWebAuthFlow() {
  var authenticationUrl = getAuthenticationUrl();
  return new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow(
      { url: authenticationUrl, interactive: true },
      function (callBackUrl) {
        if (!callBackUrl) {
          console.log('User authentication failed. Please try again.');
          //Render error message of launch web auth flow in popup.html
          if (chrome.runtime.lastError) {
            console.log(
              'Error at authentication.js: ' + chrome.runtime.lastError.message
            );
            notifyAuthenticationError(chrome.runtime.lastError.message);
            reject(chrome.runtime.lastError.message);
          } else {
            notifyAuthenticationError('User authentication failed.');
            reject('User authentication failed.');
          }
        }

        var url = new URL(callBackUrl);

        chromeStorageGetLocalValuePromise('stateToken').then(function (
          localStateToken
        ) {
          var stateToken = url.searchParams.get('state');
          if (!stateToken || localStateToken != stateToken) {
            let errorMsg = 'CSRF attacks detected. Reject authentication.';
            console.log(errorMsg);
            notifyAuthenticationError(errorMsg);
            reject(errorMsg);
          }
          var authCode = url.searchParams.get('code');
          var requestBody = getExchangeTokenBody(authCode);

          var settings = {
            url: constants.COGNITO_AUTH_ENDPOINT + '/token',
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            data: requestBody,
          };
          $.ajax(settings)
            .done(function (data) {
              resolve(data);
            })
            .fail(function (err) {
              console.log('exchange token failed');
              notifyAuthenticationError('exchange token failed');
              reject(err);
            });
        });
      }
    );
  });
}

function getAuthenticationUrl() {
  var stateToken = crypto.randomBytes(64).toString('hex');
  chrome.storage.local.set({ stateToken: stateToken });
  var url =
    constants.COGNITO_AUTH_ENDPOINT +
    '/authorize?' +
    $.param({
      redirect_uri: constants.COGNITO_REDIRECT_URL,
      response_type: constants.COGNITO_RESPONSE_TYPE,
      client_id: constants.COGNITO_CLIENT_ID,
      state: stateToken, // Pass state token to prevent CSRF attacks: https://auth0.com/docs/protocols/state-parameters
    });
  return url;
}

function getExchangeTokenBody(authCode) {
  return $.param({
    redirect_uri: constants.COGNITO_REDIRECT_URL,
    grant_type: constants.COGNITO_GRANT_TYPE,
    client_id: constants.COGNITO_CLIENT_ID,
    code: authCode,
  });
}

// Function to render error message of launch web auth flow in popup.html
export function notifyAuthenticationError(errorMessage) {
  if (!Authentication.isPopupOpened()) {
    //i.e. authtentication called from background.js
    return;
  }

  $('body').width('500px');
  $('#postTranslate').addClass('d-none');

  // Updating HTML elements with relevant error messages
  $('#errorText').text('Authentication Error');
  $('#errorDesc').html(
    'You are seeing this error because of an authentication problem or failure.' +
    'Details: Web authentication flow throws run time error - ' +
    errorMessage
  );

  // Hiding and displaying relevant HTML elements
  $('#loadingText').addClass('d-none');
  $('#errorWrapper').removeClass('d-none');
}

export function isPopupOpened() {
  var popupView = chrome.extension.getViews({ type: 'popup' });
  if (popupView === undefined || popupView.length == 0) {
    return false;
  }
  return true;
}
