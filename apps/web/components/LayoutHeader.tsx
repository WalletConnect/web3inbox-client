import {
  Stack,
  HStack,
  Spacer,
  Link as CLink,
  Text,
  Flex,
  useColorMode,
} from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";

export function LayoutHeader() {
  const { colorMode } = useColorMode();

  return (
    <Stack
      direction={["column", "column", "column", "row"]}
      marginBlockStart={10}
      justifyContent="center"
    >
      <Link href="/">
        <Flex gap={4}>
          <Image
            alt="Web3Inbox logo"
            src="/logo.png"
            width={32}
            height={32}
            style={{ minWidth: 32, maxHeight: 32 }}
          />
          <Text
            fontSize={"2xl"}
            fontWeight={600}
            color={colorMode === "dark" ? "#4EDDC4" : "#089C96"}
          >
            Web3Inbox Hooks Playground
          </Text>
        </Flex>
      </Link>

      <Spacer />

      <HStack
        spacing={5}
        marginRight={[0, 0, 5]}
        marginTop={[3, 3, 0]}
        marginBottom={[3, 3, 0]}
      >
        <CLink
          isExternal
          href="https://github.com/WalletConnect/web3inbox-widget"
        >
          GitHub
        </CLink>
        <CLink isExternal href="https://docs.walletconnect.com/web3inbox/about">
          Docs
        </CLink>
        <w3m-button label="Connect Wallet" balance="show" />
      </HStack>
    </Stack>
  );
}
