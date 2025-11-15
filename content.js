/**
 * This content script is responsible for managing the activation and deactivation
 * of the element selector. It is injected into all pages at document_idle, and
 * waits for messages from the background script to start or stop its functionality.
 */

// A state flag to ensure that we don't activate or deactivate unnecessarily.
let isAnhilating = false;

/**
 * Starts the element selection process.
 * This function will activate the ElementSelector, which is defined in selector.js.
 * It ensures that the selector is not started if it is already active.
 */
function startSelection() {
  if (isAnhilating || !window.anhilateSelectorInstance) {
    return;
  }
  isAnhilating = true;
  window.anhilateSelectorInstance.start();
}

/**
 * Stops the element selection process.
 * This function will deactivate the ElementSelector and notify the background
 * script that it has been stopped.
 */
function stopSelection() {
  if (!isAnhilating || !window.anhilateSelectorInstance) {
    return;
  }
  window.anhilateSelectorInstance.stop(() => {
    isAnhilating = false;
    // Inform the background script that deactivation is complete.
    browser.runtime.sendMessage({ action: "deactivated" });
  });
}

// Listen for messages from the background script to activate or deactivate the selector.
browser.runtime.onMessage.addListener((message) => {
  if (message.action === "activate") {
    startSelection();
  } else if (message.action === "deactivate") {
    stopSelection();
  }
});
