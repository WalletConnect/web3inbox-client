import { Web3InboxClient } from "@web3inbox/core";
import { useCallback, useEffect, useState } from "react";

export const useInitWeb3InboxClient = (params: {
  projectId: string;
  domain?: string;
}) => {
  const [isReady, setIsReady] = useState(Web3InboxClient.getIsReady());

  useEffect(() => {
    Web3InboxClient.init(params);
  }, [params]);

  useEffect(() => {
    const unsub = Web3InboxClient.watchIsReady(setIsReady);

    return () => {
      unsub();
    };
  }, [setIsReady]);

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
  }, [setIsReady]);

  useEffect(() => {
    if (isReady) {
      setClient(Web3InboxClient.getInstance());
    }
  }, [isReady, setClient]);

  return client;
};

export const useW3iAccount = () => {
  const client = useWeb3InboxClient();

  const [account, setAcc] = useState(client?.getAccount() ?? "");

  useEffect(() => {
    if (client) {
      const unsub = client.watchAccount((a) => {
        console.log("GOT SOMETHING", a);
        setAcc(a);
      });

      return () => unsub();
    }
  }, [client, setAcc]);

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
