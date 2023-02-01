import {LitElement, html} from 'lit';
import {classMap} from 'lit/directives/class-map.js';
import style from './style.js';

export default class Placeholder extends LitElement {
  static styles = [style];

  static properties = {
    isEmpty: {type: Boolean},
    isMarked: {type: Boolean, state: true},
    identifier: {type: String},
    isContainerEmpty: {type: Boolean, default: false},
  };

  constructor() {
    super();
  }

  get core() {
    return window.parent.Core;
  }

  get layout() {
    return this.core.g.layout;
  }

  get model() {
    console.debug(this.layout.blocks.findWhere({
      id: this.closestBlockId,
    }))
    
    return (this.cached_model ||= this.layout.blocks.findWhere({
      id: this.closestBlockId,
    }));
  }

  get closestBlockId() {
    const closestBlock = this.closest('ngl-block');
    const closestBlockId = closestBlock?.getAttribute('blockid');

    return closestBlockId
  }

  get isInLinkedZone() {
    return this.model.zone()?.is_linked();
  }

  get slottedChildren() {
    const slot = this.shadowRoot.querySelector('slot');
    return slot.assignedElements({flatten: true});
  }

  connectedCallback() {
    super.connectedCallback();
  }

  renderAddButton() {

    return html`
      <button class="add-btn" @click=${this.handleAddButtonClick} >
        <svg
          width="25"
          height="22"
          viewBox="0 0 25 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="6.5" y="11" width="12" height="2" fill="#E0C8FF" />
          <rect
            x="11.5"
            y="18"
            width="12"
            height="2"
            transform="rotate(-90 11.5 18)"
            fill="#E0C8FF"
          />
        </svg>
        <span>Add</span>
      </button>
    `;
  }

  handleAddButtonClick(e) {
    const blockPicker = document.querySelector('ngl-block-picker');
    const parentBlock = this.slottedChildren[0].closest('ngl-block');

    blockPicker.blockId = parentBlock.getAttribute('blockid')
    blockPicker.isActive = true
    blockPicker.placeholderIdentifier = this.identifier;
  }

  render() {
    const classes = {
      is_empty: this.isEmpty,
      is_marked: this.isMarked,
      is_container_empty: this.isContainerEmpty,
      is_in_linked_zone: this.isInLinkedZone,
    };

    return html`
      <main class=${classMap(classes)}>
        ${this.renderAddButton()}
        <slot></slot>
      </main>

    `;
  }
}

customElements.get('ngl-placeholder') || customElements.define('ngl-placeholder', Placeholder);
