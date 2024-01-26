import { Web3InboxClient } from "@web3inbox/core";
import { useEffect, useState } from "react";
import { HooksReturn, LoadingOf, SuccessOf } from "../types/hooks";

type Web3InboxClientReturn = HooksReturn<Web3InboxClient, {}, "client">;

/*
 * useWeb3InboxClient is used to fetch the actual client.
 * If the client is truthy then it is is ready to use.
 */
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

  if (!isReady || !client) {
    return {
      data: null,
      isLoading: true,
      error: null,
    } as LoadingOf<Web3InboxClientReturn>;
  }

  return {
    data: client,
    isLoading: false,
    error: null,
  } as SuccessOf<Web3InboxClientReturn>;
};
