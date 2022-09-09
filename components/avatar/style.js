import {css} from 'lit';

export default css`
  :host {
    --md: 50px;
    --lg: 80px;

    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border-radius: 4px;
    background-color: var(--gray-500, #666);
  }

  img {
    width: 100%;
    border-radius: 4px;
  }

  .name {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    border-radius: 4px;
    color: var(--gray-100, white);
    font-weight: 600;
    text-transform: uppercase;
  }

  .label {
    position: absolute;
    left: 50%;
    bottom: 4px;
    padding: 4px;
    background: var(--gray-300, #eee);
    border-radius: 4px;
    border: 2px solid #fff;
    font-size: 10px;
    line-height: 1;
    transform: translate(-50%, 50%);
  }

  :host([rounded]) {
    border-radius: 50%;
  }

  :host([rounded]) .name {
    border-radius: 50%;
  }

  :host([rounded]) img {
    border-radius: 50%;
  }

  :host([layout='md']) {
    width: var(--avatar-size, var(--md));
    height: var(--avatar-size, var(--md));
    font-size: calc(var(--avatar-size, var(--md)) * 0.4);
  }

  :host([layout='lg']) {
    width: var(--avatar-size, var(--lg));
    height: var(--avatar-size, var(--lg));
    font-size: calc(var(--avatar-size, var(--lg)) * 0.4);
  }
`;
