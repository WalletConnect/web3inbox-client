import {
  toggleW3iWidget,
  watchWidgetLoad,
  watchWidgetVisibility,
} from "@web3inbox/widget-html";
import {
  closeW3iWidget,
  openW3iWidget,
  w3iWidgetIsOpen,
  w3iWidgetIsLoaded,
} from "@web3inbox/widget-html";
import { useEffect, useState } from "react";

export const useManageW3iWidget = () => {
  const [isOpen, setIsOpen] = useState(w3iWidgetIsOpen);
  const [isLoaded, setIsLoaded] = useState(w3iWidgetIsLoaded);

  useEffect(() => {
    const visibilitySub = watchWidgetVisibility(setIsOpen);
    const loadSub = watchWidgetLoad(setIsLoaded);

    return () => {
      visibilitySub.unsubscribe();
      loadSub.unsubscribe();
    };
  }, [setIsOpen]);

  return {
    open: openW3iWidget,
    close: closeW3iWidget,
    toggle: toggleW3iWidget,
    isOpen,
    isLoaded,
  };
};
