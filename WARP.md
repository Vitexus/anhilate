# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Anhilate is a lightweight browser extension (WebExtension) for Firefox, Chrome, and Edge that allows users to visually select and remove HTML elements from webpages. It's built with pure JavaScript and CSS, with no external dependencies.

## Common Commands

### Packaging
```bash
make package
```
Creates a distributable zip file (`../anhilate.zip`) excluding development files (.git, .md, node_modules, test.html, etc.)

### Testing During Development
For Firefox:
```bash
# Navigate to about:debugging in Firefox, then load manifest.json as a temporary add-on
firefox
```

For Chrome/Edge:
```bash
# Navigate to chrome://extensions, enable Developer mode, then load unpacked
google-chrome
```

## Architecture

### Component Structure

The extension follows a standard WebExtension architecture with three main components:

1. **Background Script** (`background.js`)
   - Manages extension state across tabs using `browser.storage.local`
   - Coordinates activation/deactivation through a unified toggle function
   - Handles three activation methods: toolbar button, keyboard shortcut (Ctrl+Shift+X), and context menu
   - Maintains `activeTabs` object to track which tabs have the selector active

2. **Content Scripts** (`content.js` + `selector.js`)
   - Injected into all pages at `document_idle`
   - `content.js`: Acts as a bridge between background script and selector, managing the `isAnhilating` state flag
   - `selector.js`: Contains the `ElementSelector` class that handles the core functionality

3. **ElementSelector Class** (`selector.js`)
   - Single reusable instance stored in `window.anhilateSelectorInstance`
   - Creates an overlay element for highlighting (positioned absolutely with high z-index)
   - Event handlers: `handleMouseMove`, `handleKeyDown`, `handleClick`, `handleDeactivateEvent`
   - Uses capturing phase for click events to prevent page interactions
   - Implements implosion animation via CSS class before element removal

### Message Flow

Activation: Background → Content → ElementSelector.start()
Deactivation: Background → Content → ElementSelector.stop() → Background (confirmation)

### Key Implementation Details

- Uses `browser` namespace for WebExtension APIs (Firefox standard, Chrome compatible with polyfill)
- Overlay positioning accounts for both scroll offsets (`window.scrollY`, `window.scrollX`) and viewport coordinates
- Element selection uses `document.elementFromPoint()` with temporary overlay hiding
- All event listeners are bound to the class instance to maintain correct `this` context
- State management prevents duplicate activation/deactivation

## Extension Manifest

- Uses Manifest V2 format
- Requires `contextMenus` and `storage` permissions
- Content scripts run on `<all_urls>` with `document_idle` timing
- Browser-specific settings for Firefox (gecko) include privacy declarations

## Development Guidelines

### When Modifying the Selector
- Always bind new event handlers in the constructor to preserve `this` context
- Remember to add/remove listeners in both `start()` and `stop()` methods
- Test with both mouse and keyboard interactions (Enter to select, Escape to cancel)
- Consider scroll position when positioning overlays

### When Modifying State Management
- Updates to `activeTabs` must be synced to `browser.storage.local`
- Message passing between scripts should confirm actions (e.g., "deactivated" message)
- Check `sender.tab.id` exists before accessing it in message handlers

### Animation and Styling
- Implosion animation is defined in `implosion.css`
- Uses CSS `animationend` event to trigger DOM removal
- Overlay uses high z-index (999999) but remains non-interactive (`pointerEvents: 'none'`)
