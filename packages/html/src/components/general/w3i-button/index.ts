import { unsafeCSS, html, nothing, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
//@ts-ignore
import cssString from "./button.module.css";
import cx from "classnames";

export type ButtonType =
  | "action-icon"
  | "action"
  | "danger"
  | "primary"
  | "secondary";

@customElement("w3i-button")
export class W3iButton extends LitElement {
  public static styles = [unsafeCSS(cssString)];

  @property({ type: Boolean }) public disabled: boolean = false;
  @property({ type: String }) public customType: ButtonType = "primary";
  @property({ type: String }) public class: string = "";

  protected handleClick(e: Event) {
    this.dispatchEvent(e);
  }

  protected render() {
    const className = cx("Button", `Button__${this.customType}`, this.class);
    return html`<button @click=${this.handleClick} class=${className}>
      test
      <slot></slot>
    </button> `;
  }
}
