import { Web3InboxClient } from "@web3inbox/core";
import { useState } from "react";
import { HooksReturn, LoadingOf, SuccessOf } from "../types/hooks";
import { useWeb3InboxClient } from "./useWeb3InboxClient";
import { useClientState } from "../utils/snapshots";

type PrepareRegistrationWithRecapsReturnType = Awaited<
  ReturnType<Web3InboxClient["prepareRegistrationWithRecaps"]>
>;
type PrepareRegistrationWithRecapsData = PrepareRegistrationWithRecapsReturnType | null;
type UsePrepareRegistrationWithRecapsReturn = HooksReturn<
  PrepareRegistrationWithRecapsData,
  {
    prepareRegistrationWithRecaps: () => ReturnType<
      Web3InboxClient["prepareRegistrationWithRecaps"]
    >;
  }
>;

export const usePrepareRegistrationWithRecaps = (): UsePrepareRegistrationWithRecapsReturn => {
  const { account } = useClientState();
  const { data: w3iClient } = useWeb3InboxClient();

  const [data, setData] = useState<PrepareRegistrationWithRecapsData>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const prepareRegistrationWithRecaps: Web3InboxClient['prepareRegistrationWithRecaps'] = async (params) => {
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
        .prepareRegistrationWithRecaps(params)
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
      prepareRegistrationWithRecaps,
    } as LoadingOf<UsePrepareRegistrationWithRecapsReturn>;
  }

  return {
    data,
    error,
    isLoading: false,
    prepareRegistrationWithRecaps,
  } as SuccessOf<UsePrepareRegistrationWithRecapsReturn>;
};
