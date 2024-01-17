import { Web3InboxClient, useClientState } from "@web3inbox/core";
import { useCallback, useEffect, useMemo, useState } from "react";
import { HooksReturn, LoadingOf, SuccessOf } from "../types/hooks";

/**
 * Init a singleton instance of the Web3InboxClient
 *
 * @param {Object} params - the params needed to init the client
 * @param {string} params.projectId - your WalletConnect Cloud project ID
 * @param {string} params.domain - The domain of the default dapp to target for functions.
 * @param {boolean} params.allApps - All account's subscriptions accessable if explicitly set to true. Only param.domain's otherwise
 */
export const initWeb3InboxClient = ({
  projectId,
  domain,
  allApps,
}: {
  projectId: string;
  domain?: string;
  allApps?: boolean;
}) => {
  return Web3InboxClient.init({ projectId, domain, allApps });
};

type Web3InboxClientReturn = HooksReturn<
  {
    client: Web3InboxClient;
  },
  {},
  "client"
>;

export const useWeb3InboxClient = (): Web3InboxClientReturn => {
  const [isReady, setIsReady] = useState(Web3InboxClient.getIsReady());
  const [client, setClient] = useState<Web3InboxClient | null>(
    Web3InboxClient.getIsReady() ? Web3InboxClient.getInstance() : null
  );

  useEffect(() => {
    const unsub = Web3InboxClient.watchIsReady(setIsReady);

    return () => {
      unsub();
    };
  }, []);

  useEffect(() => {
    if (isReady) {
      setClient(Web3InboxClient.getInstance());
    }
  }, [isReady]);

  const result: HooksReturn<{ client: Web3InboxClient }> = useMemo(() => {
    if (isReady && client) {
      return {
        data: {
          client,
        },
        isLoading: false,
        error: null,
      } as SuccessOf<Web3InboxClientReturn>;
    }

    return {
      data: null,
      isLoading: true,
      error: null,
    } as LoadingOf<Web3InboxClientReturn>;
  }, [isReady, client]);

  return result;
};

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
  const { data: web3inboxClientData } = useWeb3InboxClient();

  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);

  const { account, registration } = useClientState();

  const setAccount = useCallback(
    async (account: string) => {
      if (web3inboxClientData?.client) {
        return web3inboxClientData.client.setAccount(account);
      }
    },
    [web3inboxClientData, account]
  );

  useEffect(() => {
    const registrationStatus = registration
      ? registration.account === account
      : false;
    console.log(">>> registrationStatus: ", registrationStatus)
    setIsRegistered(registrationStatus);
  }, [account, registration]);

  const prepareRegistration = useCallback(async () => {
    if (web3inboxClientData?.client && account) {
      return web3inboxClientData?.client.prepareRegistration({ account });
    }

    throw new Error("Web3InboxClient not ready");
  }, [web3inboxClientData, account]);

  const register = useCallback(
    async (params: Parameters<Web3InboxClient["register"]>[0]) => {
      if (web3inboxClientData?.client && account) {
        setIsRegistering(true);
        let identity: string | null;
        try {
          identity = await web3inboxClientData.client.register(params);
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
    [web3inboxClientData, account]
  );

  const unregister = useCallback(async () => {
    if (web3inboxClientData && account) {
      return web3inboxClientData.client.unregister({ account });
    }
  }, [web3inboxClientData, account]);

  useEffect(() => {
    if (!address) return;

    setAccount(address);
  }, [address]);

  console.log(">>> isRegistered", isRegistered)

  const result: W3iAccountReturn = useMemo(() => {
    if (!web3inboxClientData) {
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
        identityKey:
          isRegistered && registration ? registration.identity : null,
      },

      isLoading: false,
      error: null,
      prepareRegistration,
      register,
      unregister,
      setAccount,
    } as SuccessOf<W3iAccountReturn>;
  }, [web3inboxClientData, register, isRegistered, isRegistering, registration, unregister, setAccount]);

  return result;
};
