import type { NotifyClientTypes } from "@walletconnect/notify-client";
import { Web3InboxClient } from "@web3inbox/core";
import { useEffect, useMemo, useState } from "react";
import { ErrorOf, HooksReturn, SuccessOf } from "../types/hooks";
import { useWeb3InboxClient } from "./useWeb3InboxClient";

type NotificationsReturn = HooksReturn<
  {
    notifications: NotifyClientTypes.NotifyMessage[];
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
  domain?: string,
  client?: Web3InboxClient
): NotificationsReturn => {
  const [clientData, setClientData] = useState<Web3InboxClient | undefined>(
    client
  );
  const { data: web3inboxClientData, error: clientError } =
    useWeb3InboxClient();

  useEffect(() => {
    if (!clientData && web3inboxClientData) {
      setClientData(web3inboxClientData.client);
    }
  }, [web3inboxClientData]);

  const [notifications, setNotifications] =
    useState<SuccessOf<NotificationsReturn>["data"]>();

  const [nextPage, setNextPage] = useState<() => void>(() => {});

  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    if (!clientData) return;

    try {
      const { nextPage: nextPageFunc, stopWatchingNotifications } =
        clientData.pageNotifications(
          notificationsPerPage,
          isInfiniteScroll,
          account,
          domain
        )((notifications) => {
          console.log(">>> got new notifications", notifications);
          setNotifications(notifications);
        });

      setNextPage(nextPageFunc);

      return () => {
        console.log("stopWatchingNotifications");
        stopWatchingNotifications();
      };
    } catch (e: any) {
      setError(e.message);
    }
  }, [
    clientData,
    account,
    domain,
    notificationsPerPage,
    isInfiniteScroll,
    setNotifications,
  ]);

  console.log(
    ">>>> notifications state: ",
    notifications,
    client ? true : false,
    clientError,
    error
  );

  if (!clientData) {
    return {
      data: null,
      error: null,
      isLoading: true,
      nextPage,
    };
  }

  if (clientError) {
    return {
      data: null,
      error: {
        client: clientError.client,
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
