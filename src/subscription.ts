import type { ObservableLike } from "./observable";

export interface ISubscription<T> {
  unsubscribe(): void;
  state: SubscriptionState;
  next: NextHandler<T>;
  error: ErrorHandler;
  done: DoneHandler;
}

type NextHandler<T> = (item: T) => void;
type ErrorHandler = (err: unknown) => void;
type DoneHandler = () => void;

export interface Observer<T> {
  onNext?: NextHandler<T>;
  onError?: ErrorHandler;
  onDone?: DoneHandler;
}

export enum SubscriptionState {
  INITIALIZING,
  RUNNING,
  CLOSED,
}

export class Subscription<T> implements ISubscription<T> {
  private _state: SubscriptionState = SubscriptionState.RUNNING;
  private readonly _observable: ObservableLike<T>;
  private readonly _observer: Observer<T>;

  constructor(observer: Observer<T>, observable: ObservableLike<T>) {
    this._observable = observable;
    this._observer = observer;
  }

  get state(): SubscriptionState {
    return this._state;
  }

  set state(state: SubscriptionState) {
    this._state = state;
  }

  public next(value: T): void {
    if (this.state === SubscriptionState.CLOSED) {
      return;
    }

    if (this._observer.onNext) {
      this._observer.onNext(value);
    }
  }

  public error(err: unknown): void {
    if (this.state === SubscriptionState.CLOSED) {
      return;
    }

    if (this._observer.onError) {
      this._observer.onError(err);
    }
  }

  public done(): void {
    if (this.state === SubscriptionState.CLOSED) {
      return;
    }

    this.state = SubscriptionState.CLOSED;

    if (this._observer.onDone) {
      this._observer.onDone();
    }
  }

  public unsubscribe(): void {
    try {
      this.done();
    } finally {
      this._observable.remove(this);
    }
  }
}
