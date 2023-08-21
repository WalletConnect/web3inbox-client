import { BehaviorSubject } from "rxjs";

export const widgetVisibilitySubject = new BehaviorSubject(false);

export const widgetRecentNotificationsSubject = new BehaviorSubject(0);

export const widgetAccountSubject = new BehaviorSubject({
  isSubscribed: false,
});
