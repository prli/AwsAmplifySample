import $ from 'jquery';
import hoverButton from '../../html/hoverButton.html';
import '../../scss/RTExtension.scss';
import { RT_TRANSLATE_HOVER_ID } from '../utils/constants';
import hoverButtonImage from '../../img/ditto.png';

import 'bootstrap/js/dist/popover'; //depends on exports-loader, @poperjs/core and bootstrap tooltip

// Listening for Mouseup event to capture highlighted text and display hover button
window.addEventListener('mouseup', (event) => {
  if (event.isTrusted) {
    var selectedText = window.getSelection().toString();

    if (selectedText.trim() !== '') {
      chrome.runtime.sendMessage({ action: 'authenticate' }, (response) => {
        console.log(response)
        if (response) {
          insertHoverButton(event, selectedText);
        }
      });
    }
  }
});

// Removes either hovering button or modal and also clears the selected text on webpage when clicked on webpage
window.addEventListener('mousedown', (event) => {
  if (event.isTrusted) {
    removeBubble();
  }
});

// Translate the active webpage when user clicks translate webpage button in popup.js
chrome.runtime.onMessage.addListener(gotMessage);
function gotMessage(message, sender, sendResponse) {
  return true;
}

// Function to stop the propogation of events to improve the user interaction
function stopPropagation(event) {
  event.stopPropagation();
}

// Function to insert hover button on the webpage upon text selection
function insertHoverButton(event, text) {
  //append hover DOM elements into webpage
  $('body').append(hoverButton);

  $('#translateHoverButton').css({
    top: event.pageY + 5 + 'px',
    left: event.pageX + 5 + 'px',
  });

  $('#hoverButtonImage').attr('src', chrome.runtime.getURL(hoverButtonImage));

  $('#hoverButtonAnchor')
    .mousedown(stopPropagation)
    .mouseup(stopPropagation)
    .click(function () {
      hoverButtonOnClick(text);
    });

  $('#translateHoverButton').show();
}

// Function to handle click action of hover button; launch the web auth flow if the user has not logged in
function hoverButtonOnClick(text) {
  var translateRequest = { text: text };
  chrome.runtime.sendMessage(
    { action: 'translate', content: translateRequest },
    function (response) {
      console.log(response)
      $('#translateHoverButton').remove();
      if (response) {
        insertHoverBubble(response);
      } else {
        insertHoverBubble("no response");
      }
    }
  );
}

// Function to insert modal on the webpage upon hover button click
function insertHoverBubble(response) {
  $('body').append(
    `<div class="rtHover" id="${RT_TRANSLATE_HOVER_ID}"><div id="translateAnchor"></div></div>`
  );

  let anchor = window.getSelection().getRangeAt(0).getBoundingClientRect();
  var relative = document.body.parentNode.getBoundingClientRect();
  $('#translateAnchor').css({
    top: anchor.top - relative.top, //this will will align the top edges together
    left: anchor.left - relative.left, //this will align the left edges together
    width: anchor.width,
    height: anchor.height,
    position: 'absolute',
  });

  $('#translateAnchor')
    .popover({
      placement: 'auto',
      container: `#${RT_TRANSLATE_HOVER_ID}`,
      content: response,
    })
    .popover('show');

  $('#postTranslateBubble')
    .mousedown(stopPropagation)
    .mouseup(stopPropagation)
    .show();
}

// Function to remove either hover button or modal from webpage
function removeBubble() {
  $('#translateHoverButton').remove();
  $('#postTranslateBubble').remove();
  $('#translateAnchor').popover('dispose');
  $(`#${RT_TRANSLATE_HOVER_ID}`).remove();
}