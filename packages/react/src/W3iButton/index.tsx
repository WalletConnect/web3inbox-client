import React from "react";
import { W3iWidgetButton as HtmlW3iWidgetButton } from "@web3inbox/widget-html";

interface W3iButtonProps {
  theme?: "light" | "dark";
}

const W3iButton: React.FC<W3iButtonProps> = ({ theme }) => {
  return <w3i-widget-button theme={theme}></w3i-widget-button>;
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
