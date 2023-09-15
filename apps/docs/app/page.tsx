"use client";

import { useManageView } from "@web3inbox/widget-react";
// import { W3iWidget } from "@web3inbox/widget-react";

import { useWeb3Modal, Web3Button, Web3Modal } from "@web3modal/react";
import React, { useCallback, useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";

// import "@web3inbox/widget-react/dist/compiled.css";

import "./style.css";
import dynamic from "next/dynamic";

const W3iWidget = dynamic(
  () => import("@web3inbox/widget-react").then((w3i) => w3i.W3iWidget),
  {
    ssr: false,
  }
);

export default function Page() {
  const { address, connector } = useAccount();
  const { open: openW3m } = useWeb3Modal();
  const { open: openW3i } = useManageView();
  const [account, setAccount] = useState<string | undefined>("");
  const { signMessageAsync } = useSignMessage();

  const isSSR = () => typeof window === "undefined";

  useEffect(() => {
    setAccount(address);
    if (address) {
      openW3i();
    }
  }, [address, setAccount, openW3i]);

  const signMessage = useCallback(
    async (message: string) => {
      const res = await signMessageAsync({
        message,
      });

      return res as string;
    },
    [signMessageAsync]
  );

  const connect = useCallback(async () => {
    if (!connector) {
      openW3m();
      return;
    }

    const connected = await connector.connect({
      chainId: 1,
    });

    return Promise.resolve(connected.account!);
  }, [connector, openW3m]);

  return (
    <>
      <W3iWidget
        projectId="bd957d557fbce8c94ee111632cf9f58f"
        account={address ? `eip155:1:${address}` : null}
        domain="dev.gm.walletconnect.com"
        onConnect={connect}
        onSign={signMessage}
      />
      <div>Hello World</div>
      <Web3Button />
    </>
  );
}
