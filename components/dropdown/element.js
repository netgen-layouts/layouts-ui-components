import {LitElement, html} from 'lit';
import {
  autoUpdate,
  arrow,
  computePosition,
  flip,
  offset,
  shift,
  size,
} from '@floating-ui/dom';
import style from './style.js';

export default class Dropdown extends LitElement {
  static styles = [style];

  static properties = {
    open: {type: Boolean, reflect: true},
    placement: {type: String},
    offsetVertical: {type: Number},
    offsetHorizontal: {type: Number},
    caret: {type: Boolean},
  };

  constructor() {
    super();
    this.open = false;
    this.placement = 'bottom-start';
    this.offsetVertical = 0;
    this.offsetHorizontal = 0;
    this.containingElement = null;
    this.positionerCleanup = undefined;
    this.caret = false;
  }

  connectedCallback() {
    super.connectedCallback();
    this.handleDocumentKeyDown = this.handleDocumentKeyDown.bind(this);
    this.handleDocumentClick = this.handleDocumentClick.bind(this);

    this.containingElement = this;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeOpenListeners();
  }

  get trigger() {
    return this.renderRoot.querySelector('.dropdown-trigger');
  }

  get triggerElement() {
    const slot = this.trigger.querySelector('slot');
    return slot.assignedElements({flatten: true})[0];
  }

  get dropdownContent() {
    return this.renderRoot.querySelector('.dropdown-content');
  }

  get dropdownContentElement() {
    const slot = this.dropdownContent.querySelector('slot');
    return slot.assignedElements({flatten: true})[0];
  }

  get tabbableElements() {
    const tabbleMenuItems = this.dropdownContentElement.querySelectorAll(
      'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])'
    );

    const filteredMenuItems = Array.from(tabbleMenuItems).filter(
      (element) =>
        !element.hasAttribute('disabled') &&
        !element.getAttribute('aria-hidden')
    );

    return filteredMenuItems;
  }

  get caretElement() {
    return this.dropdownContent.querySelector('.caret');
  }

  handleTriggerSlotChange() {
    this.updateAccessibleTrigger();
  }

  updateAccessibleTrigger() {
    const {triggerElement} = this;

    if (triggerElement.tagName.toLowerCase() === 'a') {
      triggerElement.setAttribute('role', 'button');
    }
    triggerElement.setAttribute('aria-haspopup', true);
    triggerElement.setAttribute('aria-expanded', this.open);
  }

  closeAndRefocus() {
    this.open = false;
    this.triggerElement.focus();
    this.handleOpenChange();
  }

  handleDocumentKeyDown(event) {
    if (event.key === 'Escape') {
      this.closeAndRefocus();
    } else if (
      ['Tab', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)
    ) {
      event.preventDefault();

      let menuIndex = this.tabbableElements.findIndex(
        (item) => item === event.target
      );

      if (
        (event.key === 'ArrowUp' || (event.shiftKey && event.key === 'Tab')) &&
        menuIndex > 0
      ) {
        menuIndex--;
      }

      if (
        (event.key === 'ArrowDown' ||
          (!event.shiftKey && event.key === 'Tab')) &&
        menuIndex < this.tabbableElements.length - 1
      ) {
        menuIndex++;
      }

      if (event.key === 'End') {
        menuIndex = this.tabbableElements.length - 1;
      }

      if (event.key === 'Home') {
        menuIndex = 0;
      }

      this.tabbableElements[menuIndex].focus();
    } else if (
      event.key === 'Enter' &&
      this.open &&
      this.dropdownContent.contains(event.target)
    ) {
      this.closeAndRefocus();
    }
  }

  handleDocumentClick(event) {
    const path = event.composedPath();
    const targetTagName = event.target.tagName.toLowerCase();

    // Close on click outside of the dropdown
    if (this.containingElement && !path.includes(this.containingElement)) {
      this.open = false;
    }

    // Close dropdown if click event is on dropdown content element that is anchor or button element
    if (
      this.open &&
      path.includes(this.dropdownContent) &&
      ['a', 'button'].includes(targetTagName)
    ) {
      this.closeAndRefocus();
    }
  }

  addOpenListeners() {
    document.addEventListener('keydown', this.handleDocumentKeyDown);
    document.addEventListener('click', this.handleDocumentClick);
  }

  removeOpenListeners() {
    document.removeEventListener('keydown', this.handleDocumentKeyDown);
    document.removeEventListener('click', this.handleDocumentClick);
  }

