import type { NotifyClientTypes } from "@walletconnect/notify-client";
import { useSubscriptionState } from "@web3inbox/core";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ErrorOf, HooksReturn, LoadingOf, SuccessOf } from "../types/hooks";
import { useWeb3InboxClient } from "./useWeb3InboxClient";

type AllSubscriptionsReturn = HooksReturn<{
  subscriptions: NotifyClientTypes.NotifySubscription[];
}>;
/**
 * Hook to get all subscriptions of an account
 *
 * @param {string} [account] - Account to get subscriptions from, defaulted to current account
 */
export const useAllSubscriptions = (
  account?: string
): AllSubscriptionsReturn => {
  const { data: web3inboxClientData, error } = useWeb3InboxClient();
  const { subscriptions: subscriptionsTrigger } = useSubscriptionState();
  const [subscriptions, setSubscriptions] = useState<
    NotifyClientTypes.NotifySubscription[]
  >([]);

  useEffect(() => {
    if (web3inboxClientData?.client) {
      setSubscriptions(web3inboxClientData?.client.getSubscriptions(account));
    }
  }, [subscriptionsTrigger, account, web3inboxClientData]);

  const result: AllSubscriptionsReturn = useMemo(() => {
    if (!web3inboxClientData) {
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
      data: { subscriptions },
      isLoading: false,
      error: null,
    } as SuccessOf<AllSubscriptionsReturn>;
  }, [web3inboxClientData, error]);

  return result;
};
