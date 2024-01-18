import type { NotifyClientTypes } from "@walletconnect/notify-client";
import { useSubscriptionState } from "@web3inbox/core";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useWeb3InboxClient } from "./web3inboxClient";
import { ErrorOf, HooksReturn, LoadingOf, SuccessOf } from "../types/hooks";

type NotificationsReturn = HooksReturn<
  {
    notifications: NotifyClientTypes.NotifyMessage[],
    hasMore: boolean
  },
  {
    nextPage: () => void;
  },
  "getMessages"
>;
/**
 * Hook to watch notifications of a subscription, and delete them
 *
 * @param {string} [account] - Account to get subscriptions messages from, defaulted to current account
 * @param {string} [domain] - Domain to get subscription messages from, defaulted to one set in init.
 */
export const useNotifications = (
  notificationsPerPage: number,
  isInfiniteScroll?: boolean,
  account?: string,
  domain?: string
): NotificationsReturn => {
  const { data: web3inboxClientData, error: clientError } =
    useWeb3InboxClient();

  const [notifications, setNotifications] = useState<SuccessOf<NotificationsReturn>['data']>();

  const [nextPage, setNextPage] = useState<() => void>(() => {})

  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    if (!web3inboxClientData) return;

    try {
      const {nextPage: nextPageFunc, stopWatchingNotifications} = web3inboxClientData
        .client
        .pageNotifications(
          notificationsPerPage,
          isInfiniteScroll,
          account,
          domain
        )(setNotifications)
   
      setNextPage(nextPageFunc);
  
      return () => stopWatchingNotifications();
    }
    catch(e: any) {
      setError(e.message)
    }


  }, [web3inboxClientData, account, domain]);


  const result: NotificationsReturn = useMemo(() => {
    if (!web3inboxClientData) {
      return { data: null, error: null, isLoading: true, nextPage };
    }

    if (clientError) {
      return {
        data: null,
        error: {
          client: clientError.client,
        },
        isLoading: false,
	nextPage
      } as ErrorOf<NotificationsReturn>;
    }

    if (error) {
      return {
        data: null,
        error: {getMessages: {message: error}},
        isLoading: false,
	nextPage
      } as ErrorOf<NotificationsReturn>;
    }

    return {
      data: notifications,
      error: null,
      isLoading: false,
      nextPage,
    } as SuccessOf<NotificationsReturn>;
  }, [web3inboxClientData, nextPage, notifications, clientError, error]);

  return result;
};

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
  const { data: web3inboxClientData, error: clientError } =
    useWeb3InboxClient();
  const { subscriptions: subscriptionsTrigger } = useSubscriptionState();

  const [subscription, setSubscription] =
    useState<NotifyClientTypes.NotifySubscription | null>(
      web3inboxClientData?.client.getSubscription(account, domain) ?? null
    );

  const [error, setError] = useState<string | null>(null);

  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);

  useEffect(() => {
    if (!web3inboxClientData) return;

    setSubscription(
      web3inboxClientData.client.getSubscription(account, domain)
    );
  }, [web3inboxClientData, subscriptionsTrigger, account, domain]);

  const subscribe = useCallback(async () => {
    if (web3inboxClientData) {
      setIsSubscribing(true);
      try {
	console.log(">>> subscribing to", account, domain)
        await web3inboxClientData.client.subscribeToDapp(account, domain);
      } catch (e) {
        console.error("Failed to subscribe", e);
        setError("Failed to subscribe");
      } finally {
        setIsSubscribing(false);
      }
    } else {
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

  const result: ManageSubscriptionReturn = useMemo(() => {
    if (!web3inboxClientData) {
      return {
        data: null,
        isLoading: true,
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
  }, [web3inboxClientData, subscription, isSubscribing, isUnsubscribing, error, clientError]);

  return result;
};

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

type SubscriptionScopesReturn = HooksReturn<
  { scopes: NotifyClientTypes.ScopeMap },
  {
    updateScopes: (scope: string[]) => Promise<boolean>;
  },
  "updateScopes"
>;

export const useSubscriptionScopes = (
  account?: string,
  domain?: string
): SubscriptionScopesReturn => {
  const { data: web3inboxClientData, error: clientError } =
    useWeb3InboxClient();
  const { subscriptions: subscriptionsTrigger } = useSubscriptionState();
  const [subScopes, setSubScopes] = useState<NotifyClientTypes.ScopeMap>(
    web3inboxClientData?.client.getNotificationTypes(account) ?? {}
  );

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (web3inboxClientData?.client) {
      setSubScopes(
        web3inboxClientData?.client.getNotificationTypes(account, domain)
      );
    }
  }, [web3inboxClientData, account, subscriptionsTrigger, domain]);

  const updateScopes = useCallback(
    (scope: string[]) => {
      if (web3inboxClientData?.client) {
        return web3inboxClientData?.client.update(scope, account, domain);
      } else {
        setError(
          "Trying to update scope before Web3Inbox Client was initialized "
        );
        return Promise.resolve(false);
      }
    },
    [web3inboxClientData, account, domain]
  );

  const result = useMemo(() => {
    if (!web3inboxClientData) {
      return {
        data: null,
        error: null,
        isLoading: true,
        updateScopes,
      } as LoadingOf<SubscriptionScopesReturn>;
    }

    if (clientError) {
      return {
        data: null,
        error: {
	  client: clientError.client
	},
        isLoading: false,
        updateScopes,
      } as ErrorOf<SubscriptionScopesReturn>;
    }

    if (error) {
      return {
        data: null,
        error: { updateScopes: { message: error } },
        isLoading: false,
        updateScopes,
      } as ErrorOf<SubscriptionScopesReturn>;
    }

    return {
      data: { scopes: subScopes },
      error: null,
      isLoading: false,
      updateScopes,
    } as SuccessOf<SubscriptionScopesReturn>;
  }, [web3inboxClientData, clientError, error]);

  return result;
};
