import type { NotifyClientTypes } from "@walletconnect/notify-client";
import { useEffect, useState } from "react";
import { ErrorOf, HooksReturn, SuccessOf } from "../types/hooks";
import { useWeb3InboxClient } from "./useWeb3InboxClient";

type NotificationsState = SuccessOf<UseNotificationsReturn>["data"];
type NextPageState = (() => void) | undefined;
type UseNotificationsReturn = HooksReturn<
  {
    notifications: NotifyClientTypes.NotifyNotification[];
    hasMore: boolean;
  },
  { nextPage: NextPageState },
  "getMessages"
>;

/**
 * Hook to watch notifications of a subscription, and delete them
 *
 * @param {string} [account] - Account to get subscriptions messages from, defaulted to current account
 * @param {string} [domain] - Domain to get subscription messages from, defaulted to one set in init.
 */
export const useNotifications = (
  notificationsPerPage: number,
  isInfiniteScroll?: boolean,
  account?: string,
  domain?: string
): UseNotificationsReturn => {
  const { data: w3iClient, error: w3iClientError } = useWeb3InboxClient();

  const [nextPage, setNextPage] = useState<NextPageState>(undefined);
  const [error, setError] = useState<null | string>(null);
  const [notifications, setNotifications] = useState<NotificationsState>();

  useEffect(() => {
    if (!w3iClient) return;

    try {
      const { nextPage: nextPageFunc, stopWatchingNotifications } =
        w3iClient.pageNotifications(
          notificationsPerPage,
          isInfiniteScroll,
          account,
          domain
        )((notifications) => {
          setNotifications(notifications);
        });

      setNextPage(nextPageFunc);

      return () => {
        stopWatchingNotifications();
      };
    } catch (e: any) {
      setError(e.message);
    }
  }, [
    account,
    domain,
    notificationsPerPage,
    isInfiniteScroll,
    w3iClient,
    setNotifications,
  ]);

  if (!w3iClient) {
    return {
      data: null,
      error: null,
      isLoading: true,
      nextPage,
    };
  }

  if (w3iClientError) {
    return {
      data: null,
      error: {
        client: w3iClientError.client,
      },
      isLoading: false,
      nextPage,
    } as ErrorOf<UseNotificationsReturn>;
  }

  if (error) {
    return {
      data: null,
      error: { getMessages: { message: error } },
      isLoading: false,
      nextPage,
    } as ErrorOf<UseNotificationsReturn>;
  }

  return {
    data: notifications,
    error: null,
    isLoading: false,
    nextPage,
  } as SuccessOf<UseNotificationsReturn>;
};
