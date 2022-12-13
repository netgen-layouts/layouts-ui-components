import {LitElement, html} from 'lit';
import {classMap} from 'lit/directives/class-map.js';
import style from './style.js';

import { ArrowDownIcon, ArrowUpIcon, BreadcrumbArrowIcon, PlusIcon, RefreshIcon } from '../icons.js';

export default class Block extends LitElement {
  static styles = [style];

  static properties = {
    loading: {type: Boolean, state: true},
    blockId: {type: String},
    viewTypeName: {type: String},
    isSelected: {type: Boolean},
    isHovered: {type: Boolean, state: true},
    isContainer: {type: Boolean, state: true},
    isEmpty: {type: Boolean},
    isContainerEmpty: {type: Boolean, default: false},
    isContainerSelected: {type: Boolean, default: false},
    isChildSelected: {type: Boolean, default: false},
    isFullViewBlock: {type: Boolean, default: false},
  };

  constructor() {
    super();

    this.loading = false;    
  }
  
  connectedCallback() {
    if (typeof window.parent.Core === 'undefined') {
      return;
    }

    super.connectedCallback();
     
    this.isContainer = this.model.attributes.is_container;
    this.isFullViewBlock = this.model.attributes.definition_identifier === 'full_view'
    this.model.on('change', this.refresh.bind(this));
    this.model.on('sidebar:destroyed', () => {
      this.isSelected = false;
      this.unmarkPlaceholders();
      this.setIsContainerSelected(false)
      this.setIsChildSelected(false)
    });

    const bc = new BroadcastChannel('publish_content');
    bc.onmessage = (event) => {
      this.handleMessageRecieved(event.data)
    };
  }

  handleMessageRecieved(data) {
    const { contentId, blockId, locale } = data;

    if(blockId !== this.blockId) return;

    this.model.trigger('edit');
  }


  // GETTERS - start
  get core() {
    return window.parent.Core;
  }

  get layout() {
    return this.core.g.layout;
  }

  get model() {
    return (this.cached_model ||= this.layout.blocks.findWhere({
      id: this.blockId,
    }));
  }

  get parentModel() {
    const parentId = this.model.attributes.parent_block_id;

    return this.layout.blocks.models.find(model => model.id === parentId)
  }

  get parentElement() {
    const parentId = this.model.attributes.parent_block_id;

    this.cached_parent ||=
      parentId && document.querySelector(`ngl-block[blockId="${parentId}"]`);

    return this.cached_parent;
  }

  get parentName() {
    if (!this.parentElement) return;

    return this.parentElement.getAttribute('viewTypeName')
  }

  get isInLinkedZone() {
    return this.model.zone()?.is_linked();
  }

  get slot() {
    return this.shadowRoot.querySelector('slot');
  }

  get slottedChildren() {
    return this.slot.assignedElements({flatten: true});
  }

  get placeholders() {
    return this.slottedChildren[0]?.querySelectorAll('ngl-placeholder')
  }

  get childBlocks() {
    return this.slottedChildren[0]?.querySelectorAll('ngl-block')
  }
  // GETTERS - end


  async fetch() {
    this.loading = true;
    try {
      const resp = await fetch(window.location.href);
      return resp.text();
    } finally {
      this.loading = false;
    }
  }

  async refresh() {
    try {
      let html = await this.fetch();

      const template = document.createElement('template');
      template.innerHTML = html;

      const currentBlockHtml = template.content.querySelector(
        `ngl-block[blockId="${this.blockId}"]`
      );
      this.innerHTML = currentBlockHtml.innerHTML;


      this.setNewAttributes(currentBlockHtml);
      this.isSelected = true;

      this.dispatchEvent(
        new Event('ngl:preview:block:refresh', {bubbles: true, composed: true})
      );
      this.markPlaceholders();
      this.setIsContainerSelected(true)
      this.setIsChildSelected(true)

      if(this.parentElement) [
        this.parentElement.setIsEmptyState()
      ]
    } catch (e) {
      console.error(e);
      this.showErrorModal();
    }
  }

  showErrorModal() {
    const body = `<div class="error_message">
  <p>An error occurred and we're not sure why.</p>
  <p>Please, refresh the preview.</p>
</div>`;

    new this.core.Modal({
      title:  'Something went wrong!',
      body: body,
      apply_text: 'Refresh',
      cancel_disabled: true,
      modal_options: {
        keyboard: false,
        backdrop: 'static'
      }
    }).on('apply', function(){
      parent.document.querySelector('.preview-iframe-sizer iframe')?.contentWindow.location.reload();
    }).open();
  }

