import { Web3InboxClient, useClientState } from "@web3inbox/core";
import { useCallback, useEffect, useMemo, useState } from "react";
import { HooksReturn } from "../types/hooks";

/**
 * Init a singleton instance of the Web3InboxClient
 *
 * @param {Object} params - the params needed to init the client
 * @param {string} params.projectId - your WalletConnect Cloud project ID
 * @param {string} params.domain - The domain of the default dapp to target for functions.
 * @param {boolean} params.isLimited - All account's subscriptions accessable if explicitly set to false. Only param.domain's otherwise
 */
export const initWeb3InboxClient = ({
  projectId,
  domain,
  isLimited,
}: {
  projectId: string;
  domain?: string;
  isLimited?: boolean;
}) => {
  return Web3InboxClient.init({ projectId, domain, isLimited });
};

export const useWeb3InboxClient = (): HooksReturn<{
  client: Web3InboxClient;
}> => {
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

  const result = useMemo(() => {
  if (isReady && client) {
    return {
      data: {
        client,
      },
      isLoading: false,
      error: null,
    };
  }

  return {
    data: null,
    isLoading: true,
    error: null,
  };
  }, [isReady, client])

  return result;

};

export const useW3iAccount = (): HooksReturn<
  {
    account: string | null;
    identityKey: string | null;
    isRegistered: boolean;
    isRegistering: boolean;
  },
  {
    register: (
      onSign: (m: string) => Promise<string>
    ) => Promise<string | null>;
    unregister: (onSign: (m: string) => Promise<string>) => Promise<void>;
    setAccount: (account: string) => Promise<void>;
  }
> => {
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
    setIsRegistered(registrationStatus);
  }, [account, registration]);

  const register = useCallback(
    async (onSign: (m: string) => Promise<string>) => {
      if (web3inboxClientData?.client && account) {
        setIsRegistering(true);
        let identity: string | null;
        try {
          identity = await web3inboxClientData.client.register({
            account,
            onSign,
          });
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

  const result = useMemo(() => {
  if (!web3inboxClientData) {
    return {
      data: null,

      isLoading: true,
      error: null,

      register,
      unregister,
      setAccount,
    };
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

    register,
    unregister,
    setAccount,
  };
  }, [web3inboxClientData, register, unregister, setAccount])

  return result;

};
