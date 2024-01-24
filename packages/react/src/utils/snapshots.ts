import { Web3InboxClient, valtio } from "@web3inbox/core";

export const useSubscriptionState = () => {
  return valtio.useSnapshot(Web3InboxClient.subscriptionState);
};

export const useClientState = () => {
  return valtio.useSnapshot(Web3InboxClient.clientState);
};
