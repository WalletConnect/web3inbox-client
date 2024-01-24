import type { NotifyClientTypes } from "@walletconnect/notify-client";
import { useEffect, useState } from "react";
import { HooksReturn, SuccessOf } from "../types/hooks";
import { useWeb3InboxClient } from "./useWeb3InboxClient";

type SubscriptionState = NotifyClientTypes.NotifySubscription | null;
type ManageSubscriptionReturn = HooksReturn<
  {
    isSubscribed: boolean;
    isSubscribing: boolean;
    isUnsubscribing: boolean;
    errorSubscribe: string | null;
    errorUnsubscribe: string | null;
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
  const { data: w3iClient, isLoading: isLoadingClient } = useWeb3InboxClient();

  const [subscription, setSubscription] = useState<SubscriptionState>(
    w3iClient?.getSubscription(account, domain) ?? null
  );

  const [watching, setWatching] = useState(false);
  const [errorSubscribe, setErrorSubscribe] = useState<string | null>(null);
  const [errorUnsubscribe, setErrorUnsubscribe] = useState<string | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);

  useEffect(() => {
    if (w3iClient && !isLoadingClient) {
      setSubscription(w3iClient.getSubscription(account, domain));
    }
  }, [w3iClient, isLoadingClient]);

  useEffect(() => {
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
    setIsSubscribing(true);

    return new Promise<void>(async (resolve, reject) => {
      if (!w3iClient) {
        reject(new Error("Web3InboxClient is not ready, cannot subscribe"));
      } else {
        await w3iClient
          .subscribeToDapp(account, domain)
          .then((res) => {
            resolve(res);
          })
          .catch((e) => {
            setErrorSubscribe(e?.message ?? "Failed to subscribe");
            reject(e);
          })
          .finally(() => {
            setIsSubscribing(false);
          });
      }
    });
  };

  const unsubscribe = async () => {
    setIsUnsubscribing(true);

    return new Promise<void>(async (resolve, reject) => {
      if (!w3iClient) {
        reject(new Error("Web3InboxClient is not ready, cannot unsubscribe"));
      } else {
        await w3iClient
          .unsubscribeFromDapp(account, domain)
          .then((res) => {
            resolve(res);
          })
          .catch((e) => {
            setErrorUnsubscribe(e?.message ?? "Failed to unsubscribe");
            reject(e);
          })
          .finally(() => {
            setIsUnsubscribing(false);
          });
      }
    });
  };

  const data = {
    isSubscribing,
    isSubscribed: Boolean(subscription),
    isUnsubscribing,
    errorSubscribe,
    errorUnsubscribe,
    subscription,
  };

  return {
    data,
    error: null,
    isLoading: false,
    unsubscribe,
    subscribe,
  } as SuccessOf<ManageSubscriptionReturn>;
};
