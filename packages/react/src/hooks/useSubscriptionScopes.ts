import type { NotifyClientTypes } from "@walletconnect/notify-client";
import { useSubscriptionState } from "@web3inbox/core";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ErrorOf, HooksReturn, LoadingOf, SuccessOf } from "../types/hooks";
import { useWeb3InboxClient } from "./useWeb3InboxClient";

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
          client: clientError.client,
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
