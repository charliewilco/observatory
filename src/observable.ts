import { SubscriptionNotifier } from "./notifier";
import { Subscription } from "./subscription";
import type { ISubscription, IObserver } from "./subscription";

export interface ObservableLike<T> {
  subscribe(observer: IObserver<T>): ISubscription<T>;
  remove(ref: ISubscription<T>): void;
}

export class Observable<T> implements ObservableLike<T> {
  readonly #subscribers: Set<ISubscription<T>> = new Set();
  #notification = new SubscriptionNotifier<T>();

  static from<U>(value: U) {
    let C = typeof this === "function" ? this : Observable;
  }

  static isObservable<V extends unknown>(x: any): x is ObservableLike<V> {
    return x instanceof Observable;
  }

  get subscriptions(): number {
    return this.#subscribers.size;
  }

  UNSAFE_clear() {
    this.#subscribers.clear();
  }

  remove(ref: ISubscription<T>) {
    this.#subscribers.delete(ref);
  }

  subscribe(observer: IObserver<T>) {
    const ref: ISubscription<T> = new Subscription(observer, this);

    this.#subscribers.add(ref);
    return ref;
  }

  done() {
    this.#subscribers.forEach((subscription) => {
      this.#notification.enqueue({
        subscription,
        type: "done",
      });
    });
  }

  error(err: unknown) {
    this.#subscribers.forEach((subscription) => {
      this.#notification.enqueue({
        subscription,
        type: "error",
        value: err,
      });
    });

    this.#notification.flush();
  }

  next(value: T) {
    this.#subscribers.forEach((subscription) => {
      this.#notification.enqueue({
        subscription,
        type: "next",
        value,
      });
    });

    this.#notification.flush();
  }
}
