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
  }

  main.loading {
    opacity: 0.5;
  }

  main ::slotted(.ngl-slotted-block):before,
  main ::slotted(.ngl-slotted-block):after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: calc(var(--ngl-block-base-z-index, 80000));
    cursor: pointer;
  }

  main.is_child_block ::slotted(.ngl-slotted-block):after {
    z-index: calc(var(--ngl-block-base-z-index, 80000) + 5);
  }

  main ::slotted(.ngl-slotted-block):before {
    pointer-events: none;
  }

  main.is_selected ::slotted(.ngl-slotted-block):before,
  main.is_selected ::slotted(.ngl-slotted-block):after {
    pointer-events: none;
  }

  main:not(.is_selected).is_hovered ::slotted(.ngl-slotted-block):before {
    background-color: var(--ngl-block-background-color-selected);
    z-index: calc(var(--ngl-block-base-z-index, 80000));
  }


  main:not(.is_selected):not(.is_child_selected).is_hovered ::slotted(.ngl-slotted-block):before {
    pointer-events: auto;
  }

  main.is_child_selected ::slotted(.ngl-slotted-block):after {
    pointer-events: none;
  }

  main.is_selected ::slotted(.ngl-slotted-block):after {
    border: solid var(--ngl-block-outline-width) var(--ngl-block-outline-color-selected);
  }
  main:not(.is_container).is_selected.is_empty ::slotted(.ngl-slotted-block):after {
    z-index: calc(var(--ngl-block-base-z-index, 80000) + 10);
    pointer-events: auto;
  }

  main:not(.is_selected).is_hovered ::slotted(.ngl-slotted-block):after {
    border: solid 1px var(--ngl-block-outline-color-hover);
  }

  main:not(.is_selected):not(.is_container_empty):not(.is_child_selected):not(.is_container_selected).is_empty ::slotted(.ngl-slotted-block):before {
    background-image: linear-gradient(135deg, #cfcfcf 2.94%, rgba(151, 71, 255, 0) 2.94%, rgba(151, 71, 255, 0) 50%, #cfcfcf 50%, #cfcfcf 52.94%, rgba(151, 71, 255, 0) 52.94%, rgba(151, 71, 255, 0) 100%);
    background-size: 24.04px 24.04px;
    z-index: calc(var(--ngl-block-base-z-index, 80000) + 4);
  }

  main.is_empty,
  main.is_empty ::slotted(.ngl-slotted-block),
  main.is_full_view_block,
  main.is_full_view_block ::slotted(.ngl-slotted-block) {
    min-height: 100px;
  }

  main.is_in_linked_zone ::slotted(.ngl-slotted-block):before,
  main.is_in_linked_zone ::slotted(.ngl-slotted-block):after {
    display: none;
  }

  .edit-menu {
    z-index: 80010;
    display: none;
    visibility: hidden;
    opacity: 0;
    position: absolute;
    right: 0;
    bottom: 100%;
    gap: 0.25rem;
    z-index: calc(var(--ngl-block-base-z-index, 80000) + 7);
  }

  main.is_selected .edit-menu {
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
    z-index: calc(var(--ngl-block-base-z-index, 80000) + 10);
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
    z-index: calc(var(--ngl-block-base-z-index, 80000) + 3);
    height: 21px;
    width: 18px;
  }

  .add-btn {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translate(-50%, 100%);
    padding: 0.125rem 0.5rem 0.125rem 0.25rem;
    display: none;
    opacity: 0;
    visibility: hidden;
    border-radius: 0 0 .125rem .125rem;
    z-index: calc(var(--ngl-block-base-z-index, 80000) + 10);
  }

  main.is_selected .add-btn {
    display: inline-flex;
    opacity: 1;
    visibility: visible;
  }

  .move-btns {
    display: none;
  }

  main.is_selected .move-btns {
    display: flex;
    gap: .125rem;
    position: absolute;
    top: .5rem;
    right: .5rem;
    z-index: calc(var(--ngl-block-base-z-index, 80000) + 11);
  }

  .move-btn {
    padding: .25rem;
  }
`;
