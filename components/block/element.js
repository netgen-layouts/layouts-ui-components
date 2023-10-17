import {LitElement, html} from 'lit';
import {classMap} from 'lit/directives/class-map.js';
import style from './style.js';

import { ArrowDownIcon, ArrowUpIcon, BreadcrumbArrowIcon, DuplicateIcon, MenuDotsIcon, PlusIcon, RefreshIcon } from '../icons.js';
import { addTimestampToUrl } from '../component-helper.js';

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
    isDropdownOpen:  {type: Boolean, default: false},
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

    this.model.on("delete:success", () => {
      parent.document.querySelector('.preview-iframe-sizer iframe')?.contentWindow.location.reload();
    })

    this.model.on("positions:update", () => {
      parent.document.querySelector('.preview-iframe-sizer iframe')?.contentWindow.location.reload();
    })


    const bc = new BroadcastChannel('publish_content');
    bc.onmessage = (event) => {
      this.handleMessageRecieved(event.data)
    };

    this.isDropdownOpen = false
  }

  handleMessageRecieved(data) {
    const {  blockId  } = data;

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

  get zones() {
    const zoneElements = [...window.parent.document.querySelectorAll("[data-zone]")]
    const sortedZones = zoneElements.map(el => {
      return this.core.g.layout.zones.models.find(zone => zone.id === el.dataset.zone);
    }).filter(Boolean).filter(zone => !zone.attributes.linked_zone_identifier)

    return sortedZones
  }

  get model() {
    return (this.cached_model ||= this.layout.blocks.findWhere({
      id: this.blockId,
    }));
  }

  get modelElement() {
    return document.querySelector(
      `ngl-block[blockId="${this.blockId}"]`
    )
  }

  get slottedModelElement() {
    return this.modelElement.querySelector(".ngl-slotted-block")
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
    if (!this.parentElement) return "";

    return this.parentElement.getAttribute('viewTypeName')
  }

  get isInLinkedZone() {
    return this.model.zone()?.is_linked();
  }

  get slot() {
    return this.shadowRoot.querySelector('slot');
  }

  get slottedChildren() {
    if (!this.slot) return [];

    this.cached_slottedChildren ||= this.slot.assignedElements({flatten: true});
    return this.cached_slottedChildren;
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
      const apiUrl = addTimestampToUrl(window.location.href)
      const resp = await fetch(apiUrl);
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
    const body = `
      <div class="error_message">
        <p>An error occurred and we're not sure why.</p>
        <p>Please, refresh the preview.</p>
      </div>
    `;

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

  handleSlotChnage() {
    this.setIsEmptyState()

    if(this.isSelected) this.slottedModelElement.scrollIntoView()
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

  handleMoveBlock(blockIds, zoneIdentifier, parentPosition) {

    this.model.set({
      parent_position: zoneIdentifier,
      zone_identifier: parentPosition
    });

    this.model
      .move(blockIds)
      .then(() => {
        this.handleRefreshView()
      })
  }

  handleMoveInsideSamePlaceholder(direction) {
    const directionNumber = direction === 'up' ? -1 : 1;

    const blockIds = [...this.model.zone().attributes.block_ids]
    const parentPosition = this.model.attributes.parent_position + directionNumber

    this.model.set({
      parent_position: parentPosition,
      zone_identifier: this.model.attributes.zone_identifier,
      parent_placeholder: this.model.attributes.parent_placeholder,
      parent_block_id: this.model.attributes.parent_block_id
    });

    this.model
    .move_to_container(blockIds)
    .then(() => {
      this.handleRefreshView()
    })
  }

  handleMoveInsideSameZone(direction) {
    console.debug("Move Inside Same Zone")

    const directionNumber = direction === 'up' ? -1 : 1;

    let blockIds = [...this.model.zone().attributes.block_ids];
    const fromIndex = blockIds.findIndex(id => id === this.blockId)
    const toIndex = fromIndex - 1;

    blockIds.splice(fromIndex, 1)
    blockIds.splice(toIndex, 0, this.blockId)

    const parentPosition = this.model.attributes.parent_position + directionNumber
    const zoneIdentifier = this.model.attributes.zone_identifier

    this.handleMoveBlock(blockIds, parentPosition, zoneIdentifier)
  }

  handleMoveOutOfContainer(direction) {
    const directionNumber = direction === 'up' ? 0 : 1;

    const blockIds = [...this.model.zone().attributes.block_ids];

    const fromIndex = blockIds.findIndex(id => id === this.parentModel.id)
    const toIndex = fromIndex - 1;

    blockIds.splice(fromIndex, 1)
    blockIds.splice(toIndex, 0, this.blockId)

    const parentPosition = this.parentModel.attributes.parent_position + directionNumber
    const zoneIdentifier = this.model.attributes.zone_identifier

    this.handleMoveBlock(blockIds, parentPosition, zoneIdentifier)
  }

  handleMoveInsideContainer(parentPlaceholder) {
    console.debug("Move Inside Container")
    const blockIds = [...this.model.zone().attributes.block_ids];

    const placeholders = this.parentModel.attributes.placeholders
    const placeholder = placeholders.find(pl => pl.identifier === parentPlaceholder)

    this.model.set({
      parent_position: placeholder.blocks.length,
      zone_identifier: this.model.attributes.zone_identifier,
      parent_placeholder: parentPlaceholder,
      parent_block_id: this.model.attributes.parent_block_id
    });

    this.model
    .move_to_container(blockIds)
    .then(() => {
      this.handleRefreshView()
    })
  }

  async handleRefreshView() {
    const apiUrl = addTimestampToUrl(window.location.href)
    return await fetch(apiUrl)
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
      .catch(err => {
        console.error(err);
        this.showErrorModal();
      })
      .finally(() => {
        this.isLoading = false
        this.placeholderIdentifier = ""
      })
  }

  handleMoveBlockUp() {
    if(this.isFirstBlockInFirstZone()) return

    if(!this.parentElement) {
      if(this.isFirstBlockInZone()) return this.handleMoveBlockToZoneAbove()

      return this.handleMoveInsideSameZone('up')
    }

    if(this.parentElement && !this.isFirstBlockInPlaceholder()) {
      return this.handleMoveInsideSamePlaceholder('up');
    }

    const parentPlaceholder = this.model.attributes.parent_placeholder
    const placeholders = this.parentModel.attributes.placeholders
    const placeholder = placeholders.find(pl => pl.identifier === "center_right") || placeholders.find(pl => pl.identifier === "center") || placeholders.find(pl => pl.identifier === "left")

    switch (parentPlaceholder) {
      case "center_right":
        this.handleMoveInsideContainer("center_left")
        break;

      case "center_left":
        this.handleMoveInsideContainer("left")
        break;

      case "center":
        this.handleMoveInsideContainer("left")
        break;

      case "right":
        this.handleMoveInsideContainer(placeholder.identifier)
        break;

      default:
        this.handleMoveOutOfContainer('up');
        break;
    }
  }

  handleMoveBlockDown() {
    if(this.isLastBlockInLastZone()) return

    if(!this.parentElement) {
      if(this.isLastBlockInZone()) return this.handleMoveBlockToZoneBelow()

      return this.handleMoveInsideSameZone('down');
    }

    if(this.parentElement && !this.isLastBlockInPlaceholder()) {
      return this.handleMoveInsideSamePlaceholder('down');
    }

    const parentPlaceholder = this.model.attributes.parent_placeholder
    const placeholders = this.parentModel.attributes.placeholders
    const placeholder = placeholders.find(pl => pl.identifier === "center_left") || placeholders.find(pl => pl.identifier === "center") || placeholders.find(pl => pl.identifier === "right")

    switch (parentPlaceholder) {
      case "center_right":
        this.handleMoveInsideContainer("right")
        break;

      case "center_left":
        this.handleMoveInsideContainer("center_right")
        break;

      case "center":
        this.handleMoveInsideContainer("right")
        break;

      case "left":
        this.handleMoveInsideContainer(placeholder.identifier)
        break;

      default:
        this.handleMoveOutOfContainer('down');
        break;
    }
  }

  handleMoveBlockToZoneAbove() {
    const currentZoneIndex = this.zones.findIndex(zone => this.model.zone().id === zone.id)
    const zoneAbove = this.zones[currentZoneIndex-1]
    const blockIds = [...zoneAbove.attributes.block_ids, this.blockId]
    const zoneIdentifier = zoneAbove.id
    const parentPosition = zoneAbove.attributes.block_ids.length > 0 ? zoneAbove.attributes.block_ids.length - 1 : 0

    this.handleMoveBlock(blockIds, parentPosition, zoneIdentifier)
  }

  handleMoveBlockToZoneBelow() {
    const currentZoneIndex = this.zones.findIndex(zone => this.model.zone().id === zone.id)
    const zoneBelow = this.zones[currentZoneIndex+1]
    const blockIds = [this.blockId,...zoneBelow.attributes.block_ids]
    const zoneIdentifier = zoneBelow.id
    const parentPosition = zoneBelow.attributes.block_ids.length > 0 ? 1 : 0

    this.handleMoveBlock(blockIds, parentPosition, zoneIdentifier)
  }

  handleDuplicateBlock() {
    this.model.copy(Boolean(this.parentElement)).then(() => {
      this.handleRefreshView()
    })
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

  isFirstBlockInPlaceholder() {
    const parentPosition = this.model.attributes.parent_position

    return parentPosition === 0
  }

  isLastBlockInPlaceholder() {
    const parentPosition = this.model.attributes.parent_position
    const placeholders = this.parentModel.attributes.placeholders
    const currentPlaceholder = placeholders.find(pl => pl.identifier === this.model.attributes.parent_placeholder)
    const numberOfBlocksInPlaceholder = currentPlaceholder.blocks.length - 1

    return parentPosition === numberOfBlocksInPlaceholder
  }

  isFirstBlockInZone() {
    const parentPosition = this.model.attributes.parent_position

    return parentPosition === 0
  }

  isLastBlockInZone() {
    const parentPosition = this.model.attributes.parent_position
    const numberOfBlocksInZone = this.model.zone().attributes.block_ids.length - 1

    return parentPosition === numberOfBlocksInZone
  }

  isFirstBlockInFirstZone() {
    return this.isFirstBlockInZone() && this.zones[0].id === this.model.zone().id
  }

  isLastBlockInLastZone() {
    return this.isLastBlockInZone() && this.zones[this.zones.length-1].id === this.model.zone().id
  }

  renderMoveButtons() {
    return html`
      <button class="move-btn" .disabled=${this.isFirstBlockInFirstZone()} @click=${this.handleMoveBlockUp}>
        ${ArrowUpIcon()}
      </button>
      <button class="move-btn" .disabled=${this.isLastBlockInLastZone()} @click=${this.handleMoveBlockDown}>
        ${ArrowDownIcon()}
      </button>
    `
  }

  renderMenu() {
    if (this.isInLinkedZone) return;

    return html`
      <div class="edit-menu">
        ${this.renderOuterBlockMenu()}
        ${this.renderDropdownMenu()}
      </div>`
  }

  toggleVisibilityModal() {
    this.model.trigger("modal:visibility")
  }

  toggleCacheModal() {
    this.model.trigger("modal:cache")
  }

  handleRevert() {
    this.model.trigger("revert")
  }

  handleDeleteBlock() {
    this.model.trigger("modal:delete")
  }

  toggleDropdownMenu() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  renderDropdownMenu() {
    return html`
    <div class="dropdown">
      <button @click=${this.toggleDropdownMenu}>
        ${MenuDotsIcon()}
      </button>
      <div class="dropdown-menu" .hidden=${!this.isDropdownOpen}>
        <div class="dropdown-menu-item" @click=${this.toggleVisibilityModal}>
          Configure visibility
        </div>
        <div class="dropdown-menu-item" @click=${this.toggleCacheModal}>
          Configure cache
        </div>
        <div class="dropdown-menu-item" @click=${this.handleRevert}>
          Revert to published version
        </div>
        <div class="dropdown-menu-item" @click=${this.handleDeleteBlock}>
          Delete block
        </div>
      </div>
    </div>
    `
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

  renderDuplicateButton() {
    return html`
      <button class="duplicate-btn" @click=${this.handleDuplicateBlock}>
        ${DuplicateIcon()}
      </button>`
  }

  renderActionButtons() {
    return html`
      <div class="action-btns">
        ${this.renderMoveButtons()}
        ${this.renderDuplicateButton()}
      </div>`
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
      is_in_linked_zone: this.isInLinkedZone,
    };

    return html`
      <main
        class=${classMap(classes)}
        @mouseover=${this.handleMouseover}
        @mouseout=${this.handleMouseout}
      >
        ${this.renderBreadcrumbs()}
        ${this.renderMenu()}
        ${this.renderActionButtons()}
        <slot @click=${this.selectOnBlockClick} @slotchange=${this.handleSlotChnage}></slot>
        ${this.renderAddButton()}
      </main>
    `;
  }
}

customElements.get('ngl-block') || customElements.define('ngl-block', Block);
