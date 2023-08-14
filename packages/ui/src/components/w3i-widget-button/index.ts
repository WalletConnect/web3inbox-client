import { LitElement, css, html, nothing, svg } from "lit";
import { customElement, state } from "lit/decorators.js";
import {
  widgetRecentNotificationsSubject,
  widgetVisibilitySubject,
} from "../../utils/events";

@customElement("w3i-widget-button")
export class W3iWidgetButton extends LitElement {
  @state() protected recentNotifications = 0;

  public static styles = [
    css`
      button {
        border-radius: 32px;
        width: 2.5em;
        height: 2.5em;
        padding: 0.5em;
        outline: none;
        border: none;
        cursor: pointer;
      }

      .w3i-trigger-button {
        position: relative;
      }

      .w3i-trigger-button .badge {
        width: 0.75em;
        height: 0.75em;
        border-radius: 50%;
        background-color: #3396ff;
        text-align: center;
        color: white;
        z-index: 2;
        position: absolute;
        right: -5%;
        top: -10%;
      }
    `,
  ];

  protected onClick(): void {
    widgetVisibilitySubject.next(!widgetVisibilitySubject.value);
  }

  protected bellIcon() {
    return svg`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
  <path d="M11.9999 6.00001C11.9999 4.93914 11.5784 3.92172 10.8283 3.17157C10.0781 2.42143 9.06072 2 7.99985 2C6.93898 2 5.92157 2.42143 5.17142 3.17157C4.42128 3.92172 3.99985 4.93914 3.99985 6.00001C3.99985 8.06013 3.48016 9.47065 2.89963 10.4036C2.40993 11.1906 2.16509 11.5841 2.17407 11.6939C2.18401 11.8154 2.20976 11.8617 2.3077 11.9344C2.39616 12 2.79491 12 3.59242 12H12.4073C13.2048 12 13.6035 12 13.692 11.9344C13.7899 11.8617 13.8157 11.8154 13.8256 11.6939C13.8346 11.5841 13.5898 11.1906 13.1001 10.4036C12.5195 9.47065 11.9999 8.06013 11.9999 6.00001Z" fill="#141414" stroke="#141414" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
`;
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    console.log({ recent: this.recentNotifications });
    return html`
      <div class="w3i-trigger-button">
        ${this.recentNotifications > 0
          ? html`<div class="badge"></div>`
          : nothing}
        <button @click=${this.onClick}>${this.bellIcon()}</button>
      </div>
    `;
  }

  protected firstUpdated(): void {
    widgetRecentNotificationsSubject.subscribe((recentNotifications) => {
      console.log({ recentNotifications });
      this.recentNotifications = recentNotifications;
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "w3i-widget-button": W3iWidgetButton;
  }
}
