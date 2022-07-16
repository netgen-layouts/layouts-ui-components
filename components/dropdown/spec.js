import { fixture, assert } from '@open-wc/testing';
import { sendKeys } from '@web/test-runner-commands';
import { html } from 'lit/static-html.js';
import './element.js';

const createDropdown = async (properties) => {

  const element = await fixture(html`
    <bu-dropdown>
      <button slot="trigger">Click</button>
      <ul>
        <li><a href="#">First</a></li>
        <li>Second</li>
        <li><button>Third</button></li>
      </ul>
    </bu-dropdown>
  `);

  for (const key in properties) {
    element[key] = properties[key];
  }

  return element;
}

describe('bu-dropdown', () => {

  it('should be visible with the open attribute', async () => {
    const element = await createDropdown({open: true});

    assert.equal(getComputedStyle(element.dropdownContent).display, 'block');
  });

  it('should be hidden with the open attribute set to false', async () => {
    const element = await createDropdown({open: false});

    assert.equal(getComputedStyle(element.dropdownContent).display, 'none');
  });

  it('should open on trigger click', async () => {
    const element = await createDropdown();
    element.trigger.click();

    assert.isTrue(element.open);
  });

  it('should close on trigger click', async () => {
    const element = await createDropdown({open: true});
    element.trigger.click();

    assert.isFalse(element.open);
  });

  it('should close on click outside element and initially open', async () => {
    const element = await createDropdown({open: true});

    document.body.click();
    assert.isFalse(element.open);
  });

  it('should render caret if has caret attribute', async () => {
    const element = await createDropdown({open: true, caret: true});

    assert.isTrue(element.caretElement !== null);
  });

  describe('should open dropdown on key press', () => {

    it('on Enter', async () => {
      const element = await createDropdown();
      element.triggerElement.focus();

      await sendKeys({ press: 'Enter' });
      await element.updateComplete;

      assert.isTrue(element.open);
    });

    it('on Space', async () => {
      const element = await createDropdown();
      element.triggerElement.focus();

      await sendKeys({ press: 'Space' });
      await element.updateComplete;

      assert.isTrue(element.open);
    });

    it('on ArrowDown', async () => {
      const element = await createDropdown();
      element.triggerElement.focus();

      await sendKeys({ press: 'ArrowDown' });
      await element.updateComplete;

      assert.isTrue(element.open);
    });
  });

  describe('should close dropdown on key press if dropdown was opened, and focus is on trigger element', () => {

    it('on Escape', async () => {
      const element = await createDropdown({open: true});
      element.triggerElement.focus();

      await sendKeys({ press: 'Escape' });
      await element.updateComplete;

      assert.isFalse(element.open);
    });

    it('on Enter', async () => {
      const element = await createDropdown({open: true});
      element.triggerElement.focus();

      await sendKeys({ press: 'Enter' });
      await element.updateComplete;

      assert.isFalse(element.open);
    });

    it('on Space', async () => {
      const element = await createDropdown({open: true});
      element.triggerElement.focus();

      await sendKeys({ press: 'Space' });
      await element.updateComplete;

      assert.isFalse(element.open);
    });
  });

  describe('should have accessibility attributes', () => {

    it('should have aria-haspopup on trigger', async () => {
      const element = await createDropdown();

      assert.isTrue(element.triggerElement.hasAttribute('aria-haspopup'));
    });

    it('should have aria-expanded as true if trigger has been clicked', async () => {
      const element = await createDropdown();
      element.triggerElement.click();

      assert.equal(element.triggerElement.getAttribute('aria-expanded'), 'true');
    });

    it('should have aria-hidden as true if dropdown is not opened', async () => {
      const element = await createDropdown();

      assert.equal(element.dropdownContent.getAttribute('aria-hidden'), 'true');
    });
  });

  it('should have tabbable menu items', async () => {
    const element = await createDropdown({open: true});

    assert.isTrue(element.tabbableElements.length > 0);
  });

  describe('should focus on tabbable element on specific key press', () => {

    it('on Tab key press tabbable element should be focused', async () => {
      const element = await createDropdown({open: true});
      element.triggerElement.focus();

      await sendKeys({ press: 'Tab' });
      await element.updateComplete;

      // First tabbable element is focused
      assert.equal(document.activeElement, element.tabbableElements[0]);

      await sendKeys({ press: 'Tab' });
      await element.updateComplete;

      // Second tabbable element is focused
      assert.equal(document.activeElement, element.tabbableElements[1]);
    });

    it('on ArrowDown key press first tabbable element should be focused', async () => {
      const element = await createDropdown({open: true});
      element.triggerElement.focus();

      await sendKeys({ press: 'ArrowDown' });
      await element.updateComplete;

      assert.equal(document.activeElement, element.tabbableElements[0]);
    });

    it('on ArrowUp key press second tabbable element should be focused if first is already focused', async () => {
      const element = await createDropdown({open: true});
      element.tabbableElements[1].focus();

      await sendKeys({ press: 'ArrowUp' });
      await element.updateComplete;

      assert.equal(document.activeElement, element.tabbableElements[0]);
    });

    it('on Home key press first tabbable element should be focused', async () => {
      const element = await createDropdown({open: true});
      element.triggerElement.focus();

      await sendKeys({ press: 'Home' });
      await element.updateComplete;

      assert.equal(document.activeElement, element.tabbableElements[0]);
    });

    it('on End key press last tabbable element should be focused', async () => {
      const element = await createDropdown({open: true});
      element.triggerElement.focus();

      await sendKeys({ press: 'End' });
      await element.updateComplete;

      assert.equal(document.activeElement, element.tabbableElements[element.tabbableElements.length - 1]);
    });
  });

});
