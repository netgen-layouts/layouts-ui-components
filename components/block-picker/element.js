import {LitElement, html} from 'lit';
import {classMap} from 'lit/directives/class-map.js';
import { addTimestampToUrl } from '../component-helper.js';
import { CloseIcon } from '../icons.js';
import style from './style.js';

export default class BlockPicker extends LitElement {
  static styles = [style];

  static properties = {
    blockId: {type: String},
    isActive: {type: Boolean, state: true, default: false},
    isLoading: {type: Boolean, state: true},
    placeholderIdentifier: {type: String}
  };

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
  }


  get core() {
    return window.parent.Core;
  }

  get layout() {
    return this.core.g.layout;
  }

  get zone() {
    return this.layout.zones.models.find(model => model.id === this.block.attributes.zone_identifier)
  }

  get blockGroups() {
    return this.core.g.block_types.groups.models
  }

  get block() {
    return this.layout.blocks._byId[this.blockId];
  }

  get iframe() {
    const iframe =  window.parent.document.querySelector('.preview-iframe-sizer iframe')
    return iframe;
  }

  handleClose() {
    this.isActive = false
    this.placeholderIdentifier = false
    this.iframe.contentDocument.querySelector('body').style.overflowY = 'auto';
  }

  handleOpen() {
    this.isActive = true
    this.iframe.contentDocument.querySelector('body').style.overflowY = 'hidden';
  }

  renderCloseBtn() {
    return html`
      <a class="close-panel" @click=${this.handleClose}>
        ${CloseIcon()}
      </a>
    `
  }

  renderBlockGroups() {
    if(!this.isActive) return;

    return html`
      <div class="panel">
        <div class="panel-content">
            ${this.renderCloseBtn()}
            ${this.blockGroups.map(group => this.renderBlockGroup(group))}
        </div>
      </div>
    `
  }

  renderBlockGroup(group) {
    const blockTypes = group._block_types.filter(blockType => this.placeholderIdentifier || this.block.attributes.parent_placeholder ? !blockType.attributes.is_container : true)

    if(blockTypes.length <= 0 ) return;

    return html`
        <div class="header">
            <h2>${group.attributes.name}</h2>
        </div>
        <div class="block-items">
            ${blockTypes.map((blockType, index) => this.renderBlockType(blockType, index))}
        </div>
    `
  }

  renderBlockType(blockType, index) {
    const icon = blockType.attributes.icon ? html`<img class="icon" src="${blockType.attributes.icon}" />` : html`<span class="icon font-icon"></span>`

    return html`
      <div class="add-block-btn icn-${blockType.id}" @click="${() => this.handleCreateBlockFromType(blockType)}">
          ${icon}
          <span class="title">${blockType.attributes.name}</span>
      </div>
    `
  }

  renderLoader() {
    if(!this.isLoading) return;

    return html`
      <div class="loader-container">
        <div class="loader">
          <i class="loading-ng-icon"></i>
          <span>Loading</span>
        </div>
      </div>
    `
  }


  handleCreateBlockFromType(blockType) {
    const identifier = blockType.get('identifier');
    const isContainer = this.block.attributes.is_container && this.placeholderIdentifier;
    const parentBlockId = isContainer ? this.blockId : this.block.attributes.parent_block_id

    const attributes = {
      block_type: identifier,
      zone_identifier: this.zone.id,
      layout_id: this.layout.id,
      parent_position: isContainer ? 0 : this.block.attributes.parent_position + 1,
      parent_placeholder: isContainer ? this.placeholderIdentifier : this.block.attributes.parent_placeholder,
      parent_block_id: parentBlockId
    };

    const newBlock = this.core.model_helper.init_block_from_type(blockType, attributes);

    let responseData = {};

    const saveInContainer = isContainer || this.block.attributes.parent_block_id
    this.isLoading = true;

    this.handleSaveNewBlock(newBlock, saveInContainer, parentBlockId)
      .then((res) => {
        responseData = res
        this.layout.reset_blocks_loaded()
        return this.layout.load_all_blocks()
      })
      .then(() => {
        this.isActive = false;
        this.handleRefreshView(responseData.id)
      })
  }

  handleSaveNewBlock(newBlock, saveInContainer, blockId) {
    if(saveInContainer) {
      console.warn('Save in container');
      return newBlock.save({}, { url: newBlock.url(blockId) } )
    } else {
      console.warn('Save')
      return newBlock.save()
    }
  }

  async handleRefreshView(blockId) {
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

        this.dispatchEvent(
          new Event('ngl:refresh', {bubbles: true, composed: true})
        );

        const block = this.layout.blocks._byId[blockId]
        const blockElement = iframe.contentDocument.querySelector(
          `ngl-block[blockId="${blockId}"]`
        )
        blockElement.isSelected = true;
        block.trigger('edit');
      })
      .catch(err => console.error(err))
      .finally(() => {
        this.isLoading = false
        this.placeholderIdentifier = ""
      })
  }

  updated(changedProperties) {
    if(!this.isActive) return;

    this.handleOpen()
  }

  render() {
    const classes = {
        is_active: this.isActive,
        is_loading: this.isLoading,
    };

    return html`
      <main class=${classMap(classes)} @click=${this.handleClose}>
        ${this.renderBlockGroups()}
        <slot></slot>
      </main>
      ${this.renderLoader()}
    `;
  }
}

customElements.get('ngl-block-picker') || customElements.define('ngl-block-picker', BlockPicker);
