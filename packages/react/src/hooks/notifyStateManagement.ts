import type { NotifyClientTypes } from "@walletconnect/notify-client";
import { useSubscriptionState } from "@web3inbox/core";
import { useCallback, useEffect, useState } from "react";
import { useWeb3InboxClient } from "./web3inboxClient";
import { HooksReturn } from "../types/hooks";

/**
 * Hook to watch notifications of a subscription, and delete them
 *
 * @param {string} [account] - Account to get subscriptions messages from, defaulted to current account
 * @param {string} [domain] - Domain to get subscription messages from, defaulted to one set in init.
 */
export const useNotifications = (
  account?: string,
  domain?: string
): HooksReturn<
  {
    messages: NotifyClientTypes.NotifyMessageRecord[];
  },
  {
    deleteMessage: (id: number) => Promise<void>;
  }
> => {
  const { data: web3inboxClientData } = useWeb3InboxClient();
  const { messages: messagesTrigger } = useSubscriptionState();

  const [messages, setMessages] = useState<
    NotifyClientTypes.NotifyMessageRecord[]
  >(web3inboxClientData?.client.getMessageHistory(account, domain) ?? []);

  useEffect(() => {
    if (!web3inboxClientData) return;

    setMessages(web3inboxClientData.client.getMessageHistory(account));
  }, [web3inboxClientData, messagesTrigger, account, domain]);

  const deleteMessage = useCallback(
    async (id: number) => {
      if (web3inboxClientData && id) {
        web3inboxClientData.client.deleteNotifyMessage({ id });
      }
    },
    [web3inboxClientData]
  );

  if(!web3inboxClientData) {
    return { data: null, error: null, isLoading: true, deleteMessage };
  }

  return { data: { messages }, error: null, isLoading: false, deleteMessage };
};

/**
 * Hook to get all subscriptions of an account
 *
 * @param {string} [account] - Account to get subscription for, defaulted to current account
 * @param {string} [domain] - Domain to get subscription for, defaulted to one set in init.
 */
export const useSubscription = (account?: string, domain?: string) => {
  const { data: web3InboxClientData } = useWeb3InboxClient();
  const { subscriptions: subscriptionsTrigger } = useSubscriptionState();
  const [subscription, setSubscription] =
    useState<NotifyClientTypes.NotifySubscription | null>(
      web3InboxClientData?.client.getSubscription(account, domain) ?? null
    );

  useEffect(() => {
    if (web3InboxClientData) {
      setSubscription(web3InboxClientData.client.getSubscription(account, domain));
    }
  }, [subscriptionsTrigger, account, web3InboxClientData, domain]);

  return { subscription };
};

/**
 * Hook to manage a subscription: subscribe, unsubscribe
 *
 * @param {string} [account] - Account to get subscriptions messages from , defaulted to current account
 * @param {string} [domain] - Domain to get subscription messages from, defaulted to one set in init.
 */
export const useManageSubscription = (account?: string, domain?: string): HooksReturn<{
  isSubscribed: boolean,
  isSubscribing: boolean,
  isUnsubscribing: boolean,
  subscription: NotifyClientTypes.NotifySubscription | null
}, {
  unsubscribe: () => Promise<void>
  subscribe: () => Promise<void>
}> => {
  const { data: web3inboxClientData } = useWeb3InboxClient();
  const { subscriptions: subscriptionsTrigger } = useSubscriptionState();

  const { subscription } = useSubscription();

  const [isSubscribed, setIsSubscribed] = useState<boolean>(
    () => web3inboxClientData?.client.isSubscribedToDapp(account, domain) ?? false
  );

  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);

  useEffect(() => {
    if (!web3inboxClientData) return;

    setIsSubscribed(web3inboxClientData.client.isSubscribedToDapp(account, domain));
  }, [web3inboxClientData, subscriptionsTrigger, account, domain]);

  const subscribe = useCallback(async () => {
    if (web3inboxClientData) {
      setIsSubscribing(true);
      try {
        await web3inboxClientData.client.subscribeToDapp(account, domain);
      } catch (e) {
        console.error("Failed to subscribe", e);
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
      } finally {
        setIsUnsubscribing(false);
      }
    } else {
      console.error(
        "Trying to unsubscribe before Web3Inbox Client was initialized"
      );
    }
  }, [web3inboxClientData, account, domain]);

  if(!web3inboxClientData) {
    return {
      data: null,
      isLoading: true,
      error: null,
      unsubscribe,
      subscribe,
    }
  }

  return {
    data: {
      isSubscribing,
      isUnsubscribing,
      subscription,
      isSubscribed,
    },
    isLoading: false,
    error: null,
    unsubscribe,
    subscribe,
  };
};


/**
 * Hook to get all subscriptions of an account
 *
 * @param {string} [account] - Account to get subscriptions from, defaulted to current account
 */
export const useAllSubscriptions = (account?: string): HooksReturn<{
  subscriptions: NotifyClientTypes.NotifySubscription[]
}> => {
  const { data: web3inboxClientData } = useWeb3InboxClient();
  const { subscriptions: subscriptionsTrigger } = useSubscriptionState();
  const [subscriptions, setSubscriptions] = useState<
    NotifyClientTypes.NotifySubscription[]
  >([]);

  useEffect(() => {
    if (web3inboxClientData?.client) {
      setSubscriptions(web3inboxClientData?.client.getSubscriptions(account));
    }
  }, [subscriptionsTrigger, account, web3inboxClientData]);

  if(!web3inboxClientData) {
    return {
 data: null, isLoading: true, error: null 
    }
  }

  return { data: { subscriptions }, isLoading: false, error: null };
};

export const useSubscriptionScopes = (account?: string, domain?: string): HooksReturn<{scopes: NotifyClientTypes.ScopeMap}, {
  updateScopes: (scope: string[]) => Promise<boolean>
}> => {
  const { data: web3inboxClientData } = useWeb3InboxClient();
  const { subscriptions: subscriptionsTrigger } = useSubscriptionState();
  const [subScopes, setSubScopes] = useState<NotifyClientTypes.ScopeMap>(
    web3inboxClientData?.client.getNotificationTypes(account) ?? {}
  );

  useEffect(() => {
    if (web3inboxClientData?.client) {
      setSubScopes(web3inboxClientData?.client.getNotificationTypes(account, domain));
    }
  }, [web3inboxClientData, account, subscriptionsTrigger, domain]);

  const updateScopes = useCallback(
    (scope: string[]) => {
      if (web3inboxClientData?.client) {
        return web3inboxClientData?.client.update(scope, account, domain);
      } else {
        console.error(
          "Trying to update scope before Web3Inbox Client was initialized "
        );
        return Promise.resolve(false);
      }
    },
    [web3inboxClientData, account, domain]
  );

  if(!web3inboxClientData) {
    return { data: null, error: null, isLoading: true, updateScopes }
  }

  return { data: {scopes: subScopes}, error: null, isLoading: false, updateScopes };
};
