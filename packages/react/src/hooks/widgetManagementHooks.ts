import { toggleW3iWidget, watchWidgetVisibility } from "@web3inbox/widget-html";
import {
  closeW3iWidget,
  openW3iWidget,
  w3iWidgetIsOpen,
} from "@web3inbox/widget-html";
import { useEffect, useState } from "react";

export const useManageW3iWidget = () => {
  const [isVisible, setIsVisible] = useState(w3iWidgetIsOpen);

  useEffect(() => {
    const sub = watchWidgetVisibility(setIsVisible);
    return () => {
      sub.unsubscribe();
    };
  }, [setIsVisible]);

  return {
    open: openW3iWidget,
    close: closeW3iWidget,
    toggle: toggleW3iWidget,
    isOpen: isVisible,
  };
};
