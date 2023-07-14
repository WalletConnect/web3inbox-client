"use client";

import { W3iWidget, W3iContext } from "@web3inbox/react-widget";
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from "@web3modal/ethereum";
import { Web3Button, Web3Modal } from "@web3modal/react";
import React from "react";
import { signMessage } from "@wagmi/core";
import {
  configureChains,
  createConfig,
  useAccount,
  useSignMessage,
  WagmiConfig,
} from "wagmi";
import { mainnet, polygon, optimism, arbitrum } from "wagmi/chains";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

const chains = [mainnet, polygon, optimism, arbitrum];
const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient,
});

export const ethereumClient = new EthereumClient(wagmiConfig, chains);

export default function Page() {
  const account = useAccount();
  return (
    <>
      <WagmiConfig config={wagmiConfig}>
        <W3iContext>
          <W3iWidget
            web3inboxUrl="https://merely-introductory-tooth-inns.trycloudflare.com"
            account={account.address}
            signMessage={async (message) => {
              const rs = await signMessage({ message });
              return rs as string;
            }}
            chatEnabled={false}
          />
        </W3iContext>
        <Web3Button />
        <Web3Modal
          ethereumClient={ethereumClient}
          projectId={projectId}
        ></Web3Modal>
      </WagmiConfig>
    </>
  );
}
