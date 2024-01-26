import { Web3InboxClient } from "@web3inbox/core";
import { proxy } from "valtio";

export const resetSingletonState = () => {
  Web3InboxClient.subscriptionState = proxy({
    subscriptions: [],
    messages: [],
  });
  Web3InboxClient.instance = null;
  Web3InboxClient.clientState = proxy({
    isReady: false,
    initting: false,
    account: undefined,
    registration: undefined,
  });
};
