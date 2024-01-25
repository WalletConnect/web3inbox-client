import { Box, Flex, IconButton, useColorMode } from "@chakra-ui/react";
import React, { useEffect } from "react";
import Link from "next/link";
import { FaGithub, FaMoon, FaSun } from "react-icons/fa";
import { ThemeStore } from "../../utils/themeStore";

function Footer() {
  const { colorMode, toggleColorMode } = useColorMode();

  useEffect(() => {
    if (ThemeStore.state.modal) {
      ThemeStore.state.modal.setThemeMode(colorMode);
    }
  }, [colorMode]);

  return (
    <Box justifyContent="flex-end" position="fixed" right="36px" bottom="36px">
      <Flex alignItems="center" gap={2}>
        <IconButton
          aria-label="Github repo"
          size="md"
          as={Link}
          rounded="full"
          target="_blank"
          rel="noopener noreferrer"
          variant="outline"
          icon={<FaGithub />}
          href="https://github.com/WalletConnect/gm-hackers#gm-hackers-web3inbox-nextjs-wagmi-react-typescript"
        />
        <IconButton
          aria-label="toggle theme"
          size="md"
          rounded={"full"}
          onClick={toggleColorMode}
          icon={colorMode === "dark" ? <FaSun /> : <FaMoon />}
        />
      </Flex>
    </Box>
  );
}

export default Footer;
