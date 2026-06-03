import type { ObservableLike } from "./observable";

/**
 * A handle for receiving notifications from an observable and stopping them.
 */
export interface ISubscription<T> {
  /**
   * Complete this subscription and remove it from the source observable.
   */
  unsubscribe(): void;

  /**
   * The current lifecycle state of the subscription.
   */
  state: SubscriptionState;

  /**
   * Receive a value from the source observable.
   */
  next: NextHandler<T>;

  /**
   * Receive an error from the source observable.
   */
  error: ErrorHandler;

  /**
   * Complete this subscription.
   */
  done: DoneHandler;
}

/**
 * Receives a value emitted by an observable.
 */
type NextHandler<T> = (item: T) => void;

/**
 * Receives an error emitted by an observable.
 */
type ErrorHandler = (err: unknown) => void;

/**
 * Receives a completion notification from an observable.
 */
type DoneHandler = () => void;

/**
 * Optional callbacks invoked by a subscription.
 */
export interface Observer<T> {
  /**
   * Called when the observable emits a value.
   */
  onNext?: NextHandler<T>;

  /**
   * Called when the observable emits an error.
   */
  onError?: ErrorHandler;

  /**
   * Called when the subscription completes.
   */
  onDone?: DoneHandler;
}

/**
 * Lifecycle states for a subscription.
 */
export enum SubscriptionState {
  /**
   * Reserved for subscriptions that have been created but not started.
   */
  INITIALIZING,

  /**
   * The subscription is active and may receive notifications.
   */
  RUNNING,

  /**
   * The subscription has completed and ignores further notifications.
   */
  CLOSED,
}

/**
 * Default subscription implementation used by `Observable`.
 */
export class Subscription<T> implements ISubscription<T> {
  private _state: SubscriptionState = SubscriptionState.RUNNING;
  private readonly _observable: ObservableLike<T>;
  private readonly _observer: Observer<T>;

  /**
   * Create a subscription for an observer and its source observable.
   */
  constructor(observer: Observer<T>, observable: ObservableLike<T>) {
    this._observable = observable;
    this._observer = observer;
  }

  /**
   * The current lifecycle state.
   */
  get state(): SubscriptionState {
    return this._state;
  }

  /**
   * Update the lifecycle state.
   */
  set state(state: SubscriptionState) {
    this._state = state;
  }

  /**
   * Deliver a value to the observer if the subscription is still active.
   */
  public next(value: T): void {
    if (this.state === SubscriptionState.CLOSED) {
      return;
    }

    if (this._observer.onNext) {
      this._observer.onNext(value);
    }
  }

  /**
   * Deliver an error to the observer if the subscription is still active.
   */
  public error(err: unknown): void {
    if (this.state === SubscriptionState.CLOSED) {
      return;
    }

    if (this._observer.onError) {
      this._observer.onError(err);
    }
  }

  /**
   * Mark the subscription as complete and notify the observer once.
   */
  public done(): void {
    if (this.state === SubscriptionState.CLOSED) {
      return;
    }

    this.state = SubscriptionState.CLOSED;

    if (this._observer.onDone) {
      this._observer.onDone();
    }
  }

  /**
   * Complete the subscription and remove it from the source observable.
   */
  public unsubscribe(): void {
    try {
      this.done();
    } finally {
      this._observable.remove(this);
    }
  }
}
