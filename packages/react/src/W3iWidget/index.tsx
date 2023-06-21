import React from "react";
import type { W3iWidget as HtmlW3iWidget } from "@web3inbox/ui";

interface W3iWidgetProps {
  width?: number;
  height?: number;
  web3inboxUrl?: string;
}

const W3iWidget: React.FC<W3iWidgetProps> = (props) => {
  return <w3i-widget {...props} />;
};

/**
 * Types
 */
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "w3i-widget": Partial<HtmlW3iWidget>;
    }
  }
}

export default W3iWidget;
