import { Observable, type ObservableLike } from "./observable.ts";
import { Queue } from "./queue.ts";
import type { ISubscription, Observer } from "./subscription.ts";

/**
 * The kind of mutation observed by an `ObservableBridge`.
 */
export type ObservableBridgeChangeType = "set" | "delete";

/**
 * A change record emitted when a proxied object is mutated.
 */
export interface ObservableBridgeChange<T extends object> {
  /**
   * The mutation kind.
   */
  type: ObservableBridgeChangeType;

  /**
   * The property that changed.
   */
  property: PropertyKey;

  /**
   * The value before the mutation.
   */
  previousValue: unknown;

  /**
   * The value after the mutation.
   */
  value: unknown;

  /**
   * The live proxy associated with the bridge.
   */
  target: T;

  /**
   * A shallow copy of the proxied object after the mutation.
   */
  snapshot: T;
}

/**
 * Bridges property writes on an object into observable change records.
 */
export class ObservableBridge<T extends object> implements ObservableLike<
  ObservableBridgeChange<T>
> {
  private readonly _changes = new Observable<ObservableBridgeChange<T>>();
  private readonly _queue = new Queue<ObservableBridgeChange<T>>();
  private readonly _proxy: T;
  private _closed = false;

  /**
   * Create a bridge for an object.
   */
  static create<T extends object>(value: T): ObservableBridge<T> {
    return new ObservableBridge(value);
  }

  /**
   * Create a bridge for an object.
   */
  constructor(initialValue: T) {
    this._proxy = new Proxy(initialValue, {
      set: (target, property, value, receiver) => {
        const previousValue = Reflect.get(target, property, receiver);
        const didSet = Reflect.set(target, property, value, receiver);

        if (didSet && !Object.is(previousValue, value)) {
          this.enqueueChange({
            type: "set",
            property,
            previousValue,
            value,
            target: this._proxy,
            snapshot: createSnapshot(target),
          });
        }

        return didSet;
      },
      deleteProperty: (target, property) => {
        const hadProperty = Reflect.has(target, property);
        const previousValue = Reflect.get(target, property);
        const didDelete = Reflect.deleteProperty(target, property);

        if (didDelete && hadProperty) {
          this.enqueueChange({
            type: "delete",
            property,
            previousValue,
            value: undefined,
            target: this._proxy,
            snapshot: createSnapshot(target),
          });
        }

        return didDelete;
      },
    });
  }

  /**
   * The live proxy that emits change records when mutated.
   */
  public get proxy(): T {
    return this._proxy;
  }

  /**
   * Whether this bridge has been closed.
   */
  public get closed(): boolean {
    return this._closed;
  }

  /**
   * Return the live proxy for compatibility with the original bridge sketch.
   */
  public getValue(): T {
    return this.proxy;
  }

  /**
   * Register an observer for proxy change records.
   */
  public subscribe(
    observer: Observer<ObservableBridgeChange<T>>,
  ): ISubscription<ObservableBridgeChange<T>> {
    return this._changes.subscribe(observer);
  }

  /**
   * Remove a change-record subscription.
   */
  public remove(ref: ISubscription<ObservableBridgeChange<T>>): void {
    this._changes.remove(ref);
  }

  /**
   * Complete the bridge and stop emitting future change records.
   */
  public close(): void {
    if (this.closed) {
      return;
    }

    this._closed = true;
    this._queue.clear();
    this._changes.done();
  }

  private enqueueChange(change: ObservableBridgeChange<T>): void {
    if (this.closed) {
      return;
    }

    this._queue.enqueue(change);
    this.flushChanges();
  }

  private flushChanges(): void {
    while (!this._queue.isEmpty) {
      const change = this._queue.dequeue();

      if (change) {
        this._changes.next(change);
      }
    }
  }
}

function createSnapshot<T extends object>(value: T): T {
  if (Array.isArray(value)) {
    return [...value] as T;
  }

  return { ...value };
}
