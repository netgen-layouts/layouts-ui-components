import {fixture, assert} from '@open-wc/testing';
import {html} from 'lit/static-html.js';
import './element.js'; // will register custom element;

describe('bu-avatar', () => {
  it('renders with placeholder', async () => {
    const element = await fixture(html`<bu-avatar></bu-avatar>`);

    assert.shadowDom.equal(element, `
      <bu-icon name="user"></bu-icon>
    `);
  });

  it('renders with initials and background color', async () => {
    const element = await fixture(html`<bu-avatar name="John Doe"></bu-avatar>`);

    assert.shadowDom.equal(element, `
      <span class="name" style="background-color: hsl(-147, 50%, 52%)">JD</span>
    `);
  });

  it('renders with picture', async () => {
    const element = await fixture(html`<bu-avatar name="John Doe" picture="https://i.pravatar.cc/120"></bu-avatar>`);

    assert.shadowDom.equal(element, `
      <img src="https://i.pravatar.cc/120">
    `);
  });
});
