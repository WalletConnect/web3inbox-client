import { css, html, svg, LitElement } from "lit";
import { ref, createRef, Ref } from "lit/directives/ref.js";
import { customElement, property, state } from "lit/decorators.js";
import { widgetVisibilitySubject } from "../../utils/events";

@customElement("w3i-widget-button")
export class W3iWidgetButton extends LitElement {
  public static styles = [
    css`
      button {
        border-radius: 32px;
        width: 2.5em;
        height: 2.5em;
        padding: 0.5em;
        outline: none;
        border: none;
      }
    `,
  ];

  protected onClick(): void {
    widgetVisibilitySubject.next(!widgetVisibilitySubject.value);
  }

  protected bellIcon() {
    return svg`
    <svg 
    width="18" 
    height="23" 
    viewBox="0 0 18 23" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg">

    <path 
      d="M9 0C6.07044 0 3.52579 2.0154 2.8548 4.86708L0.578373 14.5419C0.282981 15.7973 1.23551 
      17 2.52521 17H15.4748C16.7645 17 17.717 15.7973 17.4216 14.5419L15.1452 4.86709C14.4742 
      2.0154 11.9296 0 9 0Z" fill="black"/>

    <path 
      d="M12.723 19.9655C13.0267 19.1947 12.3284 18.5 11.5 18.5H6.5C5.67157 18.5 4.97334 
      19.1947 5.27698 19.9655C5.86167 21.4497 7.30818 22.5 9 22.5C10.6918 22.5 12.1383 21.4497 
      12.723 19.9655Z" fill="black"/>


    </svg>


    `;
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`<button @click=${this.onClick}>${this.bellIcon()}</button>`;
  }

  protected firstUpdated(): void {}
}

declare global {
  interface HTMLElementTagNameMap {
    "w3i-widget-button": W3iWidgetButton;
  }
}
