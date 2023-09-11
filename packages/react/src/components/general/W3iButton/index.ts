import React from "react";
import { W3iButton as HtmlW3iButton } from "@web3inbox/widget-html";

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

const W3iButton: React.FC<{}> = () => {
  const thing = 1;

  return <w3i-button></w3i-button>;
};

export default W3iButton;
