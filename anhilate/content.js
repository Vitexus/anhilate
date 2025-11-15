// Ensure the content script is injected only once.
if (typeof window.anhilate === 'undefined') {
  window.anhilate = true;

  // Dynamically inject the selector script and the implosion CSS.
  const selectorScript = document.createElement('script');
  selectorScript.src = browser.runtime.getURL('selector.js');
  selectorScript.id = 'anhilate-selector-script';
  document.head.appendChild(selectorScript);

  const implosionCss = document.createElement('link');
  implosionCss.rel = 'stylesheet';
  implosionCss.href = browser.runtime.getURL('implosion.css');
  implosionCss.id = 'anhilate-implosion-css';
  document.head.appendChild(implosionCss);

  // Listen for deactivation messages from the background script
  browser.runtime.onMessage.addListener(message => {
    if (message.action === 'deactivate') {
      // Dispatch an event to notify the page script (selector.js) to stop.
      document.dispatchEvent(new CustomEvent('anhilate-deactivate'));
    }
  });

  // Listen for the deactivation confirmation event from the page script
  document.addEventListener('anhilate-deactivated-from-page', () => {
    // Now that we are in the content script context, we can safely call the browser API.
    browser.runtime.sendMessage({ action: "deactivated" });
  });
}
