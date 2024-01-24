import type { NotifyClientTypes } from "@walletconnect/notify-client";
import { useCallback, useEffect, useState } from "react";
import { ErrorOf, HooksReturn, LoadingOf, SuccessOf } from "../types/hooks";
import { useWeb3InboxClient } from "./useWeb3InboxClient";
import { useSubscriptionState } from "../utils/snapshots";

type SubscriptionScopesReturn = HooksReturn<
  { scopes: NotifyClientTypes.ScopeMap },
  { updateScopes: (scope: string[]) => Promise<boolean> },
  "updateScopes"
>;

export const useSubscriptionScopes = (
  account?: string,
  domain?: string
): SubscriptionScopesReturn => {
  const { data: w3iClient, error: clientError } = useWeb3InboxClient();
  const { subscriptions: subscriptionsTrigger } = useSubscriptionState();
  const [subScopes, setSubScopes] = useState<NotifyClientTypes.ScopeMap>(
    w3iClient?.getNotificationTypes(account) ?? {}
  );

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (w3iClient) {
      setSubScopes(w3iClient.getNotificationTypes(account, domain));
    }
  }, [w3iClient, account, subscriptionsTrigger, domain]);

  const updateScopes = useCallback(
    (scope: string[]) => {
      if (w3iClient) {
        return w3iClient.update(scope, account, domain);
      } else {
        setError(
          "Trying to update scope before Web3Inbox Client was initialized "
        );
        return Promise.resolve(false);
      }
    },
    [w3iClient, account, domain]
  );

  if (!w3iClient) {
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
};
