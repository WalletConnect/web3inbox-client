import { useEffect, useState } from "react";
import { HooksReturn, LoadingOf, SuccessOf } from "../types/hooks";
import { useWeb3InboxClient } from "./useWeb3InboxClient";
import { useClientState } from "../utils/snapshots";

type UseWeb3InboxAccountData = string | undefined;
type UseWeb3InboxAccountReturn = HooksReturn<
  string | undefined,
  {
    identityKey: string | null;
    isRegistered: boolean;
    setAccount: (account: string) => Promise<void>;
  }
>;

export const useWeb3InboxAccount = (
  initialAccount?: string
): UseWeb3InboxAccountReturn => {
  const { data: w3iClient } = useWeb3InboxClient();
  const { account, registration } = useClientState();

  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [data, setData] = useState<UseWeb3InboxAccountData>(account);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const identityKey =
    isRegistered && registration ? registration.identity : null;

  const setAccount = async (account: string) => {
    setError(null);
    setIsLoading(true);

    if (!w3iClient) {
      throw new Error("Web3InboxClient is not ready, cannot set account");
    }

    return w3iClient
      .setAccount(account)
      .catch((e) => {
        setError(e?.message ?? "Failed to set account");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    const registrationStatus = registration
      ? registration.account === account
      : false;

    setIsRegistered(registrationStatus);
  }, [account, registration]);

  useEffect(() => {
    if (!initialAccount || !w3iClient) return;

    setAccount(initialAccount);
  }, [w3iClient, initialAccount]);

  useEffect(() => {
    setData(account);
  }, [account]);

  if (isLoading) {
    return {
      data: null,
      identityKey,
      isRegistered,
      error,
      isLoading,
      setAccount,
    } as LoadingOf<UseWeb3InboxAccountReturn>;
  }

  return {
    data,
    identityKey,
    isRegistered,
    error,
    isLoading,
    setAccount,
  } as SuccessOf<UseWeb3InboxAccountReturn>;
};
