import {css} from 'lit';

export default css`
  :host {
    --bg: #333;

    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    min-height: 20px;
    padding: 3px 7px;
    color: #fff;
    font-size: 12px;
    font-weight: bold;
    line-height: 1;
    font-family: var(--font-family-sans-serif);
    white-space: nowrap;
    border-radius: 10px;
  }

  :host([theme='primary']) {
    background-color: var(--primary, rgb(13, 110, 253));
  }

  :host([theme='secondary']) {
    background-color: var(--secondary, rgb(50, 157, 125));
  }

  :host([count='0']) {
    display: none;
    background-color: var(--muted, #666);
  }

  :host([showZero][count='0']) {
    display: inline-flex;
  }
`;
