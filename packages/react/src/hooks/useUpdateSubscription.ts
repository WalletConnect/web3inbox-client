import { useState } from "react";
import { HooksReturn, LoadingOf, SuccessOf } from "../types/hooks";
import { useWeb3InboxClient } from "./useWeb3InboxClient";
import { Web3InboxClient } from "@web3inbox/core";

type UpdateSubscriptionReturnType = Awaited<
  ReturnType<Web3InboxClient["update"]>
>;
type UpdateSubscriptionData = UpdateSubscriptionReturnType | null;
type UseUpdateSubscriptionReturn = HooksReturn<
  UpdateSubscriptionData,
  { update: (scope: string[]) => Promise<boolean> }
>;

/**
 * Hook to update subscription preferences
 *
 * @param {string} [account] - Account to get subscriptions messages from , defaulted to current account
 * @param {string} [domain] - Domain to get subscription messages from, defaulted to one set in init.
 */
export const useUpdateSubscription = (
  account?: string,
  domain?: string
): UseUpdateSubscriptionReturn => {
  const { data: w3iClient } = useWeb3InboxClient();

  const [data, setData] = useState<UpdateSubscriptionData>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const update = async (scope: string[]) => {
    setIsLoading(true);
    setError(null);

    return new Promise<UpdateSubscriptionReturnType>(
      async (resolve, reject) => {
        if (!w3iClient) {
          const err = new Error(
            "Web3InboxClient is not ready, cannot subscribe"
          );
          setError(err.message);
          return reject(err);
        }

        return await w3iClient
          .update(scope, account, domain)
          .then((res) => {
            setData(res);
            resolve(res);
          })
          .catch((e) => {
            setData(null);
            setError(e?.message ?? "Failed to subscribe");
            reject(e);
          })
          .finally(() => {
            setIsLoading(false);
          });
      }
    );
  };

  if (isLoading) {
    return {
      data: null,
      error,
      isLoading,
      update,
    } as LoadingOf<UseUpdateSubscriptionReturn>;
  }

  return {
    data,
    error,
    isLoading,
    update,
  } as SuccessOf<UseUpdateSubscriptionReturn>;
};
