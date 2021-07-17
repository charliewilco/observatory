import { Queue, IListLike } from "./queue";
import { ISubscription } from "./subscription";

type NotificationType<T> = Exclude<keyof ISubscription<T>, "unsubscribe">;

interface Notification<T> {
  subscription: ISubscription<T>;
  type: NotificationType<T>;
  value?: T | unknown;
}

export class SubscriptionNotifier<T> {
  private _queue: IListLike<Notification<T>>;
  constructor() {
    this._queue = new Queue();
  }

  public enqueue(notification: Notification<T>) {
    this._queue.add(notification);
  }

  public flush() {}
}
