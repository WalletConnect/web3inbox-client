import { useCallback, useEffect, useState } from "react";
import type { NotifyClientTypes } from "@walletconnect/notify-client";
import { useWeb3InboxClient } from "./web3inboxClient";
import { Web3InboxClient, useSubscriptionState } from "@web3inbox/core";

export const useMessages = (params: { account: string }) => {
  const client = useWeb3InboxClient();
  const { messages: messagesTrigger } = useSubscriptionState();
  const [messages, setMessages] = useState<
    NotifyClientTypes.NotifyMessageRecord[]
  >(client?.getMessageHistory(params) ?? []);

  useEffect(() => {
    if (!client) return;

    setMessages(client.getMessageHistory({ account: params.account }));
  }, [client, messagesTrigger, setMessages, params.account]);

  const deleteMessage = useCallback(
    async (id: number) => {
      if (client) {
        client.deleteNotifyMessage({ id });
      }
    },
    [client]
  );

  return { messages, deleteMessage };
};

export const useManageSubscription = (params: { account: string }) => {
  const client = useWeb3InboxClient();
  const { subscriptions: subscriptionsTrigger } = useSubscriptionState();
  const [isSubscribed, setIsSubscribed] = useState<boolean>(
    client?.isSubscribedToCurrentDapp(params) ?? false
  );

  useEffect(() => {
    if (!client) return;

    setIsSubscribed(client.isSubscribedToCurrentDapp(params));
  }, [client, subscriptionsTrigger, params]);

  const subscribe = useCallback(() => {
    if (client) {
      client.subscribeToCurrentDapp(params);
    } else {
      console.error("Trying to subscribe before init");
    }
  }, [client, params]);

  const unsubscribe = useCallback(() => {
    if (client) {
      client.unsubscribeFromCurrentDapp(params);
    } else {
      console.error("Trying to unsubscribe before init");
    }
  }, [client, params]);

  return { subscribe, unsubscribe, isSubscribed };
};

export const useSubscription = (params: { account: string }) => {
  const client = useWeb3InboxClient();
  const { subscriptions: subscriptionsTrigger } = useSubscriptionState();
  const [subscription, setSubscription] =
    useState<NotifyClientTypes.NotifySubscription | null>(
      client?.getSubscription(params.account) ?? null
    );

  useEffect(() => {
    if (client) {
      setSubscription(client.getSubscription(params.account));
    }
  }, [setSubscription, subscriptionsTrigger, params, client]);

  return { subscription };
};

export const useSubscriptionScopes = (params: { account: string }) => {
  const client = useWeb3InboxClient();
  const [subScopes, setSubScopes] = useState<NotifyClientTypes.ScopeMap>(
    client?.getNotificationTypes(params) ?? {}
  );

  useEffect(() => {
    if (client) {
      setSubScopes(client.getNotificationTypes(params));
    }
  }, [client, params, setSubScopes]);

  useEffect(() => {
    if (client) {
      const sub = client.watchScopeMap(params.account, setSubScopes);

      return sub();
    }
  }, [client, params, setSubScopes]);

  const updateScopes = useCallback(
    (scope: string[]) => {
      if (client) {
        return client.update({ account: params.account, scope });
      } else {
        console.error("Trying to update subscribe before init");
        return Promise.resolve(false);
      }
    },
    [client, params]
  );

  return { scopes: subScopes, updateScopes };
};
