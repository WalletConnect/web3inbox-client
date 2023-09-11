"use client";

import { W3iContext, W3iButton } from "@web3inbox/widget-react";
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from "@web3modal/ethereum";
import { useWeb3Modal, Web3Button, Web3Modal } from "@web3modal/react";
import React, { useEffect, useState } from "react";
import { signMessage } from "@wagmi/core";
import { configureChains, createConfig, useAccount, WagmiConfig } from "wagmi";
import { mainnet, polygon, optimism, arbitrum } from "wagmi/chains";
import "./style.css";
import { AnimatePresence, motion } from "framer-motion";

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
  "use client";
  const { address } = useAccount();
  const { open: openW3m } = useWeb3Modal();
  const [account, setAccount] = useState<string | undefined>("");

  useEffect(() => {
    setAccount(address);
  }, [address, setAccount]);

  return (
    <>
      <WagmiConfig config={wagmiConfig}>
        <W3iContext>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 5,
            }}
          >
            <W3iButton />
          </div>
        </W3iContext>

        <Web3Modal
          ethereumClient={ethereumClient}
          projectId={projectId!}
        ></Web3Modal>
      </WagmiConfig>
    </>
  );
}
