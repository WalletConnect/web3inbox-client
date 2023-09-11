import { widgetAccountSubject } from "./events";

export const watchSubscription = (callback: (isSubbed: boolean) => void) => {
  const subscription = widgetAccountSubject.subscribe((widgetAccount) => {
    callback(widgetAccount.isSubscribed);
  });

  return subscription;
};

export const isSubscribed = () => {
  return widgetAccountSubject.value;
};
