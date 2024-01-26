import {
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Flex,
  Heading,
  Image,
  Text,
} from "@chakra-ui/react";
import {
  useNotificationTypes,
  useNotifications,
} from "@web3inbox/widget-react";
import Link from "next/link";
import React from "react";

function Messages() {
  const { data: notifications } = useNotifications(3, false);
  const { data: notificationTypes } = useNotificationTypes();

  return (
    <AccordionItem>
      <AccordionButton py="4">
        <Heading fontSize="md" as="span" flex="1" textAlign="left">
          Last Messages
        </Heading>
        <AccordionIcon />
      </AccordionButton>
      <Box overflowY="scroll" position={"relative"} maxH="400px">
        <AccordionPanel
          display="flex"
          flexDirection={"column"}
          pb={4}
          gap={2}
          position={"relative"}
        >
          {!notifications?.length ? (
            <Text>No messages yet.</Text>
          ) : (
            notifications.map(({ id, ...message }) => (
              <Alert
                as={Link}
                href={message.url ?? "#"}
                target="_blank"
                key={id}
                status="info"
                colorScheme={
                  message.type === "transactional" ? "blue" : "purple"
                }
                rounded="xl"
              >
                <AlertIcon />

                <Flex flexDir={"column"} flexGrow={1}>
                  <AlertTitle>{message.title}</AlertTitle>
                  <AlertDescription flexGrow={1}>
                    {message.body}
                  </AlertDescription>
                </Flex>
                <Flex w="60px" justifyContent="center">
                  <Image
                    src={notificationTypes?.[message.type ?? ""]?.imageUrls?.md}
                    alt="notification image"
                    height="60px"
                    rounded="full"
                    alignSelf="center"
                  />
                </Flex>
              </Alert>
            ))
          )}
        </AccordionPanel>
      </Box>
    </AccordionItem>
  );
}

export default Messages;
