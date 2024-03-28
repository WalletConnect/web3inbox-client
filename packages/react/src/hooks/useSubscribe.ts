import { useState } from "react";
import { HooksReturn, LoadingOf, SuccessOf } from "../types/hooks";
import { useWeb3InboxClient } from "./useWeb3InboxClient";
import { Web3InboxClient } from "@web3inbox/core";

type UseSubscribeReturn = HooksReturn<
  boolean,
  {
    subscribe: (
      accountOverride?: string,
      domainOverride?: string
    ) => ReturnType<Web3InboxClient["subscribeToDapp"]>;
  }
>;

/**
 * Hook to manage a subscribe
 *
 * @param {string} [account] - Account to get subscriptions messages from , defaulted to current account
 * @param {string} [domain] - Domain to get subscription messages from, defaulted to one set in init.
 */
export const useSubscribe = (
  account?: string,
  domain?: string
): UseSubscribeReturn => {
  const { data: w3iClient, isLoading: isLoadingClient } = useWeb3InboxClient();

  const [data, setData] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const subscribe = async (
    accountOverride?: string,
    domainOverride?: string
  ) => {
    setError(null);
    setIsLoading(true);

    return new Promise<void>(async (resolve, reject) => {
      if (!w3iClient) {
        const err = new Error("Web3InboxClient is not ready, cannot subscribe");
        setError(err.message);
        return reject(err);
      }

      return await w3iClient
        .subscribeToDapp(accountOverride ?? account, domainOverride ?? domain)
        .then((res) => {
          setData(true);
          resolve(res);
        })
        .catch((e) => {
          setData(false);
          setError(e?.message ?? "Failed to subscribe");
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
      error: null,
      isLoading,
      subscribe,
    } as LoadingOf<UseSubscribeReturn>;
  }

  return {
    data,
    error,
    isLoading,
    subscribe,
  } as SuccessOf<UseSubscribeReturn>;
};
