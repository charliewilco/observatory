import { SubscriptionNotifier } from "./notifier.ts";
import { Subscription, type ISubscription, type Observer } from "./subscription.ts";

/**
 * A value or producer that can be converted into an observable sequence.
 */
type ObservableSource<T> = Iterable<T> | ObservableLike<T> | T;

/**
 * The minimal contract implemented by values that can accept observers.
 */
export interface ObservableLike<T> {
  /**
   * Register an observer and return a subscription handle.
   */
  subscribe(observer: Observer<T>): ISubscription<T>;

  /**
   * Remove a subscription from the observable.
   */
  remove(ref: ISubscription<T>): void;
}

/**
 * A synchronous observable that fan-outs values, errors, and completion events
 * to its current subscribers.
 */
export class Observable<T> implements ObservableLike<T> {
  private readonly _subscribers: Set<ISubscription<T>> = new Set();
  private readonly _notification = new SubscriptionNotifier<T>();
  private readonly _producer?: (observer: Observer<T>) => void;

  /**
   * Create an observable.
   *
   * @param producer Optional synchronous producer used by `Observable.from()`.
   */
  constructor(producer?: (observer: Observer<T>) => void) {
    this._producer = producer;
  }

  /**
   * Create a synchronous observable from one value or an iterable.
   *
   * Observable-like values are returned unchanged so existing subscription
   * semantics are preserved.
   */
  static from<U>(source: ObservableSource<U>): ObservableLike<U> {
    if (Observable.isObservable<U>(source)) {
      return source;
    }

    return new Observable<U>((observer) => {
      const values = isIterable(source) ? source : [source];

      for (const value of values) {
        observer.onNext?.(value);
      }

      observer.onDone?.();
    });
  }

  /**
   * Check whether a value satisfies the observable-like contract.
   */
  static isObservable<V>(value: unknown): value is ObservableLike<V> {
    return (
      typeof value === "object" &&
      value !== null &&
      typeof (value as ObservableLike<V>).subscribe === "function" &&
      typeof (value as ObservableLike<V>).remove === "function"
    );
  }

  /**
   * The number of active subscribers currently attached to this observable.
   */
  public get subscriptions(): number {
    return this._subscribers.size;
  }

  /**
   * Remove every subscription without notifying observers.
   *
   * This is intentionally unsafe because observers do not receive `onDone`.
   */
  public UNSAFE_clear(): void {
    this._subscribers.clear();
  }

  /**
   * Remove a subscription from this observable.
   */
  public remove(ref: ISubscription<T>): void {
    this._subscribers.delete(ref);
  }

  /**
   * Register an observer and return its subscription handle.
   */
  public subscribe(observer: Observer<T>): ISubscription<T> {
    const ref: ISubscription<T> = new Subscription(observer, this);

    this._subscribers.add(ref);

    if (this._producer) {
      this._producer({
        onNext: (value) => ref.next(value),
        onError: (err) => ref.error(err),
        onDone: () => ref.done(),
      });
      this.remove(ref);
    }

    return ref;
  }

  /**
   * Notify all current subscribers that the observable is complete.
   *
   * Completion is terminal for the observable's current subscription set.
   */
  public done(): void {
    for (const subscription of this._subscribers) {
      this._notification.enqueue({
        subscription,
        type: "done",
      });
    }

    this._notification.flush();
    this._subscribers.clear();
  }

  /**
   * Notify all current subscribers of an error.
   *
   * Errors are non-terminal in this implementation; subscriptions stay active.
   */
  public error(err: unknown): void {
    for (const subscription of this._subscribers) {
      this._notification.enqueue({
        subscription,
        type: "error",
        value: err,
      });
    }

    this._notification.flush();
  }

  /**
   * Send the next value to every current subscriber.
   */
  public next(value: T): void {
    for (const subscription of this._subscribers) {
      this._notification.enqueue({
        subscription,
        type: "next",
        value,
      });
    }

    this._notification.flush();
  }
}

/**
 * Check whether a value can be iterated with `for...of`.
 */
function isIterable<T>(value: Iterable<T> | T): value is Iterable<T> {
  return typeof value === "object" && value !== null && Symbol.iterator in value;
}
