import React from "react";
import { Route, BrowserRouter as Router } from "react-router-dom";
import { AppNotifications } from "./components";
import { useAccount } from "./hooks";
import WidgetConnect from "./views/Connect";
import WidgetSubscribe from "./views/Subscribe";

export interface W3iWidgetProps {}

export const W3iWidget: React.FC<W3iWidgetProps> = (props) => {
  // useInitWeb3InboxClient({
  //   projectId: "547aafa48826c4d76f492efecde4843d",
  //   domain: window.location.host,
  // });
  const { account } = useAccount();
  return <div className="W3iWidget">{account}</div>;
};
