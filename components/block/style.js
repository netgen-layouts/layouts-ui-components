import { css } from 'lit';

export default css`
  :host {
    --ngl-block-outline-color: #333;
    --ngl-block-outline-color-active: #f66;

    display:contents;
  }

  ::slotted(.ngl-block) {
    outline:2px solid var(--ngl-block-outline-color) !important;
    outline-offset:4px;
  }

  :hover ::slotted(.ngl-block) {
    outline-color: var(--ngl-block-outline-color-active) !important;
  }

  main{
    position:relative;
  }

  nav{
    display: none;
    position:absolute;
    right:0px;
    top:0;
    background: #fff;
    border: 1px solid #ccc;
    padding:5px;
    border-radius: 5px;
  }

  main:hover nav {
    display:block;
  }

  button{
    background:none;
    border:none;
    margin:0;
    padding:0;
    margin:0;
    border-left: 1px solid #ccc;
    padding: 4px;
    text-align:center;
  }
  button:first-child{
    border: none;
    margin-left:0;
  }

  button:hover{background-color: #ccc;}
`
