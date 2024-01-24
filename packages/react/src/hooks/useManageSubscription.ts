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
    data: w3iClient,
    isLoading: clientLoading,
    error: clientError,
  } = useWeb3InboxClient();

  const [subscription, setSubscription] =
    useState<NotifyClientTypes.NotifySubscription | null>(
      w3iClient?.getSubscription(account, domain) ?? null
    );

  const [watching, setWatching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);

  useEffect(() => {
    if (w3iClient && !clientLoading) {
      setSubscription(w3iClient.getSubscription(account, domain));
    }
  }, [w3iClient, clientLoading]);

  useEffect(() => {
    console.log({ w3iClient });
    if (!w3iClient || watching) return;

    const stopWatching = w3iClient.watchSubscription(
      (sub) => {
        setSubscription(sub);
      },
      account,
      domain
    );

    setWatching(true);
    setSubscription(w3iClient.getSubscription(account, domain));

    return () => {
      setWatching(false);
      stopWatching();
    };
  }, [account, domain, w3iClient]);

  const subscribe = async () => {
    if (!w3iClient) {
      throw new Error("Web3InboxClient is not ready, cannot subscribe");
    }

    setIsSubscribing(true);

    try {
      await w3iClient.subscribeToDapp(account, domain);
    } catch (e) {
      console.error("Failed to subscribe", e);
      setError(`Failed to subscribe ${e}`);
    } finally {
      setIsSubscribing(false);
    }
  };

  const unsubscribe = async () => {
    if (!w3iClient) {
      throw new Error("Web3InboxClient is not ready, cannot unsubscribe");
    }

    setIsUnsubscribing(true);

    try {
      await w3iClient.unsubscribeFromDapp(account, domain);
    } catch (e) {
      console.error("Failed to unsubscribe", e);
      setError("Failed to unsubscribe");
    } finally {
      setIsUnsubscribing(false);
    }
  };

  if (!w3iClient) {
    return {
      data: null,
      isLoading: false,
      error: null,
      unsubscribe,
      subscribe,
    } as LoadingOf<ManageSubscriptionReturn>;
  }

  if (clientError) {
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

  const data = {
    isSubscribing,
    isUnsubscribing,
    subscription,
    isSubscribed: Boolean(subscription),
  };

  return {
    data,
    isLoading: false,
    error: null,
    unsubscribe,
    subscribe,
  } as SuccessOf<ManageSubscriptionReturn>;
};
