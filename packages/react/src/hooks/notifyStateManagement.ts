import type { NotifyClientTypes } from "@walletconnect/notify-client";
import { useSubscriptionState } from "@web3inbox/core";
import { useCallback, useEffect, useState } from "react";
import { useWeb3InboxClient } from "./web3inboxClient";

export const useMessages = (account?: string) => {
  const client = useWeb3InboxClient();
  const { messages: messagesTrigger } = useSubscriptionState();
  const [messages, setMessages] = useState<
    NotifyClientTypes.NotifyMessageRecord[]
  >(client?.getMessageHistory(account) ?? []);

  useEffect(() => {
    if (!client) return;

    setMessages(client.getMessageHistory(account));
  }, [client, messagesTrigger, account]);

  const deleteMessage = useCallback(
    async (id: number) => {
      if (client && id) {
        client.deleteNotifyMessage({ id });
      }
    },
    [client]
  );

  return { messages, deleteMessage };
};

export const useManageSubscription = (account?: string) => {
  const client = useWeb3InboxClient();
  const { subscriptions: subscriptionsTrigger } = useSubscriptionState();
  const [isSubscribed, setIsSubscribed] = useState<boolean>(
    () => client?.isSubscribedToCurrentDapp(account) ?? false
  );

  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);

  useEffect(() => {
    if (!client) return;

    setIsSubscribed(client.isSubscribedToCurrentDapp(account));
  }, [client, subscriptionsTrigger, account]);

  const subscribe = useCallback(async () => {
    if (client) {
      setIsSubscribing(true);
      try {
        await client.subscribeToCurrentDapp(account);
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
  }, [client, account]);

  const unsubscribe = useCallback(async () => {
    if (client) {
      setIsUnsubscribing(true);
      try {
        await client.unsubscribeFromCurrentDapp(account);
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
  }, [client, account]);

  return {
    subscribe,
    unsubscribe,
    isSubscribed,
    isSubscribing,
    isUnsubscribing,
  };
};

export const useAllSubscriptions = (account?: string) => {
  const client = useWeb3InboxClient();
  const { subscriptions: subscriptionsTrigger } = useSubscriptionState();
  const [subscription, setSubscription] =
    useState<NotifyClientTypes.NotifySubscription | null>(
      client?.getSubscription(account) ?? null
    );

  useEffect(() => {
    if (client) {
      setSubscription(client.getSubscription(account));
    }
  }, [subscriptionsTrigger, account, client]);

  return { subscription };
}

export const useSubscription = (account?: string) => {
  const client = useWeb3InboxClient();
  const { subscriptions } = useSubscriptionState();

  return { subscriptions };
};

export const useSubscriptionScopes = (account?: string) => {
  const client = useWeb3InboxClient();
  const { subscriptions: subscriptionsTrigger } = useSubscriptionState();
  const [subScopes, setSubScopes] = useState<NotifyClientTypes.ScopeMap>(
    client?.getNotificationTypes(account) ?? {}
  );

  useEffect(() => {
    if (client) {
      setSubScopes(client.getNotificationTypes(account));
    }
  }, [client, account, subscriptionsTrigger]);

  const updateScopes = useCallback(
    (scope: string[]) => {
      if (client) {
        return client.update(scope, account);
      } else {
        console.error(
          "Trying to update scope before Web3Inbox Client was initialized "
        );
        return Promise.resolve(false);
      }
    },
    [client, account]
  );

  return { scopes: subScopes, updateScopes };
};
