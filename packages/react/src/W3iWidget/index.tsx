"use client";

import React, { useEffect, useRef } from "react";
import { W3iWidget as HtmlW3iWidget } from "@web3inbox/widget-html";

interface W3iWidgetProps {
  width?: number;
  height?: number;
  web3inboxUrl?: string;
  account?: string;
  chatEnabled?: boolean;
  pushEnabled?: boolean;
  settingsEnabled?: boolean;
  signMessage: (message: string) => Promise<string>;
  connect: () => void;
  dappName: string;
  dappIcon: string;
  dappNotificationsDescription: string;
}

const htmlifyParams = (
  params: W3iWidgetProps
): { [k: string]: number | string } => {
  return Object.fromEntries(
    Object.entries(params)
      .filter(([_, v]) => typeof v !== "function")
      .map(([key, value]) => {
        if (typeof value === "boolean") {
          return [key, JSON.stringify(value)];
        }
        return [key, value];
      })
  );
};

const W3iWidget: React.FC<W3iWidgetProps> = (props) => {
  const { signMessage, connect } = props;
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!spanRef.current) return;

    const w3iWidget = spanRef.current.firstChild;

    if (!w3iWidget) return;

    const sign = (e: Event) => {
      const { detail } = e as CustomEvent;
      signMessage(detail.message).then(detail.sendSignature);
    };

    const connectWallet = () => {
      connect();
    };

    // Since functions can't be encoded or "stringified", they have to injected directly into widget
    w3iWidget.addEventListener("signMessage", sign);
    w3iWidget.addEventListener("connectRequest", connectWallet);

    return () => {
      w3iWidget.removeEventListener("signMessage", sign);
      w3iWidget.removeEventListener("connectRequest", connectWallet);
    };
  }, [signMessage, connect, spanRef]);

  return (
    <span ref={spanRef}>
      <w3i-widget id="w3i-widget" {...htmlifyParams(props)} />
    </span>
  );
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
