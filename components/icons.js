import {html} from 'lit';

export const ArrowUpIcon = () => {
    return html`
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="7" y="2.4165" width="2" height="12" rx="1" fill="white"/>
        <rect x="4.46484" y="8.36377" width="2" height="7" rx="1" transform="rotate(-135 4.46484 8.36377)" fill="white"/>
        <rect x="12.9492" y="6.94971" width="2" height="7" rx="1" transform="rotate(135 12.9492 6.94971)" fill="white"/>
        </svg>
    `
}

export const ArrowDownIcon = () => {
    return html`
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="9" y="14" width="2" height="12" rx="1" transform="rotate(-180 9 14)" fill="white"/>
        <rect x="11.5356" y="8.05298" width="2" height="7" rx="1" transform="rotate(45 11.5356 8.05298)" fill="white"/>
        <rect x="3.05029" y="9.4668" width="2" height="7" rx="1" transform="rotate(-45 3.05029 9.4668)" fill="white"/>
      </svg>
    `
}

export const RefreshIcon = () => {
    return html`
        <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M12 8C12 5.79086 10.2091 4 8 4C5.79086 4 4 5.79086 4 8C4 10.2091 5.79086 12 8 12"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
            />
            <path
                d="M9.5 7.5L12.4991 9.00035L14 6"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            />
        </svg>
  `;
}

export const BreadcrumbArrowIcon = () => {
    return html`
      <svg
        width="20"
        height="22"
        viewBox="0 0 20 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1 1H1.11504C1.64412 1 2.15164 1.20964 2.52648 1.58302L16.2887 15.2915C16.6811 15.6823 16.6811 16.3177 16.2887 16.7085L2.52648 30.417C2.15164 30.7904 1.64412 31 1.11504 31H1"
          stroke="white"
          stroke-width="5"
        />
        <path
          d="M1.17157 0C1.70201 0 2.21071 0.210714 2.58579 0.585786L16.5858 14.5858C17.3668 15.3668 17.3668 16.6332 16.5858 17.4142L2.58578 31.4142C2.21071 31.7893 1.70201 32 1.17157 32H1V0H1.17157Z"
          fill="var(--_btn-background-color)"
        />
      </svg>
    `;
}

export const PlusIcon = () => {
    return html`
        <svg
            width="25"
            height="22"
            viewBox="0 0 25 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect x="6.5" y="11" width="12" height="2" fill="#E0C8FF" />
            <rect
                x="11.5"
                y="18"
                width="12"
                height="2"
                transform="rotate(-90 11.5 18)"
                fill="#E0C8FF"
            />
        </svg>
    `
}

export const CloseIcon = () => {
  return html`
    <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20">
      <path d="M6.062 15 5 13.938 8.938 10 5 6.062 6.062 5 10 8.938 13.938 5 15 6.062 11.062 10 15 13.938 13.938 15 10 11.062Z"/>
    </svg>
  `
}