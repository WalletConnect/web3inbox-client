"use client";

import {
  W3iWidget,
  W3iContext,
  W3iButton,
  useManageW3iWidget,
  useIsSubscribed,
} from "@web3inbox/widget-react";
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

  const { toggle: toggleW3i, isOpen, isLoaded } = useManageW3iWidget();

  console.log({ isLoaded });

  const isSubbed = useIsSubscribed();

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
            <div className="W3i" style={{ position: "relative" }}>
              <button disabled={isOpen && !isLoaded} onClick={toggleW3i}>
                Custom Button
              </button>
              <span>Is Subscribed: {isSubbed ? "yes" : "no"}</span>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ scaleX: 0, scaleY: 0 }}
                    animate={{
                      scaleX: [0, 0, 0, 0, 0.25, 0.5, 0.75, 1],
                      scaleY: [0, 0.25, 0.5, 0.75, 1, 1, 1, 1],
                      rotate: [
                        "0deg",
                        "30deg",
                        "0deg",
                        "-30deg",
                        "0deg",
                        "30deg",
                        "0",
                        "-30deg",
                        "0deg",
                      ],
                      transition: {
                        duration: 1.25,
                      },
                    }}
                    exit={{ scaleX: 0, scaleY: 0 }}
                  >
                    <W3iWidget
                      onMessage={() => console.log("Got message")}
                      onSubscriptionSettled={() => console.log("Subscribed")}
                      style={{
                        opacity: isLoaded ? 1 : 0,
                        transition: "all 0.5s ease-in-out",
                        position: "absolute",
                        zIndex: 1,
                      }}
                      web3inboxUrl={"https://web3inbox-dev-hidden.vercel.app/"}
                      account={account}
                      signMessage={async (message) => {
                        const rs = await signMessage({ message });
                        return rs as string;
                      }}
                      dappIcon={
                        "https://www.freeiconspng.com/uploads/purple-bird-clip-art-at-clker-com-vector-clip-art-online-royalty--10.png"
                      }
                      connect={openW3m}
                      dappName={"Test dapp"}
                      dappNotificationsDescription={
                        "Subscribe to get the latest info"
                      }
                      settingsEnabled={false}
                      chatEnabled={false}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Web3Button />
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
