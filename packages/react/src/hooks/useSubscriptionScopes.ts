import { useEffect, useState } from "react";
import { HooksReturn, SuccessOf } from "../types/hooks";
import { useWeb3InboxClient } from "./useWeb3InboxClient";
import { useSubscriptionState } from "../utils/snapshots";
import { Web3InboxClient } from "@web3inbox/core";

type GetNotificationTypesReturnType = Awaited<
  ReturnType<Web3InboxClient["getNotificationTypes"]>
>;
type UseSubscriptionScopesData = GetNotificationTypesReturnType;
type UseSubscriptionScopesReturn = HooksReturn<UseSubscriptionScopesData>;

export const useSubscriptionScopes = (
  account?: string,
  domain?: string
): UseSubscriptionScopesReturn => {
  const { data: w3iClient } = useWeb3InboxClient();

  const { subscriptions: subscriptionsTrigger } = useSubscriptionState();
  const [data, setData] = useState<UseSubscriptionScopesData>(
    w3iClient?.getNotificationTypes(account) ?? {}
  );

  useEffect(() => {
    if (w3iClient) {
      setData(w3iClient.getNotificationTypes(account, domain));
    }
  }, [w3iClient, account, subscriptionsTrigger, domain]);

  return {
    data,
    error: null,
    isLoading: false,
  } as SuccessOf<UseSubscriptionScopesReturn>;
};
