import AuthProfile from '../authentication/authProfile';

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    console.log(message);
    if (message.action === 'authenticate') {
        AuthProfile.getAuthProfile().then((data) => sendResponse(data));
    }

    if (message.action === 'translate') {
        sendResponse('translated');
    }
    return true;
});
