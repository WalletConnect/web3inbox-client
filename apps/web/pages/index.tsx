"use client";

import type { NextPage } from "next";
import React, { useState } from "react";
import {
  Accordion,
  Button,
  Flex,
  Heading,
  Tooltip,
  useColorMode,
  useToast,
  Card,
  CardHeader,
  CardBody,
} from "@chakra-ui/react";
import {
  useRegister,
  useSubscribe,
  useSubscription,
  useUnregister,
  useUnsubscribe,
  useWeb3InboxAccount,
  useWeb3InboxClient,
  usePrepareRegistration,
} from "@web3inbox/react";
import { useAccount, usePublicClient, useSignMessage } from "wagmi";
import { FaBell, FaBellSlash, FaPause, FaPlay } from "react-icons/fa";
import { BsSendFill } from "react-icons/bs";
import useSendNotification from "../utils/useSendNotification";
import Preferences from "../components/Preferences";
import Messages from "../components/Messages";
import Subscription from "../components/Subscription";
import Subscribers from "../components/Subscribers";
import { sendNotification } from "../utils/fetchNotify";
import { useInterval } from "usehooks-ts";

const Home: NextPage = () => {
  const { address } = useAccount();
  const { isLoading: w3iClientIsLoading } = useWeb3InboxClient();
  const { isRegistered } = useWeb3InboxAccount(
    address ? `eip155:1:${address}` : undefined
  );
  const { prepareRegistration } = usePrepareRegistration();
  const { register, isLoading: isLoadingRegister } = useRegister();
  const { unregister, isLoading: isLoadingUnregister } = useUnregister();
  const { data: subscriptionData } = useSubscription();
  const { subscribe, isLoading: isLoadingSubscribe } = useSubscribe();
  const { unsubscribe, isLoading: isLoadingUnsubscribe } = useUnsubscribe();

  const isSubscribed = Boolean(subscriptionData);

  const { signMessageAsync } = useSignMessage();
  const wagmiPublicClient = usePublicClient();

  const { colorMode } = useColorMode();
  const toast = useToast();

  const { handleSendNotification, isSending } = useSendNotification();
  const [lastBlock, setLastBlock] = useState<string>();
  const [isBlockNotificationEnabled, setIsBlockNotificationEnabled] =
    useState(true);

  const handleRegistration = async () => {
    try {
      const { message, registerParams } = await prepareRegistration();
      const signature = await signMessageAsync({ message: message });
      await register({ registerParams, signature });
    } catch (registerIdentityError: any) {
      toast({
        title: registerIdentityError?.message || "no message",
        position: "top",
        variant: "subtle",
      });
      console.error({ registerIdentityError });
    }
  };

  // handleSendNotification will send a notification to the current user and includes error handling.
  // If you don't want to use this hook and want more flexibility, you can use sendNotification.
  const handleTestNotification = async () => {
    if (isSubscribed) {
      handleSendNotification({
        title: "GM Hacker",
        body: "Hack it until you make it!",
        icon: `${window.location.origin}/WalletConnect-blue.svg`,
        url: window.location.origin,
        // ID retrieved from explorer api - Copy your notification type from WalletConnect Cloud and replace the default value below
        type: "f173f231-a45c-4dc0-aa5d-956eb04f7360",
      });
    }
  };

  // Example of how to send a notification based on some "automation".
  // sendNotification will make a fetch request to /api/notify
  const handleBlockNotification = async () => {
    if (isSubscribed && isBlockNotificationEnabled) {
      const blockNumber = await wagmiPublicClient.getBlockNumber();
      if (lastBlock !== blockNumber.toString()) {
        setLastBlock(blockNumber.toString());
        try {
          toast({
            title: "New block",
            position: "top",
            variant: "subtle",
          });
          await sendNotification({
            accounts: [`eip155:1:${address}`], // accounts that we want to send the notification to.
            notification: {
              title: "New block",
              body: blockNumber.toString(),
              icon: `${window.location.origin}/eth-glyph-colored.png`,
              url: `https://etherscan.io/block/${blockNumber.toString()}`,
              type: "f173f231-a45c-4dc0-aa5d-956eb04f7360",
            },
          });
        } catch (error: any) {
          toast({
            title: "Failed to send new block notification",
            description: error.message ?? "Something went wrong",
          });
        }
      }
    }
  };

  useInterval(() => {
    handleBlockNotification();
  }, 12000);

  return (
    <Card
      marginTop={20}
      width={"100%"}
      background={colorMode === "dark" ? "gray.800" : "gray.100"}
    >
      <CardHeader>
        <Heading size="md">Web3Inbox Interactions</Heading>
      </CardHeader>

      <CardBody>
        {w3iClientIsLoading ? (
          <Button
            leftIcon={<FaBell />}
            colorScheme="cyan"
            rounded="full"
            variant="outline"
            w="fit-content"
            alignSelf="center"
            isLoading={true}
            loadingText="Client loading..."
            isDisabled={true}
          >
            Client loading...
          </Button>
        ) : (
          <React.Fragment>
            {isSubscribed && isRegistered ? (
              <Flex flexWrap={"wrap"} alignItems="center" gap={4}>
                <Flex
                  alignItems="center"
                  justifyContent="center"
                  flexDir="column"
                >
                  <span>API Call</span>
                  <Button
                    leftIcon={<BsSendFill />}
                    variant="outline"
                    onClick={handleTestNotification}
                    colorScheme="purple"
                    rounded="full"
                    isLoading={isSending}
                    loadingText="Sending..."
                  >
                    Send test notification
                  </Button>
                </Flex>
                <Flex
                  alignItems="center"
                  justifyContent="center"
                  flexDir="column"
                >
                  <span>Internal State</span>
                  <Button
                    leftIcon={
                      isBlockNotificationEnabled ? <FaPause /> : <FaPlay />
                    }
                    variant="outline"
                    onClick={() =>
                      setIsBlockNotificationEnabled((isEnabled) => !isEnabled)
                    }
                    colorScheme={isBlockNotificationEnabled ? "orange" : "blue"}
                    rounded="full"
                  >
                    {isBlockNotificationEnabled ? "Pause" : "Resume"} block
                    notifications
                  </Button>
                </Flex>
                <Flex
                  alignItems="center"
                  justifyContent="center"
                  flexDir="column"
                >
                  <span>useUnsubscribe</span>
                  <Button
                    leftIcon={<FaBellSlash />}
                    onClick={unsubscribe}
                    variant="outline"
                    isDisabled={!address}
                    colorScheme="red"
                    isLoading={isLoadingUnsubscribe}
                    loadingText="Unsubscribing..."
                    rounded="full"
                  >
                    Unsubscribe
                  </Button>
                </Flex>
                <Flex
                  alignItems="center"
                  justifyContent="center"
                  flexDir="column"
                >
                  <span>useUnregister</span>
                  <Button
                    onClick={unregister}
                    variant="outline"
                    colorScheme="red"
                    rounded="full"
                    w="fit-content"
                    alignSelf="center"
                    isLoading={isLoadingUnregister}
                    loadingText="Unregistering..."
                    isDisabled={!Boolean(address)}
                  >
                    Unregister
                  </Button>
                </Flex>
              </Flex>
            ) : isRegistered ? (
              <React.Fragment>
                <Tooltip
                  label={
                    !Boolean(address)
                      ? "Connect your wallet first."
                      : "Register your account."
                  }
                  hidden={Boolean(address)}
                >
                  <Flex
                    alignItems="center"
                    justifyContent="center"
                    flexDir="column"
                  >
                    <span>useSubscribe</span>
                    <Button
                      leftIcon={<FaBell />}
                      onClick={() => subscribe()}
                      colorScheme="cyan"
                      rounded="full"
                      variant="outline"
                      w="fit-content"
                      alignSelf="center"
                      isLoading={isLoadingSubscribe}
                      loadingText="Subscribing..."
                      isDisabled={!Boolean(address)}
                    >
                      Subscribe
                    </Button>
                  </Flex>
                </Tooltip>
              </React.Fragment>
            ) : (
              <Tooltip
                label={
                  !Boolean(address)
                    ? "Connect your wallet first."
                    : "Register your account."
                }
                hidden={Boolean(address)}
              >
                <Flex
                  alignItems="center"
                  justifyContent="center"
                  flexDir="column"
                >
                  <span>useRegister</span>
                  <Button
                    leftIcon={<FaBell />}
                    onClick={handleRegistration}
                    colorScheme="cyan"
                    rounded="full"
                    variant="outline"
                    w="fit-content"
                    alignSelf="center"
                    isLoading={isLoadingRegister}
                    loadingText="Registering..."
                  >
                    Register
                  </Button>
                </Flex>
              </Tooltip>
            )}
          </React.Fragment>
        )}
        {isSubscribed && (
          <Accordion
            borderRadius={2}
            backgroundColor={colorMode === "dark" ? "gray.800" : "gray.100"}
            defaultIndex={[1]}
            allowToggle
            mt={10}
            rounded="xl"
            borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          >
            <Subscription />
            <Messages />
            <Preferences />
            <Subscribers />
          </Accordion>
        )}
      </CardBody>
    </Card>
  );
};

export default Home;
