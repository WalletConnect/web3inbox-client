import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useManageSubscription, useSubscription, useW3iAccount } from "./hooks";

const W3iRouter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const nav = useNavigate();
  const { account } = useW3iAccount();
  const { isSubscribed } = useManageSubscription({ account });
  const { subscription } = useSubscription({ account });

  useEffect(() => {
    if (!account) {
      nav("/sign-in");
      return;
    }

    if (isSubscribed) {
      nav("/notifications");
      return;
    } else {
      nav("/subscribe");
    }
  }, [isSubscribed, account, nav, subscription]);

  return <div className="W3iRouter">{children}</div>;
};

export default W3iRouter;
