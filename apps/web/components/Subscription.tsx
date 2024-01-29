import {
  AccordionItem,
  AccordionButton,
  Heading,
  AccordionIcon,
  AccordionPanel,
  Code,
  useColorMode,
} from "@chakra-ui/react";
import { useSubscription, useWeb3InboxClient } from "@web3inbox/react";
import React from "react";

function Subscription() {
  const { colorMode } = useColorMode();
  const { data: w3iClient } = useWeb3InboxClient();
  const { data } = useSubscription();

  if (!w3iClient || !data) {
    return null;
  }

  return (
    <AccordionItem border="none">
      <AccordionButton py="4">
        <Heading fontSize="md" as="span" flex="1" textAlign="left">
          Subscription (useSubscription)
        </Heading>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4}>
        <Code
          lang="json"
          p={4}
          borderRadius={4}
          maxW={{
            base: "280px",
            sm: "lg",
            md: "full",
          }}
        >
          <pre style={{ overflow: "scroll" }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </Code>
      </AccordionPanel>
    </AccordionItem>
  );
}

export default Subscription;
