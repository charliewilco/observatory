# Observatory

A small typed observable library with synchronous delivery, source-first TypeScript tests, and ESM/CommonJS package output.

## Install

```sh
npm install @charliewilco/observatory
```

## Package Support

Observatory publishes:

- ESM via `import`
- CommonJS via `require`
- TypeScript declarations

```ts
import { Observable } from "@charliewilco/observatory";
```

```js
const { Observable } = require("@charliewilco/observatory");
```

## Usage

```ts
import { Observable } from "@charliewilco/observatory";

const observable = new Observable<string>();

const subscription = observable.subscribe({
  onNext: (value) => console.log(value),
  onError: (error) => console.error(error),
  onDone: () => console.log("done"),
});

observable.next("Hello");
observable.done();

subscription.unsubscribe();
```

## Observable

### `new Observable<T>()`

Creates a synchronous observable that can deliver values, errors, and completion events to its current subscribers.

```ts
const observable = new Observable<number>();
const values: number[] = [];

observable.subscribe({ onNext: (value) => values.push(value) });
observable.next(1);
observable.next(2);
```

### `subscribe(observer)`

Adds an observer and returns an `ISubscription<T>`.

```ts
const subscription = observable.subscribe({
  onNext: (value) => console.log(value),
});

subscription.unsubscribe();
```

### `next(value)`

Synchronously sends a value to every current subscriber.

### `error(error)`

Synchronously notifies current subscribers of an error. Errors are non-terminal in this implementation, so subscriptions remain active and may receive later values.

### `done()`

Synchronously notifies current subscribers that the observable is complete, then clears the current subscription set. Completion is terminal for those subscriptions.

### `subscriptions`

Returns the number of active subscribers currently attached to the observable.

### `UNSAFE_clear()`

Removes every subscription without calling `onDone`. Prefer `done()` unless you intentionally need to discard subscriptions without notifying observers.

### `Observable.from(source)`

Creates a synchronous observable from a single value or an iterable. The created observable emits every source value and completes immediately during `subscribe()`. If the source is already observable-like, it is returned unchanged.

```ts
const observable = Observable.from(["a", "b", "c"]);

observable.subscribe({
  onNext: (value) => console.log(value),
  onDone: () => console.log("done"),
});
```

### `Observable.isObservable(value)`

Checks whether a value satisfies the `ObservableLike<T>` contract.

## Subscriptions

### `Observer<T>`

An observer is an object with optional callbacks:

- `onNext(value)`: called when a value is emitted
- `onError(error)`: called when an error is emitted
- `onDone()`: called when the subscription completes

### `ISubscription<T>`

The subscription returned by `subscribe()`:

- `next(value)`: manually deliver a value if the subscription is active
- `error(error)`: manually deliver an error if the subscription is active
- `done()`: complete the subscription and call `onDone` once
- `unsubscribe()`: complete the subscription and remove it from the source observable
- `state`: the current `SubscriptionState`

### `SubscriptionState`

Lifecycle states:

- `INITIALIZING`: reserved for subscriptions that have not started
- `RUNNING`: active and able to receive notifications
- `CLOSED`: completed and ignoring later notifications

### `ObservableLike<T>`

The minimal observable contract:

```ts
interface ObservableLike<T> {
  subscribe(observer: Observer<T>): ISubscription<T>;
  remove(ref: ISubscription<T>): void;
}
```

## ObservableBridge

### `ObservableBridge.create(object)`

Creates a shallow proxy bridge around an object. Mutating the returned proxy emits ordered change records.

```ts
import { ObservableBridge } from "@charliewilco/observatory";

const bridge = ObservableBridge.create({ count: 0 });

bridge.subscribe({
  onNext: (change) => {
    console.log(change.type, change.property, change.value);
  },
});

bridge.proxy.count = 1;
delete bridge.proxy.count;
bridge.close();
```

The bridge observes only shallow property writes and deletes on `bridge.proxy`. It does not recursively proxy nested objects. Delivery is synchronous, and `close()` is terminal: subscribers are completed and later mutations do not emit changes.

Change records include:

- `type`: `"set"` or `"delete"`
- `property`: the changed property key
- `previousValue`: the value before the mutation
- `value`: the value after the mutation
- `target`: the live proxy
- `snapshot`: a shallow copy after the mutation

## Queue

A small first-in, first-out queue used internally by the notifier and bridge. It is exported for consumers that need the same ordered delivery primitive.

```ts
import { Queue } from "@charliewilco/observatory";

const queue = new Queue(["a"]);

queue.enqueue("b");
queue.dequeue(); // "a"
queue.drain(); // ["b"]
```

Queue API:

- `size`: number of queued items
- `isEmpty`: whether the queue has no queued items
- `enqueue(value)`: add an item to the end of the queue
- `peek()`: read the next item without removing it
- `dequeue()`: remove and return the next item
- `clear()`: remove every queued item
- `drain()`: remove and return all queued items in insertion order
- `[Symbol.iterator]`: iterate queued items without removing them

## SubscriptionNotifier

`SubscriptionNotifier<T>` is a low-level ordered delivery helper used by `Observable`. It is exported for advanced consumers that need to enqueue `next`, `error`, and `done` notifications for `ISubscription<T>` values and flush them synchronously.

Most consumers should use `Observable<T>` instead.

## Development

```sh
npm install
npm run format
npm run format:check
npm test
npm run test:coverage
npm run check
```

Formatting and lint checks use Biome. Tests use Node's built-in test runner. Behavioral tests run against source files, package smoke tests run against the built output, and source coverage is required to stay at 100% for lines, branches, and functions.
