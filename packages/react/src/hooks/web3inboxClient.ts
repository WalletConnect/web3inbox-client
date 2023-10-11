import { Web3InboxClient, useClientState } from "@web3inbox/core";
import { useCallback, useEffect, useState } from "react";

export const useInitWeb3InboxClient = ({
  projectId,
  domain,
}: {
  projectId: string;
  domain?: string;
}) => {
  const [isReady, setIsReady] = useState(Web3InboxClient.getIsReady());
  const [isInitialized, setIsInitialized] = useState(false);

  const handleInitClient = useCallback(async () => {
    try {
      await Web3InboxClient.init({ projectId, domain });
      setIsInitialized(true);
    } catch (error) {
      console.log("Failed to initialize Web3InboxClient");
      setIsInitialized(false);
    }
  }, [domain, projectId]);

  useEffect(() => {
    if (!isInitialized) {
      handleInitClient();
    }
  }, [handleInitClient, isInitialized]);

  useEffect(() => {
    const unsub = Web3InboxClient.watchIsReady(setIsReady);

    return () => {
      unsub();
    };
  }, []);

  return isReady;
};

export const useWeb3InboxClient = () => {
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

  return client;
};

export const useW3iAccount = () => {
  const client = useWeb3InboxClient();
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);

  const { account, registration } = useClientState();

  const setAccount = useCallback(
    async (account: string) => {
      if (client) {
        return client.setAccount(account);
      }
    },
    [client, account]
  );

  useEffect(() => {
    const registrationStatus = registration? registration.account === account : false;
    setIsRegistered(registrationStatus)
  }, [account, registration])

  const register = useCallback(
    async (onSign: (m: string) => Promise<string>) => {
      if (client && account) {
	setIsRegistering(true);
        const identity = await client.register({
          account,
          onSign,
        });
	setIsRegistering(false)
        return identity;
      }

      return null;
    },
    [client, account]
  );

  return {
    account,
    setAccount,
    register,
    isRegistering,
    isRegistered,
    identityKey: isRegistered && registration ? registration.identity : undefined
  };
};
