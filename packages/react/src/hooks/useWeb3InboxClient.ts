import { Web3InboxClient } from "@web3inbox/core";
import { useEffect, useState } from "react";
import { HooksReturn, LoadingOf, SuccessOf } from "../types/hooks";

type Web3InboxClientReturn = HooksReturn<Web3InboxClient, {}, "client">;

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

  if (isReady && client) {
    return {
      data: client,
      isLoading: false,
      error: null,
    } as SuccessOf<Web3InboxClientReturn>;
  }

  return {
    data: null,
    isLoading: true,
    error: null,
  } as LoadingOf<Web3InboxClientReturn>;
};
