import { watchSubscription } from "@web3inbox/widget-html";
import { useEffect, useState } from "react";

export const useIsSubscribed = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const sub = watchSubscription(setIsSubscribed);

    return () => {
      sub.unsubscribe();
    };
  }, [setIsSubscribed]);

  return isSubscribed;
};
