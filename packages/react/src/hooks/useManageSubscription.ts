import type { NotifyClientTypes } from "@walletconnect/notify-client";
import { useCallback, useEffect, useState } from "react";
import { ErrorOf, HooksReturn, LoadingOf, SuccessOf } from "../types/hooks";
import { useWeb3InboxClient } from "./useWeb3InboxClient";

type ManageSubscriptionReturn = HooksReturn<
  {
    isSubscribed: boolean;
    isSubscribing: boolean;
    isUnsubscribing: boolean;
    subscription: NotifyClientTypes.NotifySubscription | null;
  },
  {
    unsubscribe: () => Promise<void>;
    subscribe: () => Promise<void>;
  },
  "unsubscribe" | "subscribe"
>;
/**
 * Hook to manage a subscribe, unsubscribe and get subscription
 *
 * @param {string} [account] - Account to get subscriptions messages from , defaulted to current account
 * @param {string} [domain] - Domain to get subscription messages from, defaulted to one set in init.
 */
export const useManageSubscription = (
  account?: string,
  domain?: string
): ManageSubscriptionReturn => {
  const {
    data: web3inboxClientData,
    isLoading: isClientLoading,
    error: clientError,
  } = useWeb3InboxClient();

  const [subscription, setSubscription] =
    useState<NotifyClientTypes.NotifySubscription | null>(
      web3inboxClientData?.client.getSubscription(account, domain) ?? null
    );

  const [error, setError] = useState<string | null>(null);

  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);

  useEffect(() => {
    if (!web3inboxClientData) return;

    const stopWatching = web3inboxClientData.client?.watchSubscription(
      (sub) => {
        console.log(">>> watcher");
        setSubscription(sub);
      },
      account,
      domain
    );

    setSubscription(
      web3inboxClientData.client.getSubscription(account, domain)
    );

    return stopWatching;
  }, [web3inboxClientData, isClientLoading, account, domain]);

  const subscribe = useCallback(async () => {
    if (web3inboxClientData) {
      setIsSubscribing(true);
      try {
        console.log(">>> subscribing to", account, domain);
        await web3inboxClientData.client.subscribeToDapp(account, domain);
      } catch (e) {
        console.error("Failed to subscribe", e);
        setError(`Failed to subscribe ${e}`);
      } finally {
        setIsSubscribing(false);
      }
    } else {
      console.log(
        ">>> subscribing to",
        "Trying to subscribe before Web3Inbox Client was initialized"
      );
      console.error(
        "Trying to subscribe before Web3Inbox Client was initialized"
      );
    }
  }, [web3inboxClientData, account, domain]);

  const unsubscribe = useCallback(async () => {
    if (web3inboxClientData) {
      setIsUnsubscribing(true);
      try {
        await web3inboxClientData.client.unsubscribeFromDapp(account, domain);
      } catch (e) {
        console.error("Failed to unsubscribe", e);
        setError("Failed to unsubscribe");
      } finally {
        setIsUnsubscribing(false);
      }
    } else {
      console.error(
        "Trying to unsubscribe before Web3Inbox Client was initialized"
      );
    }
  }, [web3inboxClientData, account, domain]);

  if (!web3inboxClientData) {
    console.log(">>> useManageData no client data");
    return {
      data: null,
      isLoading: false,
      error: null,
      unsubscribe,
      subscribe,
    } as LoadingOf<ManageSubscriptionReturn>;
  }

  if (clientError) {
    console.log(">>> useManageData client error");
    return {
      data: null,
      isLoading: false,
      error: {
        client: clientError.client,
        subscribe: { message: error },
        unsubscribe: { message: error },
      },

      unsubscribe,
      subscribe,
    } as ErrorOf<ManageSubscriptionReturn>;
  }

  if (error) {
    console.log(">>> useManageData error", error);
    return {
      data: null,
      isLoading: false,
      error: {
        subscribe: { message: error },
        unsubscribe: { message: error },
      },
      unsubscribe,
      subscribe,
    } as ErrorOf<ManageSubscriptionReturn>;
  }

  return {
    data: {
      isSubscribing,
      isUnsubscribing,
      subscription,
      isSubscribed: Boolean(subscription),
    },
    isLoading: false,
    error: null,
    unsubscribe,
    subscribe,
  } as SuccessOf<ManageSubscriptionReturn>;
};
