import type { AppProps } from "next/app";
import {
  ChakraProvider,
  Flex,
  Grid,
  GridItem,
  useColorMode,
} from "@chakra-ui/react";
import { WagmiProvider, http } from "wagmi";
import { mainnet } from "wagmi/chains";
import { theme } from "../styles/theme";
import Footer from "../components/core/Footer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi/react";
import Navbar from "../components/core/Navbar";
import { initWeb3InboxClient } from "@web3inbox/widget-react";
import { ThemeStore } from "../utils/themeStore";
import { useEffect } from "react";
import Layout from "../components/Layout";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID as string;
const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN as string;

if (!projectId) {
  throw new Error("You need to provide NEXT_PUBLIC_PROJECT_ID env variable");
}

const wagmiConfig = defaultWagmiConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(),
  },
  projectId,
  metadata: {
    name: "GM Hackers",
    description: "GM Hackers",
    url: "https://hackers.gm.walletconnect.com/",
    icons: ["https://hackers.gm.walletconnect.com/favicon.ico"],
    verifyUrl: "https://hackers.gm.walletconnect.com/",
  },
});

const queryClient = new QueryClient();

initWeb3InboxClient({
  projectId,
  domain: appDomain,
  allApps: process.env.NODE_ENV !== "production",
});

const modal = createWeb3Modal({ wagmiConfig, projectId, chains: [mainnet] });

ThemeStore.setModal(modal);

function MyApp({ Component, pageProps }: AppProps) {
  const { colorMode } = useColorMode();

  useEffect(() => {
    if (ThemeStore.state.modal) {
      ThemeStore.state.modal.setThemeMode(colorMode);
    }
  }, [colorMode]);

  return (
    <ChakraProvider theme={theme}>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <Layout>
            <Component {...pageProps} />
            <GridItem area={"footer"}>
              <Footer />
            </GridItem>
          </Layout>
        </QueryClientProvider>
      </WagmiProvider>
    </ChakraProvider>
  );
}

export default MyApp;
