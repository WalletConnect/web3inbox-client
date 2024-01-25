import { useState } from "react";
import { HooksReturn, LoadingOf, SuccessOf } from "../types/hooks";
import { useWeb3InboxClient } from "./useWeb3InboxClient";
import { Web3InboxClient } from "@web3inbox/core";

type UnsubscribeReturnType = Awaited<
  ReturnType<Web3InboxClient["unsubscribeFromDapp"]>
>;
type UnsubscribeData = boolean;
type UseUnsubscribeReturn = HooksReturn<
  boolean,
  { unsubscribe: () => Promise<void> }
>;

/**
 * Hook to manage a unsubscribe
 *
 * @param {string} [account] - Account to get subscriptions messages from , defaulted to current account
 * @param {string} [domain] - Domain to get subscription messages from, defaulted to one set in init.
 */
export const useUnsubscribe = (
  account?: string,
  domain?: string
): UseUnsubscribeReturn => {
  const { data: w3iClient } = useWeb3InboxClient();

  const [data, setData] = useState<UnsubscribeData>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const unsubscribe = async () => {
    setError(null);
    setIsLoading(true);

    return new Promise<UnsubscribeReturnType>(async (resolve, reject) => {
      if (!w3iClient) {
        const err = new Error("Web3InboxClient is not ready, cannot subscribe");
        setError(err.message);
        return reject(err);
      }

      return await w3iClient
        .unsubscribeFromDapp(account, domain)
        .then((res) => {
          setData(true);
          resolve(res);
        })
        .catch((e) => {
          setData(false);
          setError(e?.message ?? "Failed to unsubscribe");
          reject(e);
        })
        .finally(() => {
          setIsLoading(false);
        });
    });
  };

  if (isLoading) {
    return {
      data: null,
      error,
      isLoading,
      unsubscribe,
    } as LoadingOf<UseUnsubscribeReturn>;
  }

  return {
    data,
    error,
    isLoading,
    unsubscribe,
  } as SuccessOf<UseUnsubscribeReturn>;
};
