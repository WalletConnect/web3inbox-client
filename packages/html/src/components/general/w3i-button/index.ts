import { css, html, nothing, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
//@ts-ignore
import cssExports from "!raw-loader!./button.module.css";

@customElement("w3i-button")
export class W3iButton extends LitElement {
  public static styles = [];

  protected render() {
    console.log({ cssExports: JSON.stringify(cssExports) });
    return html`<button>test</button> `;
  }
}
