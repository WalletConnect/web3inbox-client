import { useCallback, useEffect, useState } from "react";
import type { NotifyClientTypes } from "@walletconnect/notify-client";
import { useWeb3InboxClient } from "./web3inboxClient";

export const useMessages = (params: { account: string }) => {
  const client = useWeb3InboxClient();
  const [messages, setMessages] = useState<
    NotifyClientTypes.NotifyMessageRecord[]
  >(client?.getMessageHistory(params) ?? []);

  useEffect(() => {
    if (!client) return;

    const msgWatch = client.watchMessages(params.account, setMessages);

    return () => {
      msgWatch();
    };
  }, [client, setMessages, params]);

  const deleteMessage = useCallback(
    async (id: number) => {
      if (client) {
        await client.deleteNotifyMessage({ id });
      }
    },
    [client]
  );

  return { messages, deleteMessage };
};

export const useManageSubscription = (params: { account: string }) => {
  const client = useWeb3InboxClient();
  const [isSubscribed, setIsSubscribed] = useState<boolean>(
    client?.isSubscribedToCurrentDapp(params) ?? false
  );

  useEffect(() => {
    if (!client) return;

    const subWatch = client.watchIsSubscribed(params.account, setIsSubscribed);

    return () => {
      subWatch();
    };
  }, [client, params.account]);

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
  const [subscription, setSubscription] =
    useState<NotifyClientTypes.NotifySubscription | null>(
      client?.getSubscription(params.account) ?? null
    );

  useEffect(() => {
    if (client && client.isSubscribedToCurrentDapp(params)) {
      const sub = client.getSubscription(params.account);
      if (sub) {
        setSubscription(sub);
      }
    }
  }, [setSubscription, params, client]);

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
      client.watchScopeMap(params.account, setSubScopes);
    }
  }, [client, params, setSubScopes]);

  const updateScopes = useCallback(
    (scope: string[]) => {
      if (client) {
        client.update({ account: params.account, scope });
      } else {
        console.error("Trying to subscribe before init");
      }
    },
    [client, params]
  );

  return { scopes: subScopes, updateScopes };
};