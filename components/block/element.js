import {LitElement, html} from 'lit';
import {classMap} from 'lit/directives/class-map.js';
import style from './style.js';

export default class Block extends LitElement {
  static styles = [style];

  static properties = {
    loading: {type: Boolean, state: true},
    blockId: {type: String},
    templateName: {type: String},
    isSelected: {type: Boolean, state: true},
    isHovered: {type: Boolean, state: true},
    isParent: {type: Boolean, state: true},
  };

  constructor() {
    super();

    this.loading = false;
  }

  connectedCallback() {
    super.connectedCallback();

    this.isParent = this.model.attributes.is_container;

    this.model.on('all', console.debug)

    this.model.on('change', this.refresh.bind(this));
    this.model.on('sidebar:destroyed', () => this.isSelected = false)
  }

  get layout() {
    return this.core.g.layout;
  }

  get core(){
    return window.parent.Core;
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

  deselectIcon() {
    return html`
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2.5" y="2.5" width="11" height="11" stroke="white" stroke-dasharray="5 5"/>
        <rect x="11.5352" y="10.1211" width="2" height="8" rx="1" transform="rotate(135 11.5352 10.1211)" fill="white"/>
        <rect x="10.1211" y="4.46484" width="2" height="8" rx="1" transform="rotate(45 10.1211 4.46484)" fill="white"/>
      </svg>
    `
  }

  refreshIcon() {
    return html`
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 8C12 5.79086 10.2091 4 8 4C5.79086 4 4 5.79086 4 8C4 10.2091 5.79086 12 8 12" stroke="white" stroke-width="2" stroke-linecap="round"/>
        <path d="M9.5 7.5L12.4991 9.00035L14 6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>

    `
  }

  renderMenu() {
    if (this.isInLinkedZone) return this.renderLinkedBlockMenu();

    return this.renderOuterBlockMenu();
  }

  renderLinkedBlockMenu() {
    return html`
    <button class="refresh-btn" @click=${this.refresh}>
      ${this.refreshIcon()}
    </button>`;
  }

  renderOuterBlockMenu() {
    const label = html`
      <span>${this.isSelected ? 'Deselect' : 'Select'}</span>
    `

    return html`
      <button @click=${this.toggleSelect}>
        ${this.isSelected ? this.deselectIcon() : ''}
        ${label}
      </button>
      <button class="refresh-btn" @click=${this.refresh}>
        ${this.refreshIcon()}
      </button>
    `;
  }

  renderBreadcrumbs() {
    if(this.isInLinkedZone) return;

    return html`
      <div class="breadcrumbs">
        ${this.parent ?
          this.renderInnerBlokcBreadcrumbs() :
          this.renderOuterBlokcBreadcrumbs()}
      </div>
    `
  }

  renderInnerBlokcBreadcrumbs() {
    return html`
        <button class="breadcrumb-btn" @click=${this.parentSelect}>
          <span>${this.parent.getAttribute('templatename')}</span>
          ${this.breadcrumbArrowIcon()}
        </button>
        ${this.renderOuterBlokcBreadcrumbs()}
      </div>
    `
  }

  renderOuterBlokcBreadcrumbs() {
    return html`
      <button class="breadcrumb-btn" @click=${this.select}>
        <span>${this.templateName}</span>
      </button>
    `
  }

  breadcrumbArrowIcon() {
    return html`
      <svg width="20" height="22" viewBox="0 0 20 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 1H1.11504C1.64412 1 2.15164 1.20964 2.52648 1.58302L16.2887 15.2915C16.6811 15.6823 16.6811 16.3177 16.2887 16.7085L2.52648 30.417C2.15164 30.7904 1.64412 31 1.11504 31H1" stroke="white" stroke-width="5"/>
        <path d="M1.17157 0C1.70201 0 2.21071 0.210714 2.58579 0.585786L16.5858 14.5858C17.3668 15.3668 17.3668 16.6332 16.5858 17.4142L2.58578 31.4142C2.21071 31.7893 1.70201 32 1.17157 32H1V0H1.17157Z" fill="var(--_btn-background-color)"/>
      </svg>
      `
  }

  renderAddButton() {
    if(this.isInLinkedZone) return;

    return html`
      <button class="add-btn">
        <svg width="25" height="22" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="6.5" y="11" width="12" height="2" fill="#E0C8FF"/>
          <rect x="11.5" y="18" width="12" height="2" transform="rotate(-90 11.5 18)" fill="#E0C8FF"/>
        </svg>
        <span>Add</span>
      </button>
    `
  }

  toggleSelect() {
    if(this.isSelected) {
      this.isSelected = false;

      this.core.trigger('editing:unmark', { block: this.model })

    } else {
      this.select();
    }
  }

  select() {
    if(this.isInLinkedZone) return;

    this.model.trigger('edit');
    this.isSelected = true;
  }

  parentSelect() {
    this.parent.select();
  }

  getClosestBlockId(el) {
    const closestBlock = el.closest('ngl-block');
    const closestBlockId = closestBlock?.getAttribute('blockid');

    return closestBlockId || this.blockId;
  }

  selectOnBlockClick(e) {
    if( this.blockId !== this.getClosestBlockId(e.target) ) return;

    this.toggleSelect();
  }

  handleMouseover(e) {
    if(this.isInLinkedZone) return;

    this.isHovered = this.blockId === this.getClosestBlockId(e.target);
  }

  handleMouseout(e) {
    this.isHovered = false;
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
    const classes = { loading: this.loading, is_selected: this.isSelected, is_child: Boolean(this.parent), is_hovered: this.isHovered, is_parent: this.isParent };

    return html`
      <main class=${classMap(classes)} @mouseover=${this.handleMouseover} @mouseout=${this.handleMouseout}>
        <div class="edit-menu">${this.renderMenu()}</div>
        ${this.renderBreadcrumbs()}
        <slot @click=${this.selectOnBlockClick}></slot>
        ${this.renderAddButton()}
      </main>
    `;
  }
}

customElements.get('ngl-block') || customElements.define('ngl-block', Block);
