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

  const { account } = useClientState();

  const setAccount = useCallback(
    (account: string) => {
      console.log("Attempting to Setting the account to the client");
      if (client) {
        console.log("Setting the account to the client");
        client.setAccount(account);
      }
    },
    [client]
  );

  const register = useCallback(
    (onSign: (m: string) => Promise<string>) => {
      if (client && account) {
        client.register({
          account,
          onSign,
        });
      }
    },
    [client, account]
  );

  return { account, setAccount, register };
};
