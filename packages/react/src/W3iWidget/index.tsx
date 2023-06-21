import React from "react";
import type { W3iWidget as HtmlW3iWidget } from "@web3inbox/ui";

interface W3iWidgetProps {
  width?: number;
  height?: number;
  web3inboxUrl?: string;
  account?: string;
  chatEnabled?: boolean;
  pushEnabled?: boolean;
  settingsEnabled?: boolean;
}

const htmlifyParams = (
  params: W3iWidgetProps
): { [k: string]: number | string } => {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "boolean") {
        return [key, JSON.stringify(value)];
      }
      return [key, value];
    })
  );
};

const W3iWidget: React.FC<W3iWidgetProps> = (props) => {
  return <w3i-widget {...htmlifyParams(props)} />;
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
