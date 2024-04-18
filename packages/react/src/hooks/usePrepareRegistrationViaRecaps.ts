import { Web3InboxClient } from "@web3inbox/core";
import { useState } from "react";
import { HooksReturn, LoadingOf, SuccessOf } from "../types/hooks";
import { useWeb3InboxClient } from "./useWeb3InboxClient";
import { useClientState } from "../utils/snapshots";

type PrepareRegistrationViaRecapsReturnType = Awaited<
  ReturnType<Web3InboxClient["prepareRegistrationViaRecaps"]>
>;
type PrepareRegistrationViaRecapsData = PrepareRegistrationViaRecapsReturnType | null;
type UsePrepareRegistrationViaRecapsReturn = HooksReturn<
  PrepareRegistrationViaRecapsData,
  {
    prepareRegistrationViaRecaps: () => ReturnType<
      Web3InboxClient["prepareRegistrationViaRecaps"]
    >;
  }
>;

export const usePrepareRegistrationViaRecaps = (): UsePrepareRegistrationViaRecapsReturn => {
  const { account } = useClientState();
  const { data: w3iClient } = useWeb3InboxClient();

  const [data, setData] = useState<PrepareRegistrationViaRecapsData>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const prepareRegistrationViaRecaps: Web3InboxClient['prepareRegistrationViaRecaps'] = async (params) => {
    setError(null);
    setIsLoading(true);

    return new Promise<any>(async (resolve, reject) => {
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
        .prepareRegistrationViaRecaps(params)
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
    });
  };
  


  if (isLoading) {
    return {
      data: null,
      isLoading,
      error: null,
      prepareRegistrationViaRecaps,
    } as LoadingOf<UsePrepareRegistrationViaRecapsReturn>;
  }

  return {
    data,
    error,
    isLoading: false,
    prepareRegistrationViaRecaps,
  } as SuccessOf<UsePrepareRegistrationViaRecapsReturn>;
};
