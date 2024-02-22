import type { NotifyClientTypes } from "@walletconnect/notify-client";
import { useEffect, useState } from "react";
import { ErrorOf, HooksReturn, LoadingOf, SuccessOf } from "../types/hooks";
import { useWeb3InboxClient } from "./useWeb3InboxClient";

const waitFor = async (condition: () => boolean) => {
  return new Promise<void>((resolve) => {
    setInterval(() => {
      if (condition()) {
        resolve();
      }
    }, 100);
  });
};

type UseNotificationsData = NotifyClientTypes.NotifyNotification[];
type NextPageState = () => Promise<void>;
type UseNotificationsReturn = HooksReturn<
  NotifyClientTypes.NotifyNotification[],
  {
    hasMore: boolean;
    isLoadingNextPage: boolean;
    fetchNextPage: NextPageState;
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
  domain?: string
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
      const { nextPage: nextPageFunc, stopWatchingNotifications } =
        w3iClient.pageNotifications(
          notificationsPerPage,
          isInfiniteScroll,
          account,
          domain
        )((data) => {
          setData(data.notifications);
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

  if (isLoadingNextPage) {
    return {
      data,
      hasMore,
      error: null,
      isLoading: false,
      isLoadingNextPage: isLoadingNextPage,
      fetchNextPage,
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
    } as ErrorOf<UseNotificationsReturn>;
  }

  return {
    data,
    hasMore,
    error: null,
    isLoading: false,
    isLoadingNextPage: false,
    fetchNextPage,
  } as SuccessOf<UseNotificationsReturn>;
};
