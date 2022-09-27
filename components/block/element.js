import {LitElement, html} from 'lit';
import style from './style.js';

function isBlock(element) {
  return element instanceof Block;
}

export default class Block extends LitElement {
  static styles = [style];

  static properties = {
    blockId: {type: String, attribute: 'data-ngl-block-id'},
  };

  constructor() {
    super();

    this.isSaveListenerAttached = false;
  }

  getBlock() {
    return window.parent.Core.g.layout.blocks.findWhere({id: this.blockId});
  }

  renderMenu() {
    const block = this.getBlock();
    const isInLinkedZone = block.zone().is_linked();

    if (isInLinkedZone) {
      return html`
        <div class="edit-menu">
          <button @click=${this.refresh}>Refresh</button>
        </div>
      `;
    } else {
      const parentId = block.attributes.parent_block_id;
      const parent = document.querySelector(
        `ngl-block[data-ngl-block-id="${parentId}"]`
      );

      if (parent && isBlock(parent)) {
        return html`
          <div class="edit-menu">
            <button @click=${parent.edit.bind(parent)}>Edit container</button>
            <button @click=${parent.refresh.bind(parent)}>
              Refresh container
            </button>
            <button @click=${this.edit}>Edit</button>
            <button @click=${this.refresh}>Refresh</button>
          </div>
        `;
      } else {
        return html`
          <div class="edit-menu">
            <button @click=${this.edit}>Edit</button>
            <button @click=${this.refresh}>Refresh</button>
          </div>
        `;
      }
    }
  }

  edit() {
    const block = this.getBlock();
    block.trigger('edit');

    if (!this.isSaveListenerAttached) {
      block.on('sidebar_save:success', () => {
        this.refresh();
      });
      this.isSaveListenerAttached = true;
    }
  }

  async fetch() {
    const resp = await fetch(window.location.href);
    return resp.text();
  }

  get main() {
    return this.shadowRoot.querySelector('main');
  }

  async refresh() {
    this.main.classList.add('loading');
    let html = await this.fetch();
    this.main.classList.remove('loading');
    const template = document.createElement('template');
    template.innerHTML = html;
    const currentBlockHtml = template.content.querySelector(
      `ngl-block[data-ngl-block-id="${this.blockId}"]`
    );

    this.innerHTML = currentBlockHtml.innerHTML;

    this.dispatchEvent(
      new Event('ngl:refresh', {bubbles: true, composed: true})
    );
  }

  render() {
    return html`
      <main>
        ${this.renderMenu()}
        <slot></slot>
      </main>
    `;
  }
}

customElements.get('ngl-block') || customElements.define('ngl-block', Block);
