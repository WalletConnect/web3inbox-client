"use client";

import * as W3iCore from "@web3inbox/core";
import { W3iWidget } from "@web3inbox/widget-react";
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from "@web3modal/ethereum";
import { useWeb3Modal, Web3Modal } from "@web3modal/react";
import "events";
import React, { useEffect, useState } from "react";
import { configureChains, createConfig, useAccount, WagmiConfig } from "wagmi";
import { mainnet, polygon, optimism, arbitrum } from "wagmi/chains";
import "./style.css";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

if (!projectId) {
  throw new Error("NEXT_PUBLIC_PROJECT_ID needs to be provided");
}

const chains = [mainnet, polygon, optimism, arbitrum];
const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient,
});

const ethereumClient = new EthereumClient(wagmiConfig, chains);

export default function Page() {
  const { address } = useAccount();
  const { open: openW3m } = useWeb3Modal();
  const [account, setAccount] = useState<string | undefined>("");

  const isSSR = () => typeof window === "undefined";

  useEffect(() => {
    setAccount(address);
  }, [address, setAccount]);

  return isSSR() ? (
    <></>
  ) : (
    <>
      <W3iWidget />
      <WagmiConfig config={wagmiConfig}>
        <Web3Modal
          ethereumClient={ethereumClient}
          projectId={projectId!}
        ></Web3Modal>
      </WagmiConfig>
    </>
  );
}
