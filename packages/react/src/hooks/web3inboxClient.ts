import { Web3InboxClient } from "@web3inbox/core";
import { useCallback, useEffect, useState } from "react";

export const useInitWeb3InboxClient = (params: {
  projectId: string;
  domain?: string;
}) => {
  useEffect(() => {
    Web3InboxClient.init(params);
  }, [params]);
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

export const useAccount = () => {
  const client = useWeb3InboxClient();

  const [account, setAcc] = useState(client?.getAccount() ?? "");

  useEffect(() => {
    if (client) {
      const unsub = client.watchAccount(setAcc);

      return () => unsub();
    }
  }, [client, setAcc]);

  const setAccount = useCallback(
    (account: string) => {
      if (client) {
        client.setAccount(account);
      }
    },
    [client]
  );

  return { account, setAccount };
};
