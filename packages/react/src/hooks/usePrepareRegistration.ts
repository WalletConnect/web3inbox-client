import { Web3InboxClient } from "@web3inbox/core";
import { useState } from "react";
import { HooksReturn, LoadingOf, SuccessOf } from "../types/hooks";
import { useWeb3InboxClient } from "./useWeb3InboxClient";
import { useClientState } from "../utils/snapshots";

type PrepareRegistrationReturnType = Awaited<
  ReturnType<Web3InboxClient["prepareRegistration"]>
>;
type PrepareRegistrationData = PrepareRegistrationReturnType | null;
type UsePrepareRegistrationReturn = HooksReturn<
  PrepareRegistrationData,
  {
    prepareRegistration: () => ReturnType<
      Web3InboxClient["prepareRegistration"]
    >;
  }
>;

export const usePrepareRegistration = (): UsePrepareRegistrationReturn => {
  const { account } = useClientState();
  const { data: w3iClient } = useWeb3InboxClient();

  const [data, setData] = useState<PrepareRegistrationData>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const prepareRegistration = async () => {
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
        .prepareRegistration({ account })
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
      error,
      prepareRegistration,
    } as LoadingOf<UsePrepareRegistrationReturn>;
  }

  return {
    data,
    error: null,
    isLoading: false,
    prepareRegistration,
  } as SuccessOf<UsePrepareRegistrationReturn>;
};
