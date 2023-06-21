import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { WEB3INBOX_DEFAULT_URL } from "../../constants/web3inbox";
import { buildW3iUrl } from "../../utils/urlBuilder";

@customElement("w3i-widget")
export class W3iWidget extends LitElement {
  public static styles = [
    css`
      iframe {
        position: relative;
        overflow: scroll;
        border: none;
        border-radius: 25px;
      }
    `,
  ];

  // -- state & properties ------------------------------------------- //
  @property() public width? = 400;
  @property() public height? = 600;
  @property() public web3inboxUrl = WEB3INBOX_DEFAULT_URL;
  @property() public account?: string;
  @property() public chatEnabled = "true";
  @property() public pushEnabled = "true";
  @property() public settingsEnabled = "true";

  // -- render ------------------------------------------------------- //
  protected render() {
    const url = buildW3iUrl(this.web3inboxUrl, this.account, {
      chat: this.chatEnabled,
      push: this.pushEnabled,
      settings: this.settingsEnabled,
    });

    return html`
      <iframe
        src=${url}
        width=${this.width}
        height=${this.height}
        allow="fullscreen"
        loading="lazy"
        referrerpolicy="none"
      />
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "w3i-widget": W3iWidget;
  }
}
