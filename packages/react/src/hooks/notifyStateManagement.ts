import type { NotifyClientTypes } from "@walletconnect/notify-client";
import { useSubscriptionState } from "@web3inbox/core";
import { useCallback, useEffect, useState } from "react";
import { useWeb3InboxClient } from "./web3inboxClient";

export const useMessages = (account?: string, domain?: string) => {
  const client = useWeb3InboxClient();
  const { messages: messagesTrigger } = useSubscriptionState();
  const [messages, setMessages] = useState<
    NotifyClientTypes.NotifyMessageRecord[]
  >(client?.getMessageHistory(account, domain) ?? []);

  useEffect(() => {
    if (!client) return;

    setMessages(client.getMessageHistory(account));
  }, [client, messagesTrigger, account, domain]);

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

export const useManageSubscription = (account?: string, domain?: string) => {
  const client = useWeb3InboxClient();
  const { subscriptions: subscriptionsTrigger } = useSubscriptionState();
  const [isSubscribed, setIsSubscribed] = useState<boolean>(
    () => client?.isSubscribedToDapp(account, domain) ?? false
  );

  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);

  useEffect(() => {
    if (!client) return;

    setIsSubscribed(client.isSubscribedToDapp(account, domain));
  }, [client, subscriptionsTrigger, account, domain]);

  const subscribe = useCallback(async () => {
    if (client) {
      setIsSubscribing(true);
      try {
        await client.subscribeToDapp(account, domain);
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
  }, [client, account, domain]);

  const unsubscribe = useCallback(async () => {
    if (client) {
      setIsUnsubscribing(true);
      try {
        await client.unsubscribeFromDapp(account, domain);
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
  }, [client, account, domain]);

  return {
    subscribe,
    unsubscribe,
    isSubscribed,
    isSubscribing,
    isUnsubscribing,
  };
};

export const useAllSubscription = (account?: string) => {
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

export const useSubscriptions = (account?: string) => {
  const client = useWeb3InboxClient();
  const { subscriptions: subscriptionsTrigger } = useSubscriptionState();
  const [subscriptions, setSubscriptions] =
    useState<NotifyClientTypes.NotifySubscription[] >(
      []
    );

  useEffect(() => {
    if (client) {
      setSubscriptions(client.getSubscriptions(account));
    }
  }, [subscriptionsTrigger, account, client]);

  return { subscriptions };
};

export const useSubscriptionScopes = (account?: string, domain?: string) => {
  const client = useWeb3InboxClient();
  const { subscriptions: subscriptionsTrigger } = useSubscriptionState();
  const [subScopes, setSubScopes] = useState<NotifyClientTypes.ScopeMap>(
    client?.getNotificationTypes(account) ?? {}
  );

  useEffect(() => {
    if (client) {
      setSubScopes(client.getNotificationTypes(account, domain));
    }
  }, [client, account, subscriptionsTrigger, domain]);

  const updateScopes = useCallback(
    (scope: string[]) => {
      if (client) {
        return client.update(scope, account, domain);
      } else {
        console.error(
          "Trying to update scope before Web3Inbox Client was initialized "
        );
        return Promise.resolve(false);
      }
    },
    [client, account, domain]
  );

  return { scopes: subScopes, updateScopes };
};
