import { toggleW3iWidget } from "@web3inbox/widget-html";
import {
  closeW3iWidget,
  openW3iWidget,
  w3iWidgetIsOpen,
} from "@web3inbox/widget-html";

export const useManageW3iWidget = () => {
  return {
    open: openW3iWidget,
    close: closeW3iWidget,
    toggle: toggleW3iWidget,
    isOpen: w3iWidgetIsOpen,
  };
};
