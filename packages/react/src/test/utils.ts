import { Web3InboxClient, valtio } from "@web3inbox/core";

export async function wait(time: number) {
  return new Promise((res) => setTimeout(res, time));
}

export async function resetSingletonState() {
  Web3InboxClient.subscriptionState = valtio.proxy({
    subscriptions: [],
    messages: [],
  });
  Web3InboxClient.instance = null;
  Web3InboxClient.clientState = valtio.proxy({
    isReady: false,
    initting: false,
    account: undefined,
    registration: undefined,
  });
}

