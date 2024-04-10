import type { NotifyClientTypes } from "@walletconnect/notify-client";
import { useEffect, useState } from "react";
import { HooksReturn, LoadingOf, SuccessOf } from "../types/hooks";
import { useWeb3InboxClient } from "./useWeb3InboxClient";

type SubscriptionState = NotifyClientTypes.NotifySubscription | null;
type UseSubscriptionReturn = HooksReturn<
  SubscriptionState,
  {
    watching: boolean;
    getSubscription: (account?: string, domain?: string) => SubscriptionState;
  }
>;

/**
 * Hook to get subscription status
 *
 * @param {string} [account] - Account to get subscriptions messages from , defaulted to current account
 * @param {string} [domain] - Domain to get subscription messages from, defaulted to one set in init.
 */
export const useSubscription = (
  account?: string,
  domain?: string
): UseSubscriptionReturn => {
  const { data: w3iClient, isLoading: isLoadingClient } = useWeb3InboxClient();

  const [subscription, setSubscription] = useState<SubscriptionState>(
    w3iClient?.getSubscription(account, domain) ?? null
  );
  const [watching, setWatching] = useState(false);

  useEffect(() => {
    if (w3iClient && !isLoadingClient) {
      setSubscription(w3iClient.getSubscription(account, domain));
    }
  }, [w3iClient, domain, account, isLoadingClient]);

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

  if (isLoadingClient) {
    return {
      data: null,
      error: null,
      isLoading: true,
      watching: false,
      getSubscription: () => null,
    } as LoadingOf<UseSubscriptionReturn>;
  }

  return {
    data: subscription,
    error: null,
    isLoading: false,
    watching,
    getSubscription: (account, domain) =>
      w3iClient!.getSubscription(account, domain),
  } as SuccessOf<UseSubscriptionReturn>;
};