  handleTriggerClick() {
    this.open = !this.open;

    this.handleOpenChange();
  }

  handleTriggerKeyDown(event) {
    if (event.key === 'Escape') {
      this.closeAndRefocus();
    } else if ([' ', 'Enter'].includes(event.key)) {
      // When spacebar/enter is pressed, show the panel but don't focus on the menu. This let's the user press the same
      // key again to hide the menu in case they don't want to make a selection.
      event.preventDefault();
      this.handleTriggerClick();
    }
  }

  handleTriggerKeyUp(event) {
    // Prevent space from triggering a click event in Firefox
    if (event.key === ' ') {
      event.preventDefault();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.handleTriggerClick();
    }
  }

  setDropdownContentPosition(x, y) {
    Object.assign(this.dropdownContent.style, {
      left: `${x}px`,
      top: `${y}px`,
    });
  }

  setCaretPosition(dropdownPlacement, middlewareData) {
    const {x: arrowX, y: arrowY} = middlewareData.arrow;
    const staticSide = {
      top: 'bottom',
      right: 'left',
      bottom: 'top',
      left: 'right',
    }[dropdownPlacement.split('-')[0]];

    const arrowXcorrection = staticSide === 'bottom' ? arrowX + 9 : arrowX - 9;

    Object.assign(this.caretElement.style, {
      left:
        arrowX != null
          ? `${this.offsetHorizontal ? arrowX : arrowXcorrection}px`
          : '',
      top: arrowY != null ? `${arrowY}px` : '',
      right: '',
      bottom: '',
      [staticSide]: '-9px',
      transform: staticSide === 'bottom' ? 'rotate(180deg)' : 'unset',
    });
  }

  updatePositioner() {
    if (!this.open || !this.trigger || !this.dropdownContent) return;

    const middlewareFunctions = [
      offset({mainAxis: this.offsetVertical, crossAxis: this.offsetHorizontal}),
      flip(),
      shift({padding: 16}),
      size({
        apply: ({width, height}) => {
          Object.assign(this.dropdownContent.style, {
            maxWidth: `${width}px`,
            maxHeight: `${height}px`,
            overflow:
              this.dropdownContentElement.offsetHeight > height
                ? 'auto'
                : 'unset',
          });
        },
        padding: 16,
      }),
    ];

    if (this.caret) {
      middlewareFunctions.push(
        arrow({
          element: this.caretElement,
          // This describes the padding between the arrow and the edges of the floating element.
          // If your floating element has border-radius, this will prevent it from overflowing the corners.
          padding: 4,
        })
      );
    }

    computePosition(this.trigger, this.dropdownContent, {
      placement: this.placement,
      middleware: middlewareFunctions,
    }).then(({x, y, placement, middlewareData}) => {
      this.setDropdownContentPosition(x, y);

      if (this.caret) {
        this.setCaretPosition(placement, middlewareData);
      }
    });
  }

  startPositioner() {
    this.stopPositioner();
    this.updatePositioner();
    this.positionerCleanup = autoUpdate(
      this.trigger,
      this.dropdownContent,
      this.updatePositioner.bind(this)
    );
  }

  stopPositioner() {
    if (this.positionerCleanup) {
      this.positionerCleanup();
      this.positionerCleanup = undefined;
      this.dropdownContent.removeAttribute('data-placement');
    }
  }

  updated(changedProperties) {
    if (changedProperties.has('open')) {
      this.handleOpenChange();
    }
  }

  handleOpenChange() {
    this.updateAccessibleTrigger();

    if (this.open) {
      this.addOpenListeners();
      this.startPositioner();
    } else {
      this.removeOpenListeners();
      this.stopPositioner();
    }
  }

  renderCaret() {
    return html`<span class="caret"></span>`;
  }

  render() {
    return html`
      <div class="dropdown">
        <span
          class="dropdown-trigger"
          @click=${this.handleTriggerClick}
          @keydown=${this.handleTriggerKeyDown}
          @keyup=${this.handleTriggerKeyUp}
        >
          <slot
            name="trigger"
            @slotchange=${this.handleTriggerSlotChange}
          ></slot>
        </span>

        <div class="dropdown-content" aria-hidden="${!this.open}">
          ${this.caret ? this.renderCaret() : null}
          <slot></slot>
        </div>
      </div>
    `;
  }
}

customElements.get('bu-dropdown') ||
  customElements.define('bu-dropdown', Dropdown);
