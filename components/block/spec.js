import {fixture, assert} from '@open-wc/testing';
import {html} from 'lit/static-html.js';
import Block from './element.js'; // will import custom element;

describe('ngl-block', () => {
  it('is defined', () => {
    const el = document.createElement('ngl-block');
    assert.instanceOf(el, Block);
  });

  it('default render', async () => {
    const element = await fixture(html`<ngl-block blockId="1"></ngl-block>`);

    assert.shadowDom.equal(
      element,
      `
        <main>
          <nav>
            <button>Edit</button>
            <button>Move Up</button>
            <button>Move Down</button>
            <button>Delete</button>
          </nav>
          <slot></slot>
        </main>
      `
    );
  });
});
