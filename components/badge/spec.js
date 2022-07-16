import {fixture, assert} from '@open-wc/testing';
import {html} from 'lit/static-html.js';
import Badge from './element.js'; // will import custom element;

describe('bu-badge', () => {
  it('is defined', () => {
    const el = document.createElement('bu-badge');
    assert.instanceOf(el, Badge);
  });

  it('default render', async () => {
    const element = await fixture(html`<bu-badge count="1"></bu-badge>`);

    assert.dom.equal(element, `
      <bu-badge count=1 theme="secondary"></bu-badge>
    `);
  });

  it('hidden if count is 0', async () => {
    const element = await fixture(html`<bu-badge count="0"></bu-badge>`);

    assert.shadowDom.equal(element, "");
    assert.equal(getComputedStyle(element).display, 'none');
  });

  it('visible if count is 0 and showZero set to true', async () => {
    const element = await fixture(html`<bu-badge count="0" showZero></bu-badge>`);

    assert.shadowDom.equal(element, "0");
    assert.equal(getComputedStyle(element).display, 'inline-flex');
  });
});