  setNewAttributes(newElement) {
    const oldAttributess = this.getAttributesObject(this);
    const newAttributess = this.getAttributesObject(newElement);

    Object.entries(oldAttributess).map(attribute => !newAttributess[attribute[0]] && this.removeAttribute(attribute[0]))
    Object.entries(newAttributess).map(attribute => this[attribute[1]] = attribute[1])
  }

  getAttributesObject(el) {
    const attrs = el.getAttributeNames().reduce((acc, name) => {
      return {...acc, [name]: el.getAttribute(name)};
    }, {});

    return attrs
  }

  setIsEmptyState() {
    if(!this.isContainer) return;

    const areAllPlaceholdersEmpty = [...this.placeholders].every(el => el.isEmpty)
    const areAllChildBlocksEmpty = [...this.childBlocks].every(el => el.isEmpty)

    this.isEmpty = areAllPlaceholdersEmpty || areAllChildBlocksEmpty;
    this.isChildSelected = [...this.childBlocks].some(el => el.isSelected)

    this.setChildBlocksIsEmptyState();

    if(this.isSelected) this.markPlaceholders()
  }

  setChildBlocksIsEmptyState() {
    if(!this.isEmpty) return;

    [...this.placeholders, ...this.childBlocks].map(el => el.isContainerEmpty = true)
  }

  handleAddButtonClick() {
    const blockPicker = document.querySelector('ngl-block-picker');

    blockPicker.blockId = this.blockId;
    blockPicker.isActive = true;
  }

  toggleSelect() {
    if (this.isSelected) {
      this.isSelected = false;

      this.core.trigger('editing:unmark', {block: this.model});
      this.unmarkPlaceholders();
      this.setIsContainerSelected(false)
      this.setIsChildSelected(false)
    } else {
      this.select();
      this.markPlaceholders();
      this.setIsContainerSelected(true)
      this.setIsChildSelected(true)
    }
  }

  select() {
    if (this.isInLinkedZone) return;

    console.debug(this.model)

    this.model.trigger('edit');
    this.isSelected = true;
  }

  parentSelect() {
    this.parentElement.toggleSelect();
  }

  setIsChildSelected(selected) {
    if(this.isContainer) return;

    const parentBlock = document.querySelector(`ngl-block[blockId="${this.blockId}"]`)?.parentElement?.closest('ngl-block')
    if(!parentBlock) return;

    parentBlock.isChildSelected = selected;
  }
  
  setIsContainerSelected(selected) {
    if(!this.isContainer || !this.childBlocks) return;
    
    this.childBlocks.forEach(el => el.isContainerSelected = selected)
  }

  getClosestBlockId(el) {
    const closestBlock = el.closest('ngl-block');
    const closestBlockId = closestBlock?.getAttribute('blockid');

    return closestBlockId || this.blockId;
  }

  selectOnBlockClick(e) {
    if (this.blockId !== this.getClosestBlockId(e.target)) return;

    this.toggleSelect();
  }

  markPlaceholders() {
    this.toggleMarkPlaceholders(true)
  }
  
  unmarkPlaceholders() {
    this.toggleMarkPlaceholders(false)
  }
  
  toggleMarkPlaceholders(mark) {
    if(!this.placeholders) return;
    
    this.placeholders.forEach(el => el.isMarked = mark)
  }

  // EVENTS - start
  handleMouseover(e) {
    if (this.isInLinkedZone) return;

    this.isHovered = this.blockId === this.getClosestBlockId(e.target);
  }

  handleMouseout() {
    this.isHovered = false;
  }

  handleMoveBlock(direction) {
    const directionNumber = direction === 'up' ? -1 : 1;

    
    let blockIds = [...this.model.zone().attributes.block_ids];
    const fromIndex = blockIds.findIndex(id => id === this.blockId)
    const toIndex = fromIndex - 1; 
    
    blockIds.splice(fromIndex, 1)
    blockIds.splice(toIndex, 0, this.blockId)
    
    if(this.parentElement) {
      this.model.set({
        parent_position: this.model.attributes.parent_position + directionNumber,
        zone_identifier: this.model.attributes.zone_identifier,
        parent_placeholder: this.model.attributes.placeholder_id,
        parent_block_id: this.model.attributes.parent_block_id
      });
      this.model.move_to_container(blockIds)
      .then(() => {
        const iframe =  window.parent.document.querySelector('.preview-iframe-sizer iframe')
        iframe?.contentWindow.location.reload()
      })
    } else {
      this.model.set({
        parent_position: this.model.attributes.parent_position + directionNumber,
        zone_identifier: this.model.attributes.zone_identifier
      });
      this.model.move(blockIds)
      .then(() => {
        this.handleRefreshView()
      })
    }

  }

