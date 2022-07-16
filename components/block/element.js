import {LitElement, html} from 'lit';
import style from './style.js';

function isBlock(element) {
  return element instanceof Block;
}

export default class Block extends LitElement {
  static styles = [style];

  static properties = {
    blockId: { type: Number},
  };

  renderMenu(){
    return html`
      <nav>
        <button @click=${this.edit}>Edit</button>
        <button @click=${this.moveUp}>Move Up</button>
        <button @click=${this.moveDown}>Move Down</button>
        <button @click=${this.delete}>Delete</button>
      </nav>
    `;
  }

  edit(e){
    console.log(e.target.innerText)
    this.refresh();
  }

  delete(e) {
    console.log(e.target.innerText)
    this.remove();
  }

  moveUp(e) {
    console.log(e.target.innerText)
    const prevElement = this.previousElementSibling;
    isBlock(prevElement) && this.parentNode.insertBefore(this, prevElement)
  }

  moveDown(e) {
    console.log(e.target.innerText)
    const nextElement = this.nextElementSibling;
    isBlock(nextElement) && this.parentNode.insertBefore(nextElement, this)
  }

  async fetch() {
    const resp = await fetch(window.location.href)
    return resp.text()
  }

  async refresh() {
    let html = await this.fetch();
    const template = document.createElement('template')
    template.innerHTML = html;
    const currentBlockHtml = template.content.querySelector(`ngl-block[blockId="${this.blockId}"]`)

    // Simulate text change
    currentBlockHtml.querySelector('.timestamp').innerText = new Date().toLocaleTimeString();
    this.innerHTML = currentBlockHtml.innerHTML;
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
