import { Queue } from "@charliewilco/iterable-lists";
import { ISubscription, SubscriptionState } from "./subscription";

type NotificationType<T> = Exclude<keyof ISubscription<T>, "unsubscribe">;

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

export class SubscriptionNotifier<T> {
  private _queue: Queue<Notification<T>>;
  constructor() {
    this._queue = new Queue();
  }

  public enqueue(notification: Notification<T>) {
    this._queue.add(notification);
  }

  public flush() {
    while (this._queue.size > 0) {
      const notification = this._queue.remove();
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
