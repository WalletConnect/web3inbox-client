import { useViewState } from "@web3inbox/core";
import { useCallback } from "react";
import { useWeb3InboxClient } from "./web3inboxClient";

export const useManageView = () => {
  const client = useWeb3InboxClient();
  const { isOpen } = useViewState();

  const open = useCallback(() => {
    if (client) {
      client.openView();
    }
  }, [client]);

  const close = useCallback(() => {
    if (client) {
      client.closeView();
    }
  }, [client]);

  const toggle = useCallback(() => {
    if (client) {
      client.toggle();
    }
  }, [client]);

  return { isOpen, open, close, toggle };
};
