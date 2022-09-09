import {css} from 'lit';

export default css`
  :host {
    --dropdown-z-index: 10;
    --dropdown-content-shadow: 0 0 16px rgb(0 0 0 / 18%);
    --dropdown-content-background: #fff;
    --dropdown-caret-background: #fff;
    --dropdown-caret-border-color: rgb(0 0 0 / 20%);

    display: inline-block;
  }

  .dropdown {
    position: relative;
  }

  .dropdown-trigger {
    display: block;
  }

  .dropdown-content {
    display: none;
    position: absolute;
    z-index: var(--dropdown-z-index);
    overscroll-behavior: none;
    box-shadow: var(--dropdown-content-shadow);
    background: var(--dropdown-content-background);
  }

  :host([open]) .dropdown-content {
    display: block;
  }

  .caret {
    position: absolute;
    display: inline-block;
  }

  .caret:before {
    content: ' ';
    position: absolute;
    top: 0;
    left: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-bottom: 10px solid var(--dropdown-caret-border-color);
  }

  .caret:after {
    content: ' ';
    position: absolute;
    left: 1px;
    top: 1px;
    border-left: 9px solid transparent;
    border-right: 9px solid transparent;
    border-bottom: 9px solid var(--dropdown-caret-background);
  }
`;
