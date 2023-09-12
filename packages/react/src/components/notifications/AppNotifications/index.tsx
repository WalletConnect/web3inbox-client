import type { NotifyClientTypes } from "@walletconnect/notify-client";
import { createContext, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { noop } from "rxjs";
import AppNotificationItem from "./AppNotificationItem";
import "./AppNotifications.scss";
import AppNotificationsHeader from "./AppNotificationsHeader";
import AppNotificationsEmpty from "./AppNotificationsEmpty";
import Label from "../../general/Label";
import { useAccount, useMessages, useSubscription } from "../../../hooks";

export interface AppNotificationsDragProps {
  id: number;
  isDragged: boolean;
}

export type AppNotificationsDragContext = [
  AppNotificationsDragProps[] | undefined,
  React.Dispatch<React.SetStateAction<AppNotificationsDragProps[] | undefined>>
];

export const AppNotificationDragContext =
  createContext<AppNotificationsDragContext>([[], () => null]);

const AppNotifications = () => {
  const [notificationsDrag, setNotificationsDrag] = useState<
    AppNotificationsDragProps[] | undefined
  >();

  const { account } = useAccount();
  const { subscription: app } = useSubscription({ account });
  const { messages: notifications } = useMessages({ account });

  return app?.metadata ? (
    <AppNotificationDragContext.Provider
      value={[notificationsDrag, setNotificationsDrag]}
    >
      <div className="AppNotifications">
        <div className="AppNotifications__border"></div>
        <AppNotificationsHeader
          id={app.topic}
          name={app.metadata.name}
          logo={app.metadata.icons[0]}
        />
        {notifications.length > 0 ? (
          <>
            {/* <div className="AppNotifications__list">
              <Label color="accent">Unread</Label>
              <>
                {notifications.map(notification => (
                  <AppNotificationItem
                    key={notification.id}
                    onClear={updateMessages}
                    notification={{
                      timestamp: notification.publishedAt,
                      // We do not manage read status for now.
                      isRead: false,
                      id: notification.id.toString(),
                      message: notification.message.body,
                      title: notification.message.title,
                      image: notification.message.icon,
                      url: notification.message.url
                    }}
                    appLogo={app.metadata.icons[0]}
                  />
                ))}
              </>
            </div> */}

            <div className="AppNotifications__list">
              <Label color="main">Latest</Label>
              <>
                {notifications
                  .sort((a, b) => b.publishedAt - a.publishedAt)
                  .map((notification) => (
                    <AppNotificationItem
                      key={notification.id}
                      onClear={() => {}}
                      notification={{
                        timestamp: notification.publishedAt,
                        // We do not manage read status for now.
                        isRead: true,
                        id: notification.id.toString(),
                        message: notification.message.body,
                        title: notification.message.title,
                        image: notification.message.icon,
                        url: notification.message.url,
                      }}
                      appLogo={app.metadata.icons[0]}
                    />
                  ))}
              </>
            </div>
          </>
        ) : (
          <AppNotificationsEmpty />
        )}
      </div>
    </AppNotificationDragContext.Provider>
  ) : (
    <Navigate to="/notifications" />
  );
};

export default AppNotifications;
