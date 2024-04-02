import type { NotifyClientTypes } from "@walletconnect/notify-client";
import { useEffect, useState } from "react";
import { ErrorOf, HooksReturn, SuccessOf } from "../types/hooks";
import { useWeb3InboxClient } from "./useWeb3InboxClient";
import { Web3InboxClient } from "@web3inbox/core";
import { GetNotificationsReturn } from "@web3inbox/core";

const waitFor = async (condition: () => boolean) => {
  return new Promise<void>((resolve) => {
    setInterval(() => {
      if (condition()) {
        resolve();
      }
    }, 100);
  });
};

const mapNotifications = (
  notifications: GetNotificationsReturn["notifications"],
  onRead: (notification: GetNotificationsReturn["notifications"][0]) => void
) => {
  return notifications.map((notification) => ({
    ...notification,
    read: () => {
      if (!notification.isRead) {
        onRead(notification);
      }
    },
  }));
};

type UseNotificationsData = (NotifyClientTypes.NotifyNotification & {
  read: () => void;
})[];
type NextPageState = () => Promise<void>;
type UseNotificationsReturn = HooksReturn<
  UseNotificationsData,
  {
    hasMore: boolean;
    isLoadingNextPage: boolean;
    fetchNextPage: NextPageState;
    markNotificationsAsRead: Web3InboxClient["markNotificationsAsRead"];
    markAllNotificationsAsRead: Web3InboxClient["markAllNotificationsAsRead"];
  }
>;

/**
 * Hook to watch notifications of a subscription, and fetch more notifications
 *
 * @param {number} notificationsPerPage - How many notifications to fetch per call
 * @param {boolean} [isInfiniteScroll] - Whether or not to keep old notifications in the return array or just the current page
 * @param {string} [account] - Account to get subscriptions notifications from, defaulted to current account
 * @param {string} [domain] - Domain to get subscription notifications from, defaulted to one set in init.
 */
export const useNotifications = (
  notificationsPerPage: number,
  isInfiniteScroll?: boolean,
  account?: string,
  domain?: string,
  unreadFirst = true
): UseNotificationsReturn => {
  const { data: w3iClient } = useWeb3InboxClient();

  const [nextPage, setNextPage] = useState<NextPageState>();
  const [data, setData] = useState<UseNotificationsData>([]);
  const [isLoadingNextPage, setIsLoadingNextPage] = useState<boolean>(false);
  const [errorNextPage, setErrorNextPage] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    if (!w3iClient) return;

    try {
      setIsLoadingNextPage(true);
      const { nextPage: nextPageFunc, stopWatchingNotifications } =
        w3iClient.pageNotifications(
          notificationsPerPage,
          isInfiniteScroll,
          account,
          domain,
	  unreadFirst
        )((data) => {
          setData(
            mapNotifications(data.notifications, (notification) => {
              setData((notifications) =>
                notifications.map((mappedNotification) => ({
                  ...mappedNotification,
                  isRead:
                    mappedNotification.isRead ||
                    mappedNotification.id === notification.id,
                }))
              );
              notification.read();
            })
          );
          setIsLoadingNextPage(false);
          setHasMore(data.hasMore);
        });

      setNextPage(() => nextPageFunc);

      return () => {
        stopWatchingNotifications();
      };
    } catch (e: any) {
      setError(e.message);
    }
  }, [account, domain, notificationsPerPage, isInfiniteScroll, w3iClient]);

  const fetchNextPage = async () => {
    setErrorNextPage(null);
    setIsLoadingNextPage(true);

    return new Promise(async (resolve) => {
      // wait for the next page function to be ready
      if (!nextPage) {
        await waitFor(() => Boolean(nextPage));
      }

      // It is now guaranteed to be truthy.
      const nextPageFunc = nextPage as NextPageState;

      return await nextPageFunc()
        .then((res) => {
          resolve(res);
          setIsLoadingNextPage(false);
        })
        .catch((e) => {
          setErrorNextPage(e?.message ?? "Failed to fetch next page");
          setIsLoadingNextPage(false);
        });
    });
  };

  const markNotificationsAsRead = async (notificationIds: string[]) => {
    await waitFor(() => Boolean(w3iClient));
    const w3iClientTruthy = w3iClient as Web3InboxClient;

    w3iClientTruthy
      .markNotificationsAsRead(notificationIds, account, domain)
      .catch(setError)
      .then(() => {
        setData((notifications) =>
          notifications.map((notification) => {
            if (notificationIds.includes(notification.id)) {
              return {
                ...notification,
                isRead: true,
              };
            } else {
              return notification;
            }
          })
        );
      });
  };

  const markAllNotificationsAsRead = async () => {
    await waitFor(() => Boolean(w3iClient));
    const w3iClientTruthy = w3iClient as Web3InboxClient;

    w3iClientTruthy
      .markAllNotificationsAsRead(account, domain)
      .catch(setError)
      .then(() => {
        setData((notifications) =>
          notifications.map((notification) => ({
            ...notification,
            isRead: true,
          }))
        );
      });
  };

  // If the domain of the account change, all previous data is invalidated.
  useEffect(() => {
    setData([]);
    setHasMore(false);
  }, [domain, account]);

  if (isLoadingNextPage) {
    return {
      data,
      hasMore,
      error: null,
      isLoading: false,
      isLoadingNextPage: isLoadingNextPage,
      fetchNextPage,
      markNotificationsAsRead,
      markAllNotificationsAsRead,
    } as SuccessOf<UseNotificationsReturn>;
  }

  if (errorNextPage || error) {
    return {
      data,
      hasMore,
      error: errorNextPage ?? error,
      isLoading: false,
      isLoadingNextPage: false,
      fetchNextPage,
      markNotificationsAsRead,
      markAllNotificationsAsRead,
    } as ErrorOf<UseNotificationsReturn>;
  }

  return {
    data,
    hasMore,
    error: null,
    isLoading: false,
    isLoadingNextPage: false,
    fetchNextPage,
    markNotificationsAsRead,
    markAllNotificationsAsRead,
  } as SuccessOf<UseNotificationsReturn>;
};
