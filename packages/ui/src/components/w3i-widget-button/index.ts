import { css, html, LitElement } from "lit";
import { ref, createRef, Ref } from "lit/directives/ref.js";
import { customElement, property, state } from "lit/decorators.js";
import { buildW3iUrl } from "../../utils/urlBuilder";

@customElement("w3i-widget-button")
export class W3iWidgetButton extends LitElement {
  public static styles = [css``];
  @property() public widgetId: string = "";
  @state() public widgetRef: HTMLElement | null = null;

  protected onClick(): void {
    if (!this.widgetRef) return;

    const currentDisplay = this.widgetRef.style.display;
    const set = (mode: "none" | "block") =>
      this.widgetRef!.style.setProperty("display", mode);

    switch (currentDisplay) {
      case "block":
        set("none");
      case "none":
        set("block");
    }
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`<button @click=${this.onClick}>Trigger Widget</button>`;
  }

  protected firstUpdated(): void {
    this.widgetRef = document.getElementById(this.widgetId);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "w3i-widget-button": W3iWidgetButton;
  }
}
