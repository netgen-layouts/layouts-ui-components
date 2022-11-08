import {css} from 'lit';

export default css`
  :host,
  :after,
  :before {
    --ngl-block-base-z-index: 80000; // was this randomly chosen?

    --ngl-block-priamry-color: #9747ff;

    --ngl-block-outline-color: #333;
    --ngl-block-outline-color-hover: #990099;
    --ngl-block-outline-color-selected: #9747ff;
    --ngl-block-outline-width: 0.125rem;

    --ngl-block-background-color-selected: rgba(151, 71, 255, 0.1);

    --ngl-block-button-background-color: #9747ff;
    --ngl-block-button-background-color-hover: #7625df;
  }

  :host {
    display: contents;
  }

  main {
    position: relative;
    /* z-index: 1; */
  }

  /* main main {
    z-index: 3;
  } */

  main.loading {
    opacity: 0.5;
  }

  main ::slotted(.ngl-block):before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 0;
  }

  main ::slotted(.ngl-block):after {
    content: '';
    inset: 0;
    position: absolute;
    pointer-events: none;
    z-index: calc(var(--ngl-block-base-z-index, 80000) + 1);
  }

  main.is_selected ::slotted(.ngl-block):before {
    pointer-events: none;
    z-index: 2;
  }

  main:not(.is_selected).is_hovered ::slotted(.ngl-block):before {
    background-color: var(--ngl-block-background-color-selected);
    z-index: 80000;
  }

  main:not(.is_selected).is_parent.is_hovered ::slotted(.ngl-block):before {
    z-index: 0;
  }

  main.is_selected ::slotted(.ngl-block):after {
    border: solid var(--ngl-block-outline-width)
      var(--ngl-block-outline-color-selected);
  }

  main:not(.is_selected).is_hovered ::slotted(.ngl-block):after {
    border: solid 1px var(--ngl-block-outline-color-hover);
  }

  .edit-menu {
    z-index: calc(var(--ngl-block-base-z-index) + 2);
    display: none;
    visibility: hidden;
    opacity: 0;
    position: absolute;
    right: 0;
    bottom: 100%;
    gap: 0.25rem;
  }
  main.is_selected .edit-menu,
  main.is_hovered .edit-menu {
    display: inline-flex;
    opacity: 1;
    visibility: visible;
  }

  button {
    --_btn-background-color: var(--ngl-block-button-background-color);
    background-color: var(--_btn-background-color);
    border: none;
    margin: 0;
    padding: 0.125rem 0.5rem;
    font-size: 0.75rem;
    font-weight: 500;
    color: #ffffff;
    gap: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    border-radius: 0.125rem 0.125rem 0 0;
    cursor: pointer;
    position: relative;
  }

  button.refresh-btn {
    padding-left: 0.125rem;
    padding-right: 0.125rem;
  }

  button:hover {
    --_btn-background-color: var(--ngl-block-button-background-color-hover);
  }

  .breadcrumbs {
    position: absolute;
    bottom: 100%;
    display: none;
    visibility: hidden;
    opacity: 0;
    z-index: calc(var(--ngl-block-base-z-index) + 2);
  }

  main.is_selected .breadcrumbs {
    display: flex;
    opacity: 1;
    visibility: visible;
  }

  main button.breadcrumb-btn {
    --_btn-background-color: var(--ngl-block-button-background-color);
    padding: 0.25rem 0.5rem;
    gap: 0.25rem;
    color: #fff;
    border-radius: 0.125rem 0.125rem 0 0;
    text-transform: capitalize;
  }
  main button.breadcrumb-btn:not(:last-child):hover {
    --_btn-background-color: var(--ngl-block-button-background-color-hover);
  }

  main button.breadcrumb-btn:not(:first-child) {
    padding-right: 0.75rem;
    padding-left: 1.5rem;
  }

  .breadcrumb-btn > svg {
    position: absolute;
    left: calc(100% - 5px);
    z-index: calc(var(--ngl-block-base-z-index) + 3);
  }

  .add-btn {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translate(-50%, calc(50% - 2px));
    padding: 0.125rem 0.5rem 0.125rem 0.25rem;
    display: none;
    opacity: 0;
    z-index: calc(var(--ngl-block-base-z-index) + 3);
    visibility: hidden;
    border-radius: 0.125rem;
  }

  main.is_selected .add-btn {
    display: inline-flex;
    opacity: 1;
    visibility: visible;
  }
`;
