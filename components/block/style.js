import {css} from 'lit';

export default css`
  :host {
    --ngl-block-outline-color: #333;
    --ngl-block-outline-color-active: #990099;

    display: contents;
  }

  :hover ::slotted(.ngl-block) {
    box-shadow: inset 0px 0px 0px 2px var(--ngl-block-outline-color-active) !important;
  }

  main {
    position: relative;
  }

  main.loading {
    opacity: 0.5;
  }

  .edit-menu {
    z-index: 80001;
    display: none;
    visibility: hidden;
    opacity: 0;
    position: absolute;
    background: #fff;
    border: 1px solid #ccc;
    padding: 5px;
    border-radius: 4px;
  }

  main:hover .edit-menu {
    display: block;
    opacity: 1;
    visibility: visible;
  }

  button {
    background: none;
    border: none;
    margin: 0;
    padding: 0;
    margin: 0;
    border-left: 1px solid #ccc;
    padding: 4px;
    text-align: center;
  }
  button:first-child {
    border: none;
    margin-left: 0;
  }

  button:hover {
    background-color: #ccc;
  }
`;
