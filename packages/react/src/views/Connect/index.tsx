import React, { useCallback, useState } from "react";
import Button from "../../components/general/Button";
import "./Connect.scss";
import { useMetadata } from "../../utils/metadata";
import { useAccount } from "../../hooks";
import { Navigate } from "react-router-dom";

const WidgetConnect: React.FC<{ onConnect: () => void }> = ({ onConnect }) => {
  const { icons, name } = useMetadata();
  const { account } = useAccount();

  if (account) {
    return <Navigate to="/subscribe" />;
  }

  return (
    <div className="WidgetConnect">
      <div className="WidgetConnect__container">
        <div className="WidgetConnect__icon">
          <img src={icons[0]} alt={name} />
        </div>
        <div className="WidgetConnect__text">Connect your wallet</div>
        <div className="WidgetConnect__subtext">
          <span>To enable notifications, connect your wallet.</span>
        </div>
        <div className="WidgetConnect__connect">
          <Button onClick={onConnect}>Connect Wallet</Button>
        </div>
      </div>
    </div>
  );
};

export default WidgetConnect;
