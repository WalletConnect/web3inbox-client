import { useEffect, useState } from "react";
import { HooksReturn, SuccessOf } from "../types/hooks";
import { useWeb3InboxClient } from "./useWeb3InboxClient";
import { useSubscriptionState } from "../utils/snapshots";
import { Web3InboxClient } from "@web3inbox/core";

type UpdateSubscriptionReturnType = Awaited<
  ReturnType<Web3InboxClient["update"]>
>;
type UpdateSubscriptionData = UpdateSubscriptionReturnType | null;
type GetNotificationTypesReturnType = Awaited<
  ReturnType<Web3InboxClient["getNotificationTypes"]>
>;
type UseNotificationTypesData = GetNotificationTypesReturnType;
type UseNotificationTypesReturn = HooksReturn<
  UseNotificationTypesData,
  {
    update: (scope: string[]) => Promise<boolean>;
    updateData: UpdateSubscriptionData;
    updateError: string | null;
    updateIsLoading: boolean;
  }
>;

export const useNotificationTypes = (
  account?: string,
  domain?: string
): UseNotificationTypesReturn => {
  const { data: w3iClient } = useWeb3InboxClient();

  const { subscriptions: subscriptionsTrigger } = useSubscriptionState();
  const [data, setData] = useState<UseNotificationTypesData>(
    w3iClient?.getNotificationTypes(account) ?? {}
  );

  const [updateData, setUpdateData] = useState<UpdateSubscriptionData>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateIsLoading, setUpdateIsLoading] = useState<boolean>(false);

  const update = async (scope: string[]) => {
    setUpdateIsLoading(true);
    setUpdateError(null);

    return new Promise<UpdateSubscriptionReturnType>(
      async (resolve, reject) => {
        if (!w3iClient) {
          const err = new Error(
            "Web3InboxClient is not ready, cannot subscribe"
          );
          setUpdateError(err.message);
          return reject(err);
        }

        return await w3iClient
          .update(scope, account, domain)
          .then((res) => {
            setUpdateData(res);
            resolve(res);
          })
          .catch((e) => {
            setUpdateData(null);
            setUpdateError(e?.message ?? "Failed to subscribe");
            reject(e);
          })
          .finally(() => {
            setUpdateIsLoading(false);
          });
      }
    );
  };

  useEffect(() => {
    if (w3iClient) {
      setData(w3iClient.getNotificationTypes(account, domain));
    }
  }, [w3iClient, account, subscriptionsTrigger, domain]);

  return {
    data,
    error: null,
    isLoading: false,
    update,
    updateData,
    updateError,
    updateIsLoading,
  } as SuccessOf<UseNotificationTypesReturn>;
};
