import { css, html, LitElement } from "lit";
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
  @property() public dappName: string = "";
  @property() public dappIcon: string = "";
  @property() public dappNotificationsDescription: string = "";
  @property() public account?: string;
  @property() public chatEnabled = "true";
  @property() public pushEnabled = "true";
  @property() public settingsEnabled = "true";
  @property({ type: Function }) signMessage:
    | ((message: string) => Promise<string>)
    | undefined = undefined;

  // -- render ------------------------------------------------------- //
  protected render() {
    const url = buildW3iUrl(
      this.web3inboxUrl,
      {
        name: this.dappName,
        icon: this.dappIcon,
        description: this.dappNotificationsDescription,
      },
      this.account,
      {
        chat: this.chatEnabled,
        push: this.pushEnabled,
        settings: this.settingsEnabled,
      }
    );

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

  // To enable communication between the iframe and the current window, we add an
  // event listener for messages. This is done in firstUpdated (which is Lit's version of
  // onMount to ensure the iframe is mounted)
  protected firstUpdated(): void {
    // This will be used in the future to enable communication from the window to the iframe
    const iframe = this.iframeRef.value;

    window.addEventListener("message", (message) => {
      const mData: { id: number; method: string; params: { message: string } } =
        message.data;
      if (mData.method === "external_sign_message" && this.signMessage) {
        // Use the externally provided `signMessage` to sign. We are agnostic to how the parent dapp will
        // sign.
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
