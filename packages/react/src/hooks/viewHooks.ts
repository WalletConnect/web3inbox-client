import { useCallback, useEffect, useState } from "react";
import { useWeb3InboxClient } from "./web3inboxClient";

export const useManageView = () => {
  const client = useWeb3InboxClient();
  const [isOpen, setOpen] = useState(client?.getViewIsOpen() ?? false);

  useEffect(() => {
    if (client) {
      const sub = client.watchViewIsOpen(setOpen);
      return sub;
    }
  }, [setOpen, client]);

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
