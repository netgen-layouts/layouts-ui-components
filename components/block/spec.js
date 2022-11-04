import {fixture, assert} from '@open-wc/testing';
import {html} from 'lit/static-html.js';
import Block from './element.js'; // will import custom element;
import sinon from 'sinon';
class FakeBackboneBlockModel {
  constructor(attributes) {
    this.attributes = attributes;
  }

  on() {}
  zone() {}
}

function stubLayoutEnv({block, zone}) {
  const model = new FakeBackboneBlockModel(block);

  Object.assign(model, {
    zone() {
      return zone;
    },
  });

  const blocks = {
    findWhere() {
      return model;
    },
  };

  window.parent.Core = {g: {layout: {blocks}}};
}

describe('ngl-block', () => {
  it('is defined', () => {
    const el = document.createElement('ngl-block');
    assert.instanceOf(el, Block);
  });

  it('should render normal block', async () => {
    stubLayoutEnv({
      block: {
        parent_block_id: null,
      },
      zone: {
        is_linked() {
          return false;
        },
      },
    });

    const element = await fixture(html`<ngl-block blockId="dfc6a013-75ee-4076-b228-050e28c0b0c0"></ngl-block>`);

    assert.shadowDom.equal(
      element,
      `
        <main>
          <div class="edit-menu">
            <button>Edit</button>
            <button>Refresh</button>
          </div>
          <slot></slot>
        </main>
      `
    );
  });

  it('should render block inside zone', async () => {
    stubLayoutEnv({
      block: {
        parent_block_id: null,
      },
      zone: {
        is_linked() {
          return true;
        },
      },
    });

    const element = await fixture(html`<ngl-block blockId="dfc6a013-75ee-4076-b228-050e28c0b0c0"></ngl-block>`);

    assert.shadowDom.equal(
      element,
      `
        <main>
          <div class="edit-menu">
            <button>Refresh</button>
          </div>
          <slot></slot>
        </main>
      `
    );
  });

  it('should render block with parent', async () => {
    stubLayoutEnv({
      block: {
        parent_block_id: 1,
      },
      zone: {
        is_linked() {
          return false;
        },
      },
    });

    const element = await fixture(html`<ngl-block blockId="dfc6a013-75ee-4076-b228-050e28c0b0c0"></ngl-block>`);

    assert.shadowDom.equal(
      element,
      `
        <main>
          <div class="edit-menu">
          <button>Edit</button>
          <button>Refresh</button>
          <button>Edit container</button>
          <button>Refresh container</button>
          </div>
          <slot></slot>
        </main>
      `
    );
  });

  it('should insert remote content on refresh', async () => {
    stubLayoutEnv({
      block: {
        parent_block_id: 1,
      },
      zone: {
        is_linked() {
          return false;
        },
      },
    });

    const element = await fixture(html`<ngl-block blockId="dfc6a013-75ee-4076-b228-050e28c0b0c0"></ngl-block>`);

    // Here we stub method fetch to return our test HTML
    sinon
      .stub(element, 'fetch')
      .resolves('<ngl-block blockId="dfc6a013-75ee-4076-b228-050e28c0b0c0">Hello world</ngl-block>');

    await element.refresh();

    assert.lightDom.equal(element, 'Hello world');
  });
});
