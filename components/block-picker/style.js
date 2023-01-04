import {css} from 'lit';

export default css`
    :host,
    :after,
    :before {
        --ngl-block-picker-width: 22.625rem;
        --ngl-block-picker-gutter: 0.9375rem;
        --ngl-block-picker-background-color: #383838;
        --ngl-block-picker-border-color: #4f4f4f;
        --ngl-block-picker-block-background-color: #4f4f4f;
        --ngl-block-picker-text-color: #9c9c9c;
    }

    main {
        display: none;
        position: fixed;
        z-index: 80050;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.7);
    }

    main.is_active {
        display: block;
    }

    .panel {
        position: absolute;
        left: 50%;
        top: 50%;
        max-height: 90vh;
        border-top: 1px solid var(--ngl-block-picker-border-color);
        width: var(--ngl-block-picker-width);
        background: var(--ngl-block-picker-background-color);
        color: var(--ngl-block-picker-text-color);
        overflow-y: scroll;
        transform: translate(-50%, -200vh);
    }

    .panel::-webkit-scrollbar {
        width: .3125rem;
    }

    .panel::-webkit-scrollbar-thumb {
        background: #999;
    }

    main.is_active .panel {
        transform: translate(-50%, -50%);
        transition: transform 350ms 150ms ease;
    }

    .panel-content {
        padding: var(--ngl-block-picker-gutter);
    }

    .close-panel {
        position: absolute;
        right: .25em;
        top: .25em;
        width: 1.5em;
        height: 1.5em;
        cursor: pointer;
        text-align: right;
        color: var(--ngl-block-picker-text-color);
        z-index: 2;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .close-panel svg {
        fill: var(--ngl-block-picker-text-color)
    }

    .close-panel:hover {
        color: #fff;
    }

    .header {
        position: relative;
    }

    .header h2 {
        font-size: .75em;
        font-weight: 500;
        line-height: 1.25;
        text-transform: uppercase;
        margin: 0 0 .5em;
        color: inherit;
    }

    .block-items {
        margin: 0 0 1.5em;
        display: flex;
        flex-wrap: wrap;
    }

    .add-block-btn {
        border: 0;
        border-bottom: 1px solid var(--ngl-block-picker-background-color);
        border-right: 1px solid var(--ngl-block-picker-background-color);
        width: calc( ( var(--ngl-block-picker-width) - 2 * var(--ngl-block-picker-gutter) - 2rem)/ 4);
        background: #4a4a4a;
        border: 1px solid var(--ngl-block-picker-background-color);
        aspect-ratio: 1/1;
        color: var(--ngl-block-picker-text-color);
        text-align: center;
        padding: 0.25em 0.25em 0.625em;
        transition: background .15s ease, color .15s ease;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        font-size: .625rem;
        line-height: 1.2;
        align-itmes: center;
        justify-content: center;
    }

    .add-block-btn:hover {
        background: #5c5c5c;
        color: #fff;
    }

    .add-block-btn .icon {
        font-size: 2em;
        height: 2.5rem;
        line-height: 1.25;
        margin-bottom: .125em;
        padding: .125em;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .add-block-btn .icon {
        max-width: 100%;
        max-height: 100%;
        display: block;
    }

    .add-block-btn:hover .icon {
        filter: brightness(0) saturate(100%) invert(99%) sepia(97%) saturate(0%) hue-rotate(74deg) brightness(104%) contrast(100%);
    }

    .add-block-btn:nth-child(4n) {
        border-right: 0;
    }

    .loader-container {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, .75);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 80100;
        color: white;
    }

    .loading-ng-icon {
        display:inline-block;
        position:relative;
        font-size:1em;
        width:1.375em;
        height:2.375em;
        margin:0em 1.5em -0.3em;
        transform:rotate(-48deg);
        animation:loadRotate 1.5s infinite cubic-bezier(0.45, 0.05, 0.55, 0.95);
    }

    .loading-ng-icon::before,
    .loading-ng-icon::after {
        content:"";
        display:block;
        background:currentColor;
        border-radius:50%;
        position:absolute;
        left:50%;
    }

    .loading-ng-icon::before {
        width:1em;
        height:1em;
        margin-left:-0.5em;
        bottom:1.375em;
        animation:loadBounceTopSquash 0.75s alternate infinite ease, loadBounceTopFlow 0.75s alternate infinite ease;
    }

    .loading-ng-icon::after {
        width:1.375em;
        height:1.375em;
        margin-left:-0.6875em;
        bottom:0;
        animation:loadBounceBottomSquash 0.75s alternate infinite ease, loadBounceBottomFlow 0.75s alternate infinite ease;
    }

    @keyframes loadBounceTopSquash {
        0% {
            height:0.375em;
            border-radius:3.75em 3.75em 1.25em 1.25em;
            transform:scaleX(2);
        }
        15% {
            height:1em;
            border-radius:50%;
            transform:scaleX(1);
        }
        100% {
            height:1em;
            border-radius:50%;
            transform:scaleX(1);
        }
    }

    @keyframes loadBounceBottomSquash {
        0% {
            height:1em;
            border-radius:1.25em 1.25em 3.75em 3.75em;
            transform:scaleX(1.5);
        }
        15% {
            height:1.375em;
            border-radius:50%;
            transform:scaleX(1);
        }
        100% {
            height:1.375em;
            border-radius:50%;
            transform:scaleX(1);
        }
    }

    @keyframes loadBounceTopFlow {
        0% {
          bottom:1.125em;
        }
        50% {
            bottom:2.25em;
            animation-timing-function:cubic-bezier(0.55, 0.06, 0.68, 0.19);
        }
        90% {
            bottom:1.75em;
        }
        100% {
            bottom:1.75em;
        }
      }

    @keyframes loadBounceBottomFlow {
        0% {
            bottom:0.1875em;
        }
        50% {
            bottom:-0.9375em;
            animation-timing-function:cubic-bezier(0.55, 0.06, 0.68, 0.19);
        }
        90% {
            bottom:0em;
        }
        100% {
            bottom:0em;
        }
    }

    @keyframes loadRotate {
        0% {
            transform:rotate(-228deg);
        }
        49% {
            transform:rotate(-48deg);
        }
        51% {
            transform:rotate(-48deg);
        }
        92% {
            transform:rotate(132deg);
        }
        100% {
            transform:rotate(132deg);
        }
      }
`
