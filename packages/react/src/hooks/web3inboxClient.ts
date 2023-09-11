import { Web3InboxClient } from "@web3inbox/core";
import { useEffect, useState } from "react";

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
