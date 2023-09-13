import React, { useCallback, useContext, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Button from "../../components/general/Button";
import W3iBellIcon from "../../assets/W3iBell.svg";
import "./Subscribe.scss";
import { showErrorMessageToast } from "../../utils/toasts";
import Spinner from "../../components/general/Spinner";
import {
  useAccount,
  useManageSubscription,
  useSubscription,
} from "../../hooks";
import { useMetadata } from "../../utils/metadata";

const WidgetSubscribe: React.FC = () => {
  const nav = useNavigate();

  const [isSubscribing, setIsSubscribing] = useState(false);
  const { account } = useAccount();
  const { isSubscribed, subscribe } = useManageSubscription({
    account,
  });

  console.log({ isSubscribed });

  const metadata = useMetadata();

  const handleOnSubscribe = useCallback(async () => {
    setIsSubscribing(true);
    try {
      /*
       * Not setting isLoading to false as it will transition to a different page once subscription is
       * done.
       */
      subscribe();
    } catch (error) {
      showErrorMessageToast("Failed to subscribe");
    } finally {
      setIsSubscribing(false);
    }
  }, [subscribe]);

  useEffect(() => {
    if (isSubscribed) {
      console.log("Going to");
      nav(`/notifications`);
    }
  }, [isSubscribed, nav]);

  if (!account) {
    return <Navigate to="/sign-in" />;
  }

  return (
    <div className="WidgetSubscribe">
      <div className="WidgetSubscribe__container">
        <div className="WidgetSubscribe__icon">
          <img src={metadata.icons[0]} alt={metadata.name} />
        </div>
        <h1 className="WidgetSubscribe__title">
          Notifications from {metadata.name}
        </h1>
        <p className="WidgetSubscribe__description">{metadata.description}</p>
        <Button onClick={handleOnSubscribe} disabled={isSubscribing}>
          {isSubscribing ? (
            <Spinner width="1em" />
          ) : (
            <span>Enable (Subscribe in Wallet)</span>
          )}
        </Button>
      </div>
    </div>
  );
};

export default WidgetSubscribe;
