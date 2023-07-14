import { css, html, LitElement, PropertyValueMap } from "lit";
import { ref, createRef, Ref } from "lit/directives/ref.js";
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

  iframeRef: Ref<HTMLIFrameElement> = createRef();

  // -- state & properties ------------------------------------------- //
  @property() public width? = 400;
  @property() public height? = 600;
  @property() public web3inboxUrl = WEB3INBOX_DEFAULT_URL;
  @property() public account?: string;
  @property() public chatEnabled = "true";
  @property() public pushEnabled = "true";
  @property() public settingsEnabled = "true";
  @property({ type: Function }) signMessage:
    | ((message: string) => Promise<string>)
    | undefined = undefined;

  // -- render ------------------------------------------------------- //
  protected render() {
    const url = buildW3iUrl(this.web3inboxUrl, this.account, {
      chat: this.chatEnabled,
      push: this.pushEnabled,
      settings: this.settingsEnabled,
    });

    return html`
      <iframe
        ${ref(this.iframeRef)}
        src=${url}
        width=${this.width}
        height=${this.height}
        loading="lazy"
        referrerpolicy="none"
      />
    `;
  }

  protected firstUpdated(
    changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    const iframe = this.iframeRef.value;
    window.addEventListener("message", (message) => {
      const mData: { id: number; method: string; params: { message: string } } =
        message.data;
      if (mData.method === "external_sign_message" && this.signMessage) {
        this.signMessage(mData.params.message).then((signature) => {
          message.source?.postMessage(
            {
              id: mData.id,
              result: signature,
            },
            {
              targetOrigin: this.web3inboxUrl,
            }
          );
        });
      }
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "w3i-widget": W3iWidget;
  }
}
