import {LitElement, html} from 'lit';
import {classMap} from 'lit/directives/class-map.js';
import style from './style.js';

function isBlock(element) {
  return element instanceof Block;
}

export default class Block extends LitElement {
  static styles = [style];

  static properties = {
    loading: {type: Boolean, state: true},
    blockId: {type: String, attribute: 'data-ngl-block-id'},
  };

  constructor() {
    super();

    this.loading = false;
  }

  connectedCallback() {
    super.connectedCallback();

    this.model.on('sidebar_save:success', this.refresh.bind(this));
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
  }

  async fetch() {
    this.loading = true;
    const resp = await fetch(window.location.href);
    this.loading = false;
    return resp.text();
  }

  async refresh() {
    let html = await this.fetch();

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
    const classes = {loading: this.loading};

    return html`
      <main class=${classMap(classes)}>
        ${this.renderMenu()}
        <slot></slot>
      </main>
    `;
  }
}

customElements.get('ngl-block') || customElements.define('ngl-block', Block);
