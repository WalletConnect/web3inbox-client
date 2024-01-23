import { Web3InboxClient } from "@web3inbox/core";
import { useCallback, useEffect, useState } from "react";
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
  const { data: clientData } = useWeb3InboxClient();
  const { account, registration } = useClientState();

  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);

  const setAccount = async (account: string) => {
    if (clientData?.client) {
      return clientData.client.setAccount(account);
    }
  };

  const prepareRegistration = async () => {
    if (clientData?.client && account) {
      return clientData?.client.prepareRegistration({ account });
    }

    throw new Error("Web3InboxClient not ready, cannot prepare");
  };

  const register = useCallback(
    async (params: Parameters<Web3InboxClient["register"]>[0]) => {
      if (clientData?.client && account) {
        setIsRegistering(true);
        let identity: string | null;

        try {
          identity = await clientData.client.register(params);
        } catch (e) {
          identity = null;
          console.error(e);
        } finally {
          setIsRegistering(false);
        }

        return identity;
      }

      throw new Error("Web3InboxClient not ready");
    },
    [clientData, account]
  );

  const unregister = useCallback(async () => {
    if (clientData && account) {
      return clientData.client.unregister({ account });
    }
  }, [clientData, account]);

  useEffect(() => {
    const registrationStatus = registration
      ? registration.account === account
      : false;

    setIsRegistered(registrationStatus);
  }, [account, registration]);

  if (!clientData) {
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
