import { Web3InboxClient } from "@web3inbox/core";
import { useEffect, useState } from "react";
import { HooksReturn, LoadingOf, SuccessOf } from "../types/hooks";
import { useWeb3InboxClient } from "./useWeb3InboxClient";
import { useClientState } from "../utils/snapshots";

type W3iAccountReturn = HooksReturn<
  {
    account: string | null;
    identityKey: string | null;
    isRegistered: boolean;
    isRegistering: boolean;
  },
  {
    register: (
      params: Parameters<Web3InboxClient["register"]>[0]
    ) => Promise<string | null>;
    prepareRegistration: () => ReturnType<
      Web3InboxClient["prepareRegistration"]
    >;
    unregister: (onSign: (m: string) => Promise<string>) => Promise<void>;
    setAccount: (account: string) => Promise<void>;
  }
>;

export const useW3iAccount = (address?: string): W3iAccountReturn => {
  const { data: w3iClient } = useWeb3InboxClient();
  const { account, registration } = useClientState();

  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);

  const setAccount = async (account: string) => {
    if (!w3iClient) {
      throw new Error("Web3InboxClient is not ready, cannot set account");
    }

    return w3iClient.setAccount(account);
  };

  const prepareRegistration = async () => {
    if (!account) {
      throw new Error("Account not set, cannot prepare registration");
    }

    if (!w3iClient) {
      throw new Error(
        "Web3InboxClient is not ready, cannot prepare registration"
      );
    }

    return w3iClient.prepareRegistration({ account });
  };

  const register = async (
    params: Parameters<Web3InboxClient["register"]>[0]
  ) => {
    if (!account) {
      throw new Error("Account not set, cannot register account");
    }

    if (!w3iClient) {
      throw new Error("Web3InboxClient is not ready, cannot register account");
    }

    setIsRegistering(true);
    let identity: string | null;

    try {
      identity = await w3iClient.register(params);
    } catch (e) {
      identity = null;
      console.error(e);
    } finally {
      setIsRegistering(false);
    }

    return identity;
  };

  const unregister = async () => {
    if (!account) {
      throw new Error("Account not set, cannot unregister account");
    }

    if (!w3iClient) {
      throw new Error(
        "Web3InboxClient is not ready, cannot unregister account"
      );
    }

    return w3iClient.unregister({ account });
  };

  useEffect(() => {
    const registrationStatus = registration
      ? registration.account === account
      : false;

    setIsRegistered(registrationStatus);
  }, [account, registration]);

  if (!w3iClient) {
    return {
      data: null,
      isLoading: true,
      error: null,
      prepareRegistration,
      register,
      unregister,
      setAccount,
    } as LoadingOf<W3iAccountReturn>;
  }

  return {
    data: {
      account: account ?? null,
      isRegistered,
      isRegistering,
      identityKey: isRegistered && registration ? registration.identity : null,
    },
    isLoading: false,
    error: null,
    prepareRegistration,
    register,
    unregister,
    setAccount,
  } as SuccessOf<W3iAccountReturn>;
};
