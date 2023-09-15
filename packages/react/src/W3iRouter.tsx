import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useManageSubscription, useSubscription, useW3iAccount } from "./hooks";

const W3iRouter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const { account } = useW3iAccount();
  const { isSubscribed } = useManageSubscription({ account });
  const { subscription } = useSubscription({ account });

  useEffect(() => {
    switch (pathname) {
      case "/sign-in":
        if (account) {
          nav("/subscribe");
        }
        break;
      case "/preferences":
      case "/notifications":
        if (!isSubscribed) {
          nav("/subscribe");
        }
        break;
      case "/subscribe":
        if (isSubscribed) {
          nav("/notifications");
        }
        break;
    }
  }, [isSubscribed, account, pathname, nav, subscription]);

  return <div className="W3iRouter">{children}</div>;
};

export default W3iRouter;
