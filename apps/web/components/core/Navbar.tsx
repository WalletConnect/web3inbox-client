import { Flex, Img, Text, useTheme } from "@chakra-ui/react";
import React from "react";
import { NavLink } from "./NavLink";
import Image from "next/image";

function Navbar() {
  return (
    <Flex alignItems="center" justifyContent={"space-between"} w="full">
      <Flex gap={4} alignItems="center">
        <Image alt="Web3Inbox logo" src="/logo.png" width={32} height={32} />
        <Text
          fontSize="lg"
          fontWeight={600}
          display={{ base: "hidden", md: "flex" }}
        >
          Web3Inbox Hooks Playground
        </Text>
      </Flex>
      <w3m-button label="Connect Wallet" balance="show" />
    </Flex>
  );
}

export default Navbar;
