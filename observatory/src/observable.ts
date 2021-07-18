import { Subscription, ISubscription, Observer } from "./subscription";

export interface ObservableLike<T> {
  subscribe(observer: Observer<T>): ISubscription<T>;
  remove(ref: ISubscription<T>): void;
}

export class Observable<T> implements ObservableLike<T> {
  private readonly _subscribers: Set<ISubscription<T>> = new Set();

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
    this._subscribers.forEach((sub) => {
      sub.done();
    });
  }

  public error(err: unknown) {
    this._subscribers.forEach((sub) => {
      sub.error(err);
    });
  }

  public next(item: T) {
    this._subscribers.forEach((sub) => {
      sub.next(item);
    });
  }
}
