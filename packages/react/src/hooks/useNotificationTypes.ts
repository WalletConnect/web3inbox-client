import { useEffect, useState } from "react";
import { HooksReturn, SuccessOf } from "../types/hooks";
import { useWeb3InboxClient } from "./useWeb3InboxClient";
import { useSubscriptionState } from "../utils/snapshots";
import { Web3InboxClient } from "@web3inbox/core";

type UpdateSubscriptionReturnType = Awaited<
  ReturnType<Web3InboxClient["update"]>
>;
type UpdateSubscriptionData = UpdateSubscriptionReturnType | null;
type GetNotificationTypesReturnType = Awaited<
  ReturnType<Web3InboxClient["getNotificationTypes"]>
>;
type UseNotificationTypesData = GetNotificationTypesReturnType;
type UseNotificationTypesReturn = HooksReturn<
  UseNotificationTypesData,
  { update: (scope: string[]) => Promise<boolean> }
>;

/**
 * Hook to get notification types of a subscription
 *
 * @param {string} [account] - Account to get subscription notification from , defaulted to current account
 * @param {string} [domain] - Domain to get subscription notifications from, defaulted to one set in init.
 */
export const useNotificationTypes = (
  account?: string,
  domain?: string
): UseNotificationTypesReturn => {
  const { data: w3iClient } = useWeb3InboxClient();

  const { subscriptions: subscriptionsTrigger } = useSubscriptionState();
  const [data, setData] = useState<UseNotificationTypesData>(
    w3iClient?.getNotificationTypes(account) ?? {}
  );

  const update = async (scope: string[]) => {
    return new Promise<UpdateSubscriptionReturnType>(
      async (resolve, reject) => {
        if (!w3iClient) {
          const err = new Error(
            "Web3InboxClient is not ready, cannot subscribe"
          );
          return reject(err);
        }

        return await w3iClient
          .update(scope, account, domain)
          .then((res) => {
            resolve(res);
          })
          .catch((e) => {
            reject(e);
          });
      }
    );
  };

  useEffect(() => {
    if (w3iClient) {
      setData(w3iClient.getNotificationTypes(account, domain));
    }
  }, [w3iClient, account, subscriptionsTrigger, domain]);

  return {
    data,
    error: null,
    isLoading: false,
    update,
  } as SuccessOf<UseNotificationTypesReturn>;
};
