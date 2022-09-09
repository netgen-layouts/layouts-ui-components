import {LitElement, html} from 'lit';
import style from './style.js';

export default class Badge extends LitElement {
  static styles = [style];

  static properties = {
    count: {type: Number, reflect: true},
    theme: {type: String, reflect: true},
    showZero: {type: Boolean},
  };

  constructor() {
    super();
    this.theme = 'secondary';
  }

  render() {
    return html`${this.showZero || this.count > 0 ? this.count : null}`;
  }
}

customElements.get('bu-badge') || customElements.define('bu-badge', Badge);
