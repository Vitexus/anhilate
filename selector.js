if (!window.anhilateSelectorInstance) {
  /**
   * @class ElementSelector
   *
   * This class handles the element selection mode of the extension. It creates an
   * overlay to highlight elements, listens for user input (mouse clicks and key
   * presses), and triggers the removal of the selected element.
   */
  class ElementSelector {
    constructor() {
      this.highlightedElement = null;

      // Create the overlay element for highlighting
      this.overlay = document.createElement('div');
      this.overlay.style.position = 'absolute';
      this.overlay.style.backgroundColor = 'rgba(0, 123, 255, 0.4)';
      this.overlay.style.border = '1px solid #007bff';
      this.overlay.style.zIndex = '999999';
      this.overlay.style.pointerEvents = 'none'; // Make sure it doesn't interfere with mouse events

      this.isSelectionActive = false;

      // Bind methods to the instance to ensure `this` is correct when they are called as event listeners
      this.handleMouseMove = this.handleMouseMove.bind(this);
      this.handleKeyDown = this.handleKeyDown.bind(this);
      this.handleClick = this.handleClick.bind(this);
      this.handleDeactivateEvent = this.handleDeactivateEvent.bind(this);
    }

    /**
     * Starts the element selection mode.
     * This adds the overlay to the page, changes the cursor, and adds event listeners.
     */
    start() {
      if (this.isSelectionActive) return;
      this.isSelectionActive = true;

      document.body.appendChild(this.overlay);
      document.body.style.cursor = 'crosshair';

      // Add event listeners for user interactions
      document.addEventListener('mousemove', this.handleMouseMove);
      document.addEventListener('keydown', this.handleKeyDown);
      document.addEventListener('click', this.handleClick, true); // Use capturing to prevent clicks on page elements
      document.addEventListener('anhilate-deactivate', this.handleDeactivateEvent);
    }

    /**
     * Stops the element selection mode.
     * This removes the overlay, resets the cursor, removes event listeners, and removes the injected scripts and styles.
     */
    stop() {
      if (!this.isSelectionActive) return;
      this.isSelectionActive = false;

      document.body.style.cursor = 'default';
      if (this.overlay.parentNode) {
        this.overlay.parentNode.removeChild(this.overlay);
      }

      // Remove event listeners
      document.removeEventListener('mousemove', this.handleMouseMove);
      document.removeEventListener('keydown', this.handleKeyDown);
      document.removeEventListener('click', this.handleClick, true);
      document.removeEventListener('anhilate-deactivate', this.handleDeactivateEvent);

      this.highlightedElement = null;

      // Remove the injected script and stylesheet
      const selectorScript = document.getElementById('anhilate-selector-script');
      if (selectorScript) selectorScript.remove();
      const implosionCss = document.getElementById('anhilate-implosion-css');
      if (implosionCss) implosionCss.remove();


      // Notify the content script that deactivation is complete, so it can inform the background script.
      document.dispatchEvent(new CustomEvent('anhilate-deactivated-from-page'));

      // Clean up the global instance to allow for re-activation
      delete window.anhilateSelectorInstance;
    }

    /**
     * Handles the custom deactivation event.
     */
    handleDeactivateEvent() {
      this.stop();
    }


    /**
     * Handles the mouse move event to highlight the element under the cursor.
     * @param {MouseEvent} e - The mouse move event.
     */
    handleMouseMove(e) {
      // Hide the overlay temporarily to get the element underneath
      this.overlay.style.display = 'none';
      const element = document.elementFromPoint(e.clientX, e.clientY);
      this.overlay.style.display = 'block';

      // Check if the element is valid and not the overlay itself
      if (element && element !== this.highlightedElement && element !== this.overlay) {
        this.highlightedElement = element;
        const rect = element.getBoundingClientRect();

        // Position and size the overlay to match the highlighted element
        this.overlay.style.width = `${rect.width}px`;
        this.overlay.style.height = `${rect.height}px`;
        this.overlay.style.top = `${rect.top + window.scrollY}px`;
        this.overlay.style.left = `${rect.left + window.scrollX}px`;
      }
    }

    /**
     * Handles key down events.
     * Listens for "Escape" to cancel selection and "Enter" to remove the element.
     * @param {KeyboardEvent} e - The key down event.
     */
    handleKeyDown(e) {
      if (e.key === 'Escape') {
        this.stop();
      }
      if (e.key === 'Enter') {
          if(this.highlightedElement) {
              this.removeElement(this.highlightedElement);
              this.stop();
          }
      }
    }

    /**
     * Handles the click event to select and remove an element.
     * @param {MouseEvent} e - The click event.
     */
    handleClick(e) {
      // Prevent the click from triggering any actions on the page
      e.preventDefault();
      e.stopPropagation();

      if (this.highlightedElement) {
        this.removeElement(this.highlightedElement);
      }
      this.stop();
    }

    /**
     * Removes the selected element from the DOM after an implosion animation.
     * @param {HTMLElement} element - The element to remove.
     */
    removeElement(element) {
      // Add the 'implode' class to trigger the CSS animation
      element.classList.add('implode');

      // Remove the element from the DOM after the animation finishes
      element.addEventListener('animationend', () => {
        element.remove();
      });
    }
  }

  // Create an instance of the ElementSelector and start the selection mode.
  window.anhilateSelectorInstance = new ElementSelector();
  window.anhilateSelectorInstance.start();
}
