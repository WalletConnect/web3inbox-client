import { useSnapshot } from "valtio";
import { Web3InboxClient } from "../client";

export const useSubscriptionState = () => {
  return useSnapshot(Web3InboxClient.subscriptionState);
};

export const useClientState = () => {
  return useSnapshot(Web3InboxClient.clientState);
};

export const useViewState = () => {
  return useSnapshot(Web3InboxClient.view);
};
