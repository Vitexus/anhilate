/**
 * Toggles the activation state of the extension for a given tab.
 * When activated, the content script is injected into the page.
 * When deactivated, a message is sent to the content script to deactivate.
 * @param {object} tab - The tab to toggle the activation state for.
 */
function toggleActivation(tab) {
  if (!tab || !tab.id) {
    return;
  }
  browser.storage.local.get('activeTabs').then(result => {
    let activeTabs = result.activeTabs || {};
    if (activeTabs[tab.id]) {
      // Deactivate by sending a message
      browser.tabs.sendMessage(tab.id, { action: "deactivate" });
    } else {
      // Activate
      activeTabs[tab.id] = true;
      browser.storage.local.set({ activeTabs: activeTabs }).then(() => {
        browser.tabs.executeScript(tab.id, { file: "content.js" });
      });
    }
  });
}

// Listen for a click on the browser action
browser.browserAction.onClicked.addListener(toggleActivation);

// Listen for messages from the content script
browser.runtime.onMessage.addListener((message, sender) => {
  if (message.action === "deactivated") {
    browser.storage.local.get('activeTabs').then(result => {
      let activeTabs = result.activeTabs || {};
      if (sender.tab && activeTabs[sender.tab.id]) {
        delete activeTabs[sender.tab.id];
        browser.storage.local.set({ activeTabs: activeTabs });
      }
    });
  }
});
