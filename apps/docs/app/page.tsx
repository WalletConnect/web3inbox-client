"use client";

import { W3iWidget, W3iContext } from "@web3inbox/widget-react";
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from "@web3modal/ethereum";
import { useWeb3Modal, Web3Button, Web3Modal } from "@web3modal/react";
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
  const { open } = useWeb3Modal();
  const [account, setAccount] = useState<string | undefined>("");

  useEffect(() => {
    setAccount(address);
  }, [address, setAccount]);

  return (
    <>
      <WagmiConfig config={wagmiConfig}>
        <W3iContext>
          <W3iWidget
            web3inboxUrl={"https://web3inbox-dev-hidden.vercel.app/"}
            account={account}
            signMessage={async (message) => {
              const rs = await signMessage({ message });
              return rs as string;
            }}
            dappIcon={
              "https://www.freeiconspng.com/uploads/purple-bird-clip-art-at-clker-com-vector-clip-art-online-royalty--10.png"
            }
            connect={open}
            dappName={"Test dapp"}
            dappNotificationsDescription={"Subscribe to get the latest info"}
            settingsEnabled={false}
            chatEnabled={false}
          />
        </W3iContext>
        <Web3Button />
        <Web3Modal
          ethereumClient={ethereumClient}
          projectId={projectId!}
        ></Web3Modal>
      </WagmiConfig>
    </>
  );
}
