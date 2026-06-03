import { SubscriptionNotifier } from "./notifier";
import { Subscription, type ISubscription, type Observer } from "./subscription";

type ObservableSource<T> = Iterable<T> | ObservableLike<T> | T;

export interface ObservableLike<T> {
  subscribe(observer: Observer<T>): ISubscription<T>;
  remove(ref: ISubscription<T>): void;
}

export class Observable<T> implements ObservableLike<T> {
  private readonly _subscribers: Set<ISubscription<T>> = new Set();
  private readonly _notification = new SubscriptionNotifier<T>();
  private readonly _producer?: (observer: Observer<T>) => void;

  constructor(producer?: (observer: Observer<T>) => void) {
    this._producer = producer;
  }

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

  static isObservable<V>(value: unknown): value is ObservableLike<V> {
    return (
      typeof value === "object" &&
      value !== null &&
      typeof (value as ObservableLike<V>).subscribe === "function" &&
      typeof (value as ObservableLike<V>).remove === "function"
    );
  }

  public get subscriptions(): number {
    return this._subscribers.size;
  }

  public UNSAFE_clear(): void {
    this._subscribers.clear();
  }

  public remove(ref: ISubscription<T>): void {
    this._subscribers.delete(ref);
  }

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

function isIterable<T>(value: Iterable<T> | T): value is Iterable<T> {
  return typeof value === "object" && value !== null && Symbol.iterator in value;
}
