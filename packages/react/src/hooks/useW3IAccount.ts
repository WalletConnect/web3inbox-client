import { Web3InboxClient } from "@web3inbox/core";
import { useEffect, useState } from "react";
import { HooksReturn, SuccessOf } from "../types/hooks";
import { useWeb3InboxClient } from "./useWeb3InboxClient";
import { useClientState } from "../utils/snapshots";

type W3iAccountReturn = HooksReturn<
  {
    account: string | null;
    identityKey: string | null;
    isRegistered: boolean;
    isRegistering: boolean;
    isUnregistering: boolean;
    errorRegister: string | null;
    errorUnregister: string | null;
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
  const [isUnregistering, setIsUnregistering] = useState<boolean>(false);
  const [errorRegister, setErrorRegister] = useState<string | null>(null);
  const [errorUnregister, setErrorUnregister] = useState<string | null>(null);

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
    setIsRegistering(true);

    return new Promise<string>(async (resolve, reject) => {
      if (!account) {
        return reject("Account not set, cannot register account");
      }

      if (!w3iClient) {
        return reject("Web3InboxClient is not ready, cannot register account");
      }

      await w3iClient
        .register(params)
        .then((res) => {
          resolve(res);
        })
        .catch((e) => {
          setErrorRegister(e?.message ?? "Failed to register");
          reject(e);
        })
        .finally(() => {
          setIsRegistering(false);
        });
    });
  };

  const unregister = async () => {
    setIsUnregistering(true);

    return new Promise<void>(async (resolve, reject) => {
      if (!account) {
        return reject("Account not set, cannot unregister account");
      }

      if (!w3iClient) {
        return reject("Web3InboxClient is not ready, cannot register account");
      }

      w3iClient
        .unregister({ account })
        .then((res) => {
          resolve(res);
        })
        .catch((e) => {
          setErrorUnregister(e?.message ?? "Failed to unregister");
          reject(e);
        })
        .finally(() => {
          setIsUnregistering(false);
        });
    });
  };

  useEffect(() => {
    const registrationStatus = registration
      ? registration.account === account
      : false;

    setIsRegistered(registrationStatus);
  }, [account, registration]);

  return {
    data: {
      account: account ?? null,
      identityKey: isRegistered && registration ? registration.identity : null,
      isRegistering,
      isRegistered,
      isUnregistering,
      errorRegister,
      errorUnregister,
    },
    error: null,
    isLoading: false,
    prepareRegistration,
    register,
    unregister,
    setAccount,
  } as SuccessOf<W3iAccountReturn>;
};
