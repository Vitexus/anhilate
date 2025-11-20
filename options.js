/**
 * Options page script for Anhilate extension
 */

// Load saved settings
function loadOptions() {
  browser.storage.local.get({
    animationEffect: 'simple' // default value
  }).then(result => {
    document.getElementById('animation-effect').value = result.animationEffect;
  });
}

// Save settings
function saveOptions() {
  const animationEffect = document.getElementById('animation-effect').value;
  
  browser.storage.local.set({
    animationEffect: animationEffect
  }).then(() => {
    // Show save confirmation
    const status = document.getElementById('save-status');
    status.classList.add('success');
    setTimeout(() => {
      status.classList.remove('success');
    }, 2000);
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', loadOptions);
document.getElementById('animation-effect').addEventListener('change', saveOptions);
