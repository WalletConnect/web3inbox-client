import { css, html, LitElement, PropertyValueMap } from "lit";
import { ref, createRef, Ref } from "lit/directives/ref.js";
import { customElement, property } from "lit/decorators.js";
import { WEB3INBOX_DEFAULT_URL } from "../../constants/web3inbox";
import { buildW3iUrl } from "../../utils/urlBuilder";
import {
  widgetRecentNotificationsSubject,
  widgetVisibilitySubject,
} from "../../utils/events";

@customElement("w3i-widget")
export class W3iWidget extends LitElement {
  public static styles = [
    css`
      .w3i-widget {
        position: relative;
      }

      .w3i-close-button {
        display: grid;
        place-items: center;
        position: absolute;
        right: 5%;
        top: 5%;
        width: 2em;
        height: 2em;
        z-index: 5;
        border: 0;
        outline: 0;
        cursor: pointer;
        padding: 0;
        border-radius: 50%;
        background-color: hsla(5, 85%, 60%, 1);
        transition: all 0.25s ease-in-out;
      }

      .w3i-close-button:hover {
        transform: scaleX(150%) scaleY(150%);
      }

      .w3i-close-button-foreground {
        background-color: white;
        width: 35%;
        height: 35%;
        clip-path: polygon(
          20% 0%,
          0% 20%,
          30% 50%,
          0% 80%,
          20% 100%,
          50% 70%,
          80% 100%,
          100% 80%,
          70% 50%,
          100% 20%,
          80% 0%,
          50% 30%
        );
      }

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

  // -- event handlers ------------------------------------------- //
  protected onCloseClick() {
    widgetVisibilitySubject.next(false);
  }

  // -- event dispatchers ------------------------------------------- //

  protected signMessage(message: string) {
    return new Promise<string>((resolve) => {
      const event = new CustomEvent("signMessage", {
        detail: {
          message,
          sendSignature: resolve,
        },
      });
      this.dispatchEvent(event);
    });
  }

  protected connectRequest() {
    const event = new CustomEvent("connectRequest");
    this.dispatchEvent(event);
  }

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
      <div ${ref(this.iframeRef)} class="w3i-widget">
        <button class="w3i-close-button" @click=${this.onCloseClick}>
          <div class="w3i-close-button-foreground"></div>
        </button>
        <iframe
          id="w3i"
          src=${url}
          width=${this.width}
          height=${this.height}
          loading="lazy"
          referrerpolicy="none"
        />
      </div>
    `;
  }

  // To enable communication between the iframe and the current window, we add an
  // event listener for messages. This is done in firstUpdated (which is Lit's version of
  // onMount to ensure the iframe is mounted)
  protected firstUpdated(): void {
    // This will be used in the future to enable communication from the window to the iframe

    widgetVisibilitySubject.subscribe((val) => {
      if (!this.iframeRef.value) return;

      if (val) {
        this.iframeRef.value.style.setProperty("display", "block");
        // Once user opens widget, there is no need to display a badge
        widgetRecentNotificationsSubject.next(0);
      } else {
        this.iframeRef.value.style.setProperty("display", "none");
      }
    });

    window.addEventListener("message", (message) => {
      const mData: { id: number; method: string; params: { message: string } } =
        message.data;

      switch (mData.method) {
        case "connect_request":
          this.connectRequest();
          break;
        case "external_sign_message":
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
          break;
        case "dapp_push_notification":
          widgetRecentNotificationsSubject.next(
            widgetRecentNotificationsSubject.value + 1
          );
          break;
      }
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "w3i-widget": W3iWidget;
  }
}
