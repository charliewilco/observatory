import { SubscriptionNotifier } from "./notifier";
import { Subscription, ISubscription, Observer } from "./subscription";

export interface ObservableLike<T> {
  subscribe(observer: Observer<T>): ISubscription<T>;
  remove(ref: ISubscription<T>): void;
}

export class Observable<T> implements ObservableLike<T> {
  private readonly _subscribers: Set<ISubscription<T>> = new Set();
  private _notification = new SubscriptionNotifier<T>();

  static from<U>(value: U) {
    let C = typeof this === "function" ? this : Observable;
  }

  static isObservable<V extends unknown>(x: any): x is ObservableLike<V> {
    return x instanceof Observable;
  }

  public get subscriptions(): number {
    return this._subscribers.size;
  }

  public UNSAFE_clear() {
    this._subscribers.clear();
  }

  public remove(ref: ISubscription<T>) {
    this._subscribers.delete(ref);
  }

  public subscribe(observer: Observer<T>) {
    const ref: ISubscription<T> = new Subscription(observer, this);

    this._subscribers.add(ref);
    return ref;
  }

  public done() {
    this._subscribers.forEach((subscription) => {
      this._notification.enqueue({
        subscription,
        type: "done",
      });
    });
  }

  public error(err: unknown) {
    this._subscribers.forEach((subscription) => {
      this._notification.enqueue({
        subscription,
        type: "error",
        value: err,
      });
    });

    this._notification.flush();
  }

  public next(value: T) {
    this._subscribers.forEach((subscription) => {
      this._notification.enqueue({
        subscription,
        type: "next",
        value,
      });
    });

    this._notification.flush();
  }
}
