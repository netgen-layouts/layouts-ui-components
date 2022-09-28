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

  get layout() {
    return window.parent.Core.g.layout;
  }

  get model() {
    return (this.cached_model ||= this.layout.blocks.findWhere({
      id: this.blockId,
    }));
  }

  get parentModel() {
    if (this.cached_parent_model !== undefined) return this.cached_parent_model;

    const parentId = this.model.attributes.parent_block_id;
    const parentModel = document.querySelector(
      `ngl-block[data-ngl-block-id="${parentId}"]`
    );

    if (parentModel && isBlock(parentModel))
      return (this.cached_parent_model = parentModel);
    else return (this.cached_parent_model = null);
  }

  get isInLinkedZone() {
    return this.model.zone().is_linked();
  }

  renderMenu() {
    if (this.isInLinkedZone) return this.renderLinkedBlockMenu();
    else if (this.parentModel) return this.renderInnerBlockMenu();
    else return this.renderOuterBlockMenu();
  }

  renderLinkedBlockMenu() {
    return html`
      <div class="edit-menu">
        <button @click=${this.refresh}>Refresh</button>
      </div>
    `;
  }

  renderInnerBlockMenu() {
    return html`
      <div class="edit-menu">
        <button @click=${this.parentModel.edit.bind(this.parentModel)}>
          Edit container
        </button>
        <button @click=${this.parentModel.refresh.bind(this.parentModel)}>
          Refresh container
        </button>
        <button @click=${this.edit}>Edit</button>
        <button @click=${this.refresh}>Refresh</button>
      </div>
    `;
  }

  renderOuterBlockMenu() {
    return html`
      <div class="edit-menu">
        <button @click=${this.edit}>Edit</button>
        <button @click=${this.refresh}>Refresh</button>
      </div>
    `;
  }

  edit() {
    this.model.trigger('edit');

    if (!this.isSaveListenerAttached) {
      this.model.on('sidebar_save:success', () => {
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
