import React from "react";
import { W3iButton as HtmlW3iButton } from "@web3inbox/widget-html";

const W3iButton: React.FC<{}> = () => {
  return <w3i-button></w3i-button>;
};

/**
 * Types
 */
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "w3i-button": Partial<HtmlW3iButton>;
    }
  }
}

export default W3iButton;
