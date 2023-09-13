"use client";

import * as W3iCore from "@web3inbox/core";
import { W3iWidget } from "@web3inbox/widget-react";

import { useWeb3Modal, Web3Button, Web3Modal } from "@web3modal/react";
import React, { useCallback, useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";

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
    console.log({ signingIn: true, connector });
    if (!connector) return openW3m();
    try {
      const connected = await connector.connect({
        chainId: 1,
      });
      console.log({ connected });
    } catch (error) {
      console.log({ error });
    }
  }, [connector, openW3m]);

  return isSSR() ? (
    <></>
  ) : (
    <>
      <W3iWidget />
      <Web3Button />
    </>
  );
}
