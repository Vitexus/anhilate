/**
 * A single, reusable function to toggle the activation state of the extension.
 * This function is called by all activation methods (toolbar, shortcut, context menu).
 * @param {object} tab - The tab to toggle the activation state for.
 */
function unifiedToggleActivation(tab) {
  if (!tab || !tab.id) {
    return;
  }
  browser.storage.local.get('activeTabs').then(result => {
    let activeTabs = result.activeTabs || {};
    if (activeTabs[tab.id]) {
      // Deactivate by sending a message to the content script
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

// 1. Toolbar button activation
browser.browserAction.onClicked.addListener(unifiedToggleActivation);

// 2. Keyboard shortcut activation
browser.commands.onCommand.addListener((command) => {
  if (command === "toggle-anhilate") {
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      if (tabs[0]) {
        unifiedToggleActivation(tabs[0]);
      }
    });
  }
});

// 3. Context menu activation
browser.contextMenus.create({
  id: "anhilate-context-menu",
  title: "Anhilate",
  contexts: ["all"]
});

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "anhilate-context-menu") {
    unifiedToggleActivation(tab);
  }
});

// Listen for messages from the content script to confirm deactivation
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
