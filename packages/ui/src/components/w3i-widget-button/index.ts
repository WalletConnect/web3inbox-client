import { LitElement, css, html, nothing, svg } from "lit";
import { styleMap } from "lit-html/directives/style-map.js";
import { customElement, property, state } from "lit/decorators.js";

import {
  widgetRecentNotificationsSubject,
  widgetVisibilitySubject,
} from "../../utils/events";

@customElement("w3i-widget-button")
export class W3iWidgetButton extends LitElement {
  @state() protected recentNotifications = 0;

  @property() public theme?: "light" | "dark";

  public static styles = [
    css`
      button {
        border-radius: 32px;
        width: 2.5em;
        height: 2.5em;
        padding: 0.5em;
        outline: none;
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
      <path fill-rule="evenodd" clip-rule="evenodd" d="M4.64155 2.64124C5.53235 1.75045 6.74053 1.25 8.00031 1.25C9.26009 1.25 10.4683 1.75045 11.3591 2.64124C12.2499 3.53204 12.7503 4.74023 12.7503 6.00001C12.7503 7.927 13.2344 9.19908 13.7373 10.0074L13.746 10.0213C13.9835 10.403 14.1724 10.7067 14.3001 10.9282C14.3641 11.0392 14.4237 11.1483 14.4683 11.2465C14.4905 11.2956 14.5161 11.3572 14.5364 11.4251C14.553 11.4809 14.5859 11.604 14.5736 11.755C14.5658 11.85 14.546 12.0201 14.4479 12.1967C14.3498 12.3733 14.2158 12.48 14.1393 12.5368C13.9554 12.6732 13.7463 12.7039 13.6806 12.7136L13.6765 12.7142C13.5737 12.7295 13.4586 12.7368 13.3452 12.7412C13.1201 12.75 12.8093 12.75 12.4261 12.75H3.57449C3.19127 12.75 2.88054 12.75 2.65542 12.7412C2.542 12.7368 2.42693 12.7295 2.32416 12.7142L2.32001 12.7136C2.25428 12.7039 2.04521 12.6732 1.86133 12.5368C1.78477 12.48 1.65084 12.3733 1.55272 12.1967C1.4546 12.0201 1.43479 11.85 1.42702 11.755C1.41468 11.604 1.44762 11.4809 1.46425 11.4251C1.48447 11.3572 1.51009 11.2956 1.53235 11.2465C1.57695 11.1483 1.63652 11.0392 1.7005 10.9282C1.82816 10.7067 2.01706 10.4031 2.2545 10.0215L2.2633 10.0074C2.76627 9.19907 3.25031 7.927 3.25031 6.00001C3.25031 4.74023 3.75076 3.53204 4.64155 2.64124ZM5.53492 13.7347C5.64524 13.443 5.92456 13.25 6.23643 13.25H9.76419C10.0761 13.25 10.3554 13.443 10.4657 13.7347C10.576 14.0264 10.4943 14.3559 10.2605 14.5623C9.65865 15.0935 8.8663 15.4167 8.00031 15.4167C7.13432 15.4167 6.34197 15.0935 5.74013 14.5623C5.50631 14.3559 5.4246 14.0264 5.53492 13.7347Z" fill=${
        this.theme === "dark" ? "#E4E7E7" : "#141414"
      }/>`;
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    console.log({ recent: this.recentNotifications });
    return html`
      <div class="w3i-trigger-button">
        ${this.recentNotifications > 0
          ? html`<div class="badge"></div>`
          : nothing}
        <button
          style=${styleMap(
            this.theme === "dark"
              ? {
                  backgroundColor: "#272A2A",
                  border: "solid 1px rgba(255, 255, 255, 0.10)",
                }
              : {
                  backgroundColor: "#FFFFFF",
                  border: "solid 1px rgba(6, 43, 43, 0.10)",
                }
          )}
          @click=${this.onClick}
        >
          ${this.bellIcon()}
        </button>
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
