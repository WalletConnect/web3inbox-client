import { Web3InboxClient } from "@web3inbox/core";
import { useState } from "react";
import { HooksReturn, LoadingOf, SuccessOf } from "../types/hooks";
import { useWeb3InboxClient } from "./useWeb3InboxClient";
import { useClientState } from "../utils/snapshots";

type RegisterReturnType = Awaited<ReturnType<Web3InboxClient["register"]>>;
type RegisterData = RegisterReturnType | null;
type UseRegisterReturn = HooksReturn<
  RegisterData,
  {
    register: (
      params: Parameters<Web3InboxClient["register"]>[0]
    ) => Promise<string | null>;
  }
>;

export const useRegister = (): UseRegisterReturn => {
  const { account } = useClientState();
  const { data: w3iClient } = useWeb3InboxClient();

  const [data, setData] = useState<RegisterData>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const register = async (
    params: Parameters<Web3InboxClient["register"]>[0]
  ) => {
    setError(null);
    setIsLoading(true);

    return new Promise<RegisterReturnType>(async (resolve, reject) => {
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
        .register(params)
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
      register,
    } as LoadingOf<UseRegisterReturn>;
  }

  return {
    data,
    error: null,
    isLoading: false,
    register,
  } as SuccessOf<UseRegisterReturn>;
};
