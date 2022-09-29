import {LitElement, html} from 'lit';
import {classMap} from 'lit/directives/class-map.js';
import style from './style.js';

export default class Block extends LitElement {
  static styles = [style];

  static properties = {
    loading: {type: Boolean, state: true},
    blockId: {type: String},
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

  get parent() {
    const parentId = this.model.attributes.parent_block_id;
    this.cached_parent ||=
      parentId && document.querySelector(`ngl-block[blockId="${parentId}"]`);

    return this.cached_parent;
  }

  get isInLinkedZone() {
    return this.model.zone().is_linked();
  }

  renderMenu() {
    if (this.isInLinkedZone) return this.renderLinkedBlockMenu();
    if (this.parent) return this.renderInnerBlockMenu();
    return this.renderOuterBlockMenu();
  }

  renderLinkedBlockMenu() {
    return html`<button @click=${this.refresh}>Refresh</button>`;
  }

  renderInnerBlockMenu() {
    return html`
      ${this.renderOuterBlockMenu()}
      <button @click=${this.parentEdit}>Edit container</button>
      <button @click=${this.parentRefresh}>Refresh container</button>
    `;
  }

  renderOuterBlockMenu() {
    return html`
      <button @click=${this.edit}>Edit</button>
      <button @click=${this.refresh}>Refresh</button>
    `;
  }

  edit() {
    this.model.trigger('edit');
  }

  parentEdit() {
    this.parent.edit();
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
      `ngl-block[blockId="${this.blockId}"]`
    );

    this.innerHTML = currentBlockHtml.innerHTML;

    this.dispatchEvent(
      new Event('ngl:refresh', {bubbles: true, composed: true})
    );
  }

  parentRefresh() {
    this.parent.refresh();
  }

  render() {
    const classes = {loading: this.loading};

    return html`
      <main class=${classMap(classes)}>
        <div class="edit-menu">${this.renderMenu()}</div>
        <slot></slot>
      </main>
    `;
  }
}

customElements.get('ngl-block') || customElements.define('ngl-block', Block);
