import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { WEB3INBOX_DEFAULT_URL } from "../../constants/web3inbox";
import styles from "./widget.module.css";

@customElement("w3i-widget")
export class W3iWidget extends LitElement {
  public static styles = [
    css`
      ${styles}
    `,
  ];

  // -- state & properties ------------------------------------------- //
  @property() public width? = 300;
  @property() public height? = 600;
  @property() public web3inboxUrl? = WEB3INBOX_DEFAULT_URL;

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      <iframe
        src=${this.web3inboxUrl}
        width=${this.width}
        height=${this.height}
        allow="fullscreen"
        csp="default-src 'self'"
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