  async handleRefreshView() {

    return await fetch(window.location.href)
      .then(resp => {
        return resp.text()
      })
      .then(html => {
        const template = document.createElement('template');
        template.innerHTML = html;
  
        const futurePage = template.content.querySelector(
          '#page'
        );
        const iframe =  window.parent.document.querySelector('.preview-iframe-sizer iframe')
        const currentPage = iframe.contentDocument.querySelector(
          '#page'
        );
        currentPage.innerHTML = futurePage.innerHTML
  
        const blockElement = iframe.contentDocument.querySelector(
          `ngl-block[blockId="${this.blockId}"]`
        )
        blockElement.isSelected = true;
        this.model.trigger('edit');
      })
      .catch(err => console.error(err))
      .finally(() => {
        this.isLoading = false
        this.placeholderIdentifier = ""
      })
  }

  handleMoveBlockUp() {
    const parentPosition = this.model.attributes.parent_position
    if(parentPosition === 0) this.handleMoveBlockToZoneAbove()
    
    this.handleMoveBlock('up');
  }

  handleMoveBlockDown() {
    const parentPosition = this.model.attributes.parent_position
    const numberOfBlocks = this.model.zone().attributes.block_ids.length - 1
    if(parentPosition === numberOfBlocks) this.handleMoveBlockToZoneBelow()
    
    this.handleMoveBlock('down');
  }

  handleMoveBlockToZoneAbove() {
    // @todo: implement move block to zone above
  }

  handleMoveBlockToZoneBelow() {
    // @todo: implement move block to zone below
  }
  // EVENTS - end

  // RENDERS - start
  renderAddButton() {
    if (this.isInLinkedZone) return;

    return html`
      <button class="add-btn" @click=${this.handleAddButtonClick}>
        ${PlusIcon()}
        <span>Add</span>
      </button>
    `;
  }

  renderMoveButtons() {
    return html`
      <div class="move-btns">
        <button class="move-btn" @click=${this.handleMoveBlockUp}>
          ${ArrowUpIcon()}
        </button>
        <button class="move-btn" @click=${this.handleMoveBlockDown}>
          ${ArrowDownIcon()}
        </button>
      </div>
    `
  }

  renderMenu() {
    if (this.isInLinkedZone) return;

    return html`
      <div class="edit-menu">
        ${this.renderOuterBlockMenu()}
      </div>`
  }

  renderOuterBlockMenu() {
    return html`
      <button class="refresh-btn" @click=${this.refresh}>
        ${RefreshIcon()}
      </button>
    `;
  }

  renderBreadcrumbs() {
    if (this.isInLinkedZone) return;

    return html`
      <div class="breadcrumbs">
        ${this.parentElement
          ? this.renderInnerBlockBreadcrumbs()
          : this.renderOuterBlockBreadcrumbs()}
      </div>
    `;
  }

  renderInnerBlockBreadcrumbs() {
    return html`
        <button class="breadcrumb-btn" @click=${this.parentSelect}>
          <span>${this.parentName}</span>
          ${BreadcrumbArrowIcon()}
        </button>
        ${this.renderOuterBlockBreadcrumbs()}
      </div>
    `;
  }

  renderOuterBlockBreadcrumbs() {
    return html`
      <button class="breadcrumb-btn" @click=${this.select}>
        <span>${this.viewTypeName}</span>
      </button>
    `;
  }
  // RENDERS - end

  render() {
    const classes = {
      loading: this.loading,
      is_selected: this.isSelected,
      is_hovered: this.isHovered,
      is_container: this.isContainer,
      is_empty: this.isEmpty,
      is_full_view_block: this.isFullViewBlock,
      is_container_empty: this.isContainerEmpty,
      is_container_selected: this.isContainerSelected,
      is_child_selected: this.isChildSelected,
      is_child_block: this.parentElement,
    };

    return html`
      <main
        class=${classMap(classes)}
        @mouseover=${this.handleMouseover}
        @mouseout=${this.handleMouseout}
      >
        ${this.renderBreadcrumbs()}
        ${this.renderMenu()}
        <slot @click=${this.selectOnBlockClick} @slotchange=${this.setIsEmptyState}></slot>
        ${this.renderAddButton()}
      </main>
    `;
  }
}

customElements.get('ngl-block') || customElements.define('ngl-block', Block);
