import { Queue } from "@charliewilco/iterable-lists";
import { SubscriptionState } from "./subscription";
import type { ISubscription } from "./subscription";

export type NotificationType<T> = Exclude<keyof ISubscription<T>, "unsubscribe">;

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
  #queue: Queue<Notification<T>>;
  constructor() {
    this.#queue = new Queue();
  }

  enqueue(notification: Notification<T>) {
    this.#queue.add(notification);
  }

  flush() {
    while (this.#queue.size > 0) {
      const notification = this.#queue.remove();
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
