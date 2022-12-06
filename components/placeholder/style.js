import {css} from 'lit';

export default css`
  :host,
  :after,
  :before {
  }

  :host {
    display: contents;
  }
  
  main {
    min-height: 102px;
    position: relative;
  }

  main:after {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  main.is_marked:after {
    content: "";
    border: dashed 1px var(--ngl-block-outline-color-hover);
  }

  main.is_empty.is_marked:after {
    content: "";
    border: dashed 1px var(--ngl-block-outline-color-hover);
    min-height: 100px;
  }

  main:not(.is_marked):not(.is_container_empty).is_empty {
    background-image: linear-gradient(135deg, #cfcfcf 2.94%, rgba(151, 71, 255, 0) 2.94%, rgba(151, 71, 255, 0) 50%, #cfcfcf 50%, #cfcfcf 52.94%, rgba(151, 71, 255, 0) 52.94%, rgba(151, 71, 255, 0) 100%);
    background-size: 24.04px 24.04px;
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

  button:hover {
    --_btn-background-color: var(--ngl-block-button-background-color-hover);
  }

  .add-btn {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translate(-50%, 0);
    padding: 0.125rem 0.5rem 0.125rem 0.25rem;
    display: none;
    opacity: 0;
    z-index: calc(var(--ngl-block-base-z-index) + 3);
    visibility: hidden;
    border-radius: 0 0 0.125rem 0.125rem;
  }

  main.is_marked.is_empty .add-btn {
    display: inline-flex;
    opacity: 1;
    visibility: visible;
  }
`;
