import {
  AccordionItem,
  AccordionButton,
  Heading,
  AccordionIcon,
  AccordionPanel,
  Code,
} from "@chakra-ui/react";
import {
  useManageSubscription,
  useWeb3InboxClient,
} from "@web3inbox/widget-react";
import React from "react";

function Subscription() {
  const { data: w3iClient } = useWeb3InboxClient();
  const { data } = useManageSubscription();

  if (!w3iClient || !data?.subscription) {
    return null;
  }

  return (
    <AccordionItem>
      <h2>
        <AccordionButton>
          <Heading fontSize="md" as="span" flex="1" textAlign="left">
            Subscription
          </Heading>
          <AccordionIcon />
        </AccordionButton>
      </h2>
      <AccordionPanel pb={4}>
        <Code
          lang="json"
          maxW={{
            base: "280px",
            sm: "lg",
            md: "full",
          }}
        >
          <pre style={{ overflow: "scroll" }}>
            {JSON.stringify(data?.subscription, null, 2)}
          </pre>
        </Code>
      </AccordionPanel>
    </AccordionItem>
  );
}

export default Subscription;
