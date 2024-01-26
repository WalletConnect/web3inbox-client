import { Web3InboxClient } from "@web3inbox/core";
import { useState } from "react";
import { HooksReturn, LoadingOf, SuccessOf } from "../types/hooks";
import { useWeb3InboxClient } from "./useWeb3InboxClient";
import { useClientState } from "../utils/snapshots";

type UnregisterReturnType = Awaited<ReturnType<Web3InboxClient["unregister"]>>;
type UnregisterData = boolean;
type UseUnregisterReturn = HooksReturn<
  boolean,
  { unregister: () => Promise<void> }
>;

/*
 * useUnregister manages registration state and allows user to unregister
 */
export const useUnregister = (): UseUnregisterReturn => {
  const { account } = useClientState();
  const { data: w3iClient } = useWeb3InboxClient();

  const [data, setData] = useState<UnregisterData>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const unregister = async () => {
    setError(null);
    setIsLoading(true);

    return new Promise<UnregisterReturnType>(async (resolve, reject) => {
      if (!account) {
        const err = new Error("Account not set, cannot prepare registration");
        setError(err.message);
        return reject(err);
      }

      if (!w3iClient) {
        const err = new Error(
          "Web3InboxClient is not ready, cannot prepare registration"
        );
        setError(err.message);
        return reject(err);
      }

      return await w3iClient
        .unregister({ account })
        .then((res) => {
          setData(true);
          resolve(res);
        })
        .catch((e) => {
          setData(false);
          setError(e?.message ?? "Failed to unregister");
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
      isLoading,
      error: null,
      unregister,
    } as LoadingOf<UseUnregisterReturn>;
  }

  return {
    data,
    error,
    isLoading: false,
    unregister,
  } as SuccessOf<UseUnregisterReturn>;
};
