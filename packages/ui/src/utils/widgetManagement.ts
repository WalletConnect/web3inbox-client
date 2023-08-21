import { widgetVisibilitySubject } from "./events";

export const openW3iWidget = () => {
  widgetVisibilitySubject.next(true);
};

export const closeW3iWidget = () => {
  widgetVisibilitySubject.next(false);
};

export const toggleW3iWidget = () => {
  widgetVisibilitySubject.next(!widgetVisibilitySubject.value);
};

export const w3iWidgetIsOpen = widgetVisibilitySubject.value;
