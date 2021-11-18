import { Queue } from "@charliewilco/iterable-lists";
import { ISubscription, SubscriptionState } from "./subscription";

type Notification<T> =
  | {
      subscription: ISubscription<T>;
      type: "done";
    }
  | {
      subscription: ISubscription<T>;
      type: "next";
      value: T;
    }
  | {
      subscription: ISubscription<T>;
      type: "error";
      value: unknown;
    };

export class SubscriptionNotifier<T> extends Queue<Notification<T>> {
  constructor() {
    super();
  }

  public enqueue(notification: Notification<T>): void {
    this.add(notification);
  }

  public flush(): void {
    while (this.size > 0) {
      const notification = this.remove();
      if (notification) {
        notification.subscription.state = SubscriptionState.RUNNING;
        switch (notification.type) {
          case "next":
            notification.subscription[notification.type].call(
              notification.subscription,
              notification.value
            );
            notification.subscription.state = SubscriptionState.CLOSED;
            break;
          case "done":
            notification.subscription[notification.type].call(notification.subscription);
            break;
          case "error":
            notification.subscription[notification.type].call(
              notification.subscription,
              notification.value
            );
            break;
        }
      }
    }
  }
}
