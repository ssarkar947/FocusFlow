/// <reference types="chrome" />

// Content script running in the context of the FocusFlow web app page.
// Acts as a bridge between the Web App's state store and the Chrome Extension's background page.

// 1. Listen for state change events from the Web App and send them to the extension background
window.addEventListener('FOCUSFLOW_STATE_CHANGED', (event: any) => {
  if (event.detail) {
    try {
      chrome.runtime.sendMessage({
        action: 'STATE_CHANGED',
        state: event.detail,
      });
    } catch (e) {
      // Extension context might be invalidated if updated, silent fail
      console.log('FocusFlow Sync: Bridge connection warning', e);
    }
  }
});

// 2. Listen for messages from the extension background and dispatch them to the Web App page window
chrome.runtime.onMessage.addListener((message: any) => {
  if (message.action === 'STATE_UPDATE_FROM_EXTENSION' && message.state) {
    const event = new CustomEvent('FOCUSFLOW_STATE_UPDATE_FROM_EXTENSION', {
      detail: message.state,
    });
    window.dispatchEvent(event);
  }
});
export {};
