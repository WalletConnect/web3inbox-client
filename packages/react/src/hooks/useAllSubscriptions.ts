import type { NotifyClientTypes } from "@walletconnect/notify-client";
import { useEffect, useState } from "react";
import { ErrorOf, HooksReturn, LoadingOf, SuccessOf } from "../types/hooks";
import { useWeb3InboxClient } from "./useWeb3InboxClient";
import { useSubscriptionState } from "../utils/snapshots";

type AllSubscriptionsReturn = HooksReturn<
  NotifyClientTypes.NotifySubscription[]
>;

/**
 * Hook to get all subscriptions of an account
 *
 * @param {string} [account] - Account to get subscriptions from, defaulted to current account
 */
export const useAllSubscriptions = (
  account?: string
): AllSubscriptionsReturn => {
  const { data: w3iClient, error } = useWeb3InboxClient();
  const { subscriptions: subscriptionsTrigger } = useSubscriptionState();
  const [subscriptions, setSubscriptions] = useState<
    NotifyClientTypes.NotifySubscription[]
  >([]);

  useEffect(() => {
    if (w3iClient) {
      setSubscriptions(w3iClient.getSubscriptions(account));
    }
  }, [account, subscriptionsTrigger, w3iClient]);

  if (!w3iClient) {
    return {
      data: null,
      isLoading: true,
      error: null,
    } as LoadingOf<AllSubscriptionsReturn>;
  }

  if (error) {
    return {
      data: null,
      isLoading: false,
      error: {
        client: error.client,
      },
    } as ErrorOf<AllSubscriptionsReturn>;
  }

  return {
    data: subscriptions,
    isLoading: false,
    error: null,
  } as SuccessOf<AllSubscriptionsReturn>;
};
