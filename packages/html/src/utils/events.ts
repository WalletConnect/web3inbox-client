import { BehaviorSubject } from "rxjs";

// Is Visible?
export const widgetVisibilitySubject = new BehaviorSubject(false);

// Is Loaded?
export const widgetLoadSubject = new BehaviorSubject(false);

// Did get a notification?
export const widgetRecentNotificationsSubject = new BehaviorSubject(0);

// Is the account passed subscribed?
export const widgetAccountSubject = new BehaviorSubject({
  isSubscribed: false,
});
