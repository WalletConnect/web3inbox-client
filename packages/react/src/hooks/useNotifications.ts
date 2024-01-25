import type { NotifyClientTypes } from "@walletconnect/notify-client";
import { useEffect, useState } from "react";
import { ErrorOf, HooksReturn, SuccessOf } from "../types/hooks";
import { useWeb3InboxClient } from "./useWeb3InboxClient";

type NotificationsReturn = HooksReturn<
  {
    notifications: NotifyClientTypes.NotifyNotification[];
    hasMore: boolean;
  },
  { nextPage: () => void },
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
): NotificationsReturn => {
  const { data: w3iClient, error: w3iClientError } = useWeb3InboxClient();
  const [nextPage, setNextPage] = useState<() => void>(() => {});
  const [error, setError] = useState<null | string>(null);
  const [notifications, setNotifications] =
    useState<SuccessOf<NotificationsReturn>["data"]>();

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
    } as ErrorOf<NotificationsReturn>;
  }

  if (error) {
    return {
      data: null,
      error: { getMessages: { message: error } },
      isLoading: false,
      nextPage,
    } as ErrorOf<NotificationsReturn>;
  }

  return {
    data: notifications,
    error: null,
    isLoading: false,
    nextPage,
  } as SuccessOf<NotificationsReturn>;
};
