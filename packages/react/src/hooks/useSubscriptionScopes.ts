import type { NotifyClientTypes } from "@walletconnect/notify-client";
import { useEffect, useState } from "react";
import { ErrorOf, HooksReturn, LoadingOf, SuccessOf } from "../types/hooks";
import { useWeb3InboxClient } from "./useWeb3InboxClient";
import { useSubscriptionState } from "../utils/snapshots";

type UseSubscriptionScopesReturn = HooksReturn<
  {
    scopes: NotifyClientTypes.ScopeMap;
    isUpdatingScopes: boolean;
    errorUpdatingScopes: string | null;
  },
  { updateScopes: (scope: string[]) => Promise<boolean> },
  "updateScopes"
>;

export const useSubscriptionScopes = (
  account?: string,
  domain?: string
): UseSubscriptionScopesReturn => {
  const { data: w3iClient, error: clientError } = useWeb3InboxClient();

  const { subscriptions: subscriptionsTrigger } = useSubscriptionState();
  const [subScopes, setSubScopes] = useState<NotifyClientTypes.ScopeMap>(
    w3iClient?.getNotificationTypes(account) ?? {}
  );
  const [isUpdatingScopes, setIsUpdatingScopes] = useState<boolean>(false);
  const [errorUpdatingScopes, setErrorUpdatingScopes] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (w3iClient) {
      setSubScopes(w3iClient.getNotificationTypes(account, domain));
    }
  }, [w3iClient, account, subscriptionsTrigger, domain]);

  const updateScopes = (scope: string[]) => {
    setIsUpdatingScopes(true);

    return new Promise<boolean>(async (resolve, reject) => {
      if (!w3iClient) {
        return reject(
          new Error("Web3InboxClient is not ready, cannot update scopes")
        );
      }

      await w3iClient
        .update(scope, account, domain)
        .then((res) => {
          resolve(res);
        })
        .catch((e) => {
          setErrorUpdatingScopes(e?.message ?? "Failed to register");
          reject(e);
        })
        .finally(() => {
          setIsUpdatingScopes(false);
        });
    });
  };

  if (!w3iClient) {
    return {
      data: null,
      error: null,
      isLoading: true,
      updateScopes,
    } as LoadingOf<UseSubscriptionScopesReturn>;
  }

  if (clientError) {
    return {
      data: null,
      error: {
        client: clientError.client,
      },
      isLoading: false,
      updateScopes,
    } as ErrorOf<UseSubscriptionScopesReturn>;
  }

  return {
    data: { scopes: subScopes, isUpdatingScopes, errorUpdatingScopes },
    error: null,
    isLoading: false,
    updateScopes,
  } as SuccessOf<UseSubscriptionScopesReturn>;
};
