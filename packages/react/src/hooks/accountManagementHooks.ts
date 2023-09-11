import { useEffect, useState } from "react";
import { useWeb3InboxClient } from "./web3inboxClient";

export const useIsSubscribed = () => {
  const client = useWeb3InboxClient();
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const sub = watchSubscription(setIsSubscribed);

    return () => {
      sub.unsubscribe();
    };
  }, [setIsSubscribed]);

  return isSubscribed;
};
