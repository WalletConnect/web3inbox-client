"use client";

import { W3iWidget, W3iContext } from "@web3inbox/react-widget";
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from "@web3modal/ethereum";
import { Web3Button, Web3Modal } from "@web3modal/react";
import React, { useEffect, useState } from "react";
import { signMessage } from "@wagmi/core";
import {
  configureChains,
  createConfig,
  useAccount,
  useSignMessage,
  WagmiConfig,
} from "wagmi";
import { mainnet, polygon, optimism, arbitrum } from "wagmi/chains";
import "./style.css";

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
  "use client";
  const { address } = useAccount();
  const [account, setAccount] = useState("");

  useEffect(() => {
    setAccount(address);
  }, [address, setAccount]);

  return (
    <>
      <WagmiConfig config={wagmiConfig}>
        <W3iContext>
          <W3iWidget
            web3inboxUrl="https://exterior-families-profiles-yourself.trycloudflare.com"
            account={account}
            signMessage={async (message) => {
              const rs = await signMessage({ message });
              return rs as string;
            }}
            dappIcon={
              "https://icons.iconarchive.com/icons/hopstarter/gloss-mac/512/Get-Info-icon.png"
            }
            dappName={"Test dapp"}
            dappNotificationsDescription={"Subscribe to get the latest info"}
            settingsEnabled={false}
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
