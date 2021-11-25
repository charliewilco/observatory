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

export interface IObserver<T> {
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
  #state: SubscriptionState = SubscriptionState.INITIALIZING;
  #observable: ObservableLike<T>;
  #observer: IObserver<T>;
  // #queue: Queue<K> = new Queue();
  constructor(observer: IObserver<T>, observable: ObservableLike<T>) {
    this.#observable = observable;
    this.#observer = observer;
  }

  get state(): SubscriptionState {
    return this.#state;
  }

  set state(state: SubscriptionState) {
    this.#state = state;
  }

  next(value: T) {
    if (this.#observer.onNext) {
      this.#observer.onNext(value);
    }
  }

  error(err: unknown) {
    if (this.#observer.onError) {
      this.#observer.onError(err);
    }
  }

  done() {
    if (this.#observer.onDone) {
      this.#observer.onDone();
    }
  }

  unsubscribe(): void {
    this.done();
    this.#observable.remove(this);
  }
}
