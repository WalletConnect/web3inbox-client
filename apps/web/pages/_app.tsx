import type { AppProps } from "next/app";
import { ChakraProvider, Flex, Grid, GridItem } from "@chakra-ui/react";
import { WagmiConfig } from "wagmi";
import { mainnet } from "wagmi/chains";
import { theme } from "../styles/theme";
import Footer from "../components/core/Footer";

import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi/react";
import Navbar from "../components/core/Navbar";
import { initWeb3InboxClient } from "@web3inbox/widget-react";

// 1. Get projectID at https://cloud.walletconnect.com
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID as string;
const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN as string;

if (!projectId) {
  throw new Error("You need to provide NEXT_PUBLIC_PROJECT_ID env variable");
}

// 2. Configure Web3Modal
const chains = [mainnet];
const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata: {
    name: "GM Hackers"
  }
});

initWeb3InboxClient({
  projectId,
  domain: appDomain,
  isLimited: process.env.NODE_ENV == "production",
});

createWeb3Modal({ wagmiConfig, projectId, chains });

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <ChakraProvider theme={theme}>
        <WagmiConfig config={wagmiConfig}>
          <Grid
            templateAreas={`"header" "main" "footer"`}
            w="100%"
            width="100%"
            gridTemplateRows={"100px 3f 40px"}
            gridTemplateColumns={"1fr"}
            paddingY="2em"
          >
            <GridItem area={"header"} padding={4}>
              <Navbar />
            </GridItem>
            <GridItem area={"main"} padding={10}>
              <Flex
                flexDirection={"column"}
                justifyContent={"center"}
                alignItems={"center"}
              >
                <Component {...pageProps} />
              </Flex>
            </GridItem>
            <GridItem area={"footer"}>
              <Footer />
            </GridItem>
          </Grid>
        </WagmiConfig>
      </ChakraProvider>
    </>
  );
}

export default MyApp;
