"use client";

import { W3iWidget } from "@web3inbox/widget-react";

import { useWeb3Modal, Web3Button, Web3Modal } from "@web3modal/react";
import React, { useCallback, useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";

import "@web3inbox/widget-react/dist/compiled.css";

import "./style.css";

export default function Page() {
  const { address, connector } = useAccount();
  const { open: openW3m } = useWeb3Modal();
  const [account, setAccount] = useState<string | undefined>("");
  const { signMessageAsync } = useSignMessage();

  const isSSR = () => typeof window === "undefined";

  useEffect(() => {
    setAccount(address);
  }, [address, setAccount]);

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

  console.log({ address });

  return isSSR() ? (
    <></>
  ) : (
    <>
      <W3iWidget
        account={address ? `eip155:1:${address}` : null}
        onConnect={connect}
        onSign={signMessage}
      />
      <Web3Button />
    </>
  );
}
