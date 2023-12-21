import {
  AccordionItem,
  AccordionButton,
  Heading,
  AccordionIcon,
  AccordionPanel,
  Code,
} from "@chakra-ui/react";
import { useManageSubscription } from "@web3inbox/widget-react";
import React from "react";

function Subscription() {
  const hooksReturn = useManageSubscription();

  if (!hooksReturn.error) {
    const data = hooksReturn.data;
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
          <pre
            style={{
              overflow: "scroll",
            }}
          >
            {isLoading
              ? "Loading.."
              : JSON.stringify(error ?? data.subscription, undefined, 2)}
          </pre>
        </Code>
      </AccordionPanel>
    </AccordionItem>
  );
}

export default Subscription;
