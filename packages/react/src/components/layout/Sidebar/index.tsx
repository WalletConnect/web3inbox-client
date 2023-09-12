import React, { useContext, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useIsMobile } from "../../../utils/hooks";
import Avatar from "../../account/Avatar";
import MessageIcon from "../../general/Icon/MessageIcon";
import NotificationIcon from "../../general/Icon/NotificationIcon";
import SettingIcon from "../../general/Icon/SettingIcon";
import "./Sidebar.scss";
import WalletConnectIcon from "../../general/Icon/WalletConnectIcon";

const SidebarItem: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  return <div className="Sidebar__Item">{children}</div>;
};

const Sidebar: React.FC = () => {
  const { pathname } = useLocation();
  const navigationPaths = useMemo(() => pathname.split("/"), [pathname]);
  const isMobile = useIsMobile();
  const navItems = useMemo(() => {
    const items: [React.ReactNode, string][] = [];

    items.push([
      <MessageIcon key="1" isFilled={pathname.includes("/messages")} />,
      "messages",
    ]);

    items.push([
      <NotificationIcon
        key="2"
        isFilled={pathname.includes("/notifications")}
      />,
      "notifications",
    ]);

    items.push([
      <SettingIcon key="3" isFilled={pathname.includes("/settings")} />,
      "settings",
    ]);

    return items;
  }, [pathname]);

  // If pathname matches .*/.*/.*
  // As per design, sidebar in mobile is hidden when on "Main" is viewed on messages
  // And hidden when "TargetSelector" is viewed
  if (
    isMobile &&
    navigationPaths.includes("messages") &&
    navigationPaths.length > 2
  ) {
    return null;
  }

  return (
    <div className="Sidebar">
      {!isMobile && (
        <SidebarItem>
          <WalletConnectIcon />
        </SidebarItem>
      )}
      <SidebarItem>
        <div className="Sidebar__Navigation">
          {navItems.map(([icon, itemName]) => (
            <Link
              className="Sidebar__Navigation__Link"
              key={itemName}
              to={`/${itemName}`}
            >
              {icon}
            </Link>
          ))}
        </div>
      </SidebarItem>

      <SidebarItem>
        <Avatar address={""} width="2em" height="2em" hasProfileDropdown />
      </SidebarItem>
    </div>
  );
};

export default Sidebar;
