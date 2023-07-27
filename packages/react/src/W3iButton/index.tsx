import React from "react";
import { W3iWidgetButton as HtmlW3iWidgetButton } from "@web3inbox/widget-html";

interface W3iButtonProps {}

const W3iButton: React.FC<W3iButtonProps> = (props) => {
  return <w3i-widget-button></w3i-widget-button>;
};

/**
 * Types
 */
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "w3i-widget-button": Partial<HtmlW3iWidgetButton>;
    }
  }
}

export default W3iButton;
