import {LitElement, html} from 'lit';
import {colorFromString} from './lib/color_from_string.js';
import style from './style.js';

export default class Avatar extends LitElement {
  static styles = [style];

  static properties = {
    name: {type: String},
    picture: {type: String},
    icon: {type: String},
    label: {type: String},
    rounded: {type: Boolean},
    layout: {type: String, reflect: true},
  };

  constructor() {
    super();
    this.icon = 'user';
    this.layout = 'md';
  }

  get bgColor() {
    return colorFromString(this.name, 50, 52);
  }

  get initials() {
    return this.name
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join('');
  }

  renderPicture() {
    return html` <img src="${this.picture}" /> `;
  }

  renderPlaceholder() {
    return html` <bu-icon name="${this.icon}"></bu-icon> `;
  }

  renderInitials() {
    return html`
      <span class="name" style="background-color: ${this.bgColor}"
        >${this.initials}</span
      >
    `;
  }

  renderLabel() {
    return html` <span class="label">${this.label}</span> `;
  }

  renderContent() {
    if (this.picture) {
      return this.renderPicture();
    }
    if (this.name) {
      return this.renderInitials();
    }
    return this.renderPlaceholder();
  }

  render() {
    return html` ${this.renderContent()} ${this.label && this.renderLabel()} `;
  }
}

customElements.get('bu-avatar') || customElements.define('bu-avatar', Avatar);
