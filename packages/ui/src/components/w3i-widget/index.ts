import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { createRef, ref, Ref } from "lit/directives/ref.js";
import { WEB3INBOX_DEFAULT_URL } from "../../constants/web3inbox";
import {
  widgetAccountSubject,
  widgetRecentNotificationsSubject,
  widgetVisibilitySubject,
} from "../../utils/events";
import { buildW3iUrl } from "../../utils/urlBuilder";

@customElement("w3i-widget")
export class W3iWidget extends LitElement {
  public static styles = [
    css`
      .w3i-widget {
        position: relative;
      }

      iframe {
        position: absolute;
        z-index: 99999;
        overflow: scroll;
        border: none;
        border-radius: 25px;
      }
    `,
  ];

  iframeRef: Ref<HTMLIFrameElement> = createRef();

  // -- state & properties ------------------------------------------- //
  @property() public width? = 360;
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

  protected subscriptionSettled() {
    const event = new CustomEvent("subscriptionSettled");
    this.dispatchEvent(event);
  }

  protected notifyMessage(message: {
    body: string;
    title: string;
    icon: string;
  }) {
    const event = new CustomEvent("notifyMessage", {
      detail: {
        message,
      },
    });
    this.dispatchEvent(event);
  }

  protected updated(changedProperties: Map<PropertyKey, unknown>): void {
    // We can't know if a new account is subscribed
    if (changedProperties.has("account")) {
      widgetAccountSubject.next({ isSubscribed: false });

      if (this.iframeRef.value) {
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
        this.iframeRef.value.src = url;
      }
    }
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
          // On new connection, reset subscription state
          widgetAccountSubject.next({ isSubscribed: false });
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
          this.notifyMessage(message.data);
          break;
        case "dapp_subscription_settled":
          this.subscriptionSettled();
          widgetAccountSubject.next({ isSubscribed: true });
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
