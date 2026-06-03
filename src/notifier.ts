import type { ISubscription } from "./subscription";

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
  private readonly _queue: Notification<T>[] = [];

  public enqueue(notification: Notification<T>): void {
    this._queue.push(notification);
  }

  public flush(): void {
    while (this._queue.length > 0) {
      const notification = this._queue.shift();

      if (notification) {
        switch (notification.type) {
          case "next":
            notification.subscription.next(notification.value);
            break;
          case "done":
            notification.subscription.done();
            break;
          case "error":
            notification.subscription.error(notification.value);
            break;
        }
      }
    }
  }
}
