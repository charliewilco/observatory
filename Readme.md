# Observatory

A small typed observable library with ESM and CommonJS builds.

## Install

```sh
npm install @charliewilco/observatory
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

## API

### `new Observable<T>()`

Creates an observable that can receive values through `next`, errors through `error`, and completion through `done`.

```ts
const observable = new Observable<number>();
const values: number[] = [];

observable.subscribe({ onNext: (value) => values.push(value) });
observable.next(1);
observable.next(2);
```

### `subscribe(observer)`

Adds an observer and returns a subscription. Calling `unsubscribe()` removes the subscription and calls its `onDone` handler once.

```ts
const subscription = observable.subscribe({
  onNext: (value) => console.log(value),
});

subscription.unsubscribe();
```

### `done()`

Completes the observable, notifies current subscribers, and clears all subscriptions.

### `error(error)`

Notifies current subscribers of an error. Subscriptions remain active.

### `Observable.from(source)`

Creates a synchronous observable from a single value or an iterable. If the source is already observable-like, it is returned unchanged.

```ts
const observable = Observable.from(["a", "b", "c"]);

observable.subscribe({
  onNext: (value) => console.log(value),
  onDone: () => console.log("done"),
});
```

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

Change records include:

- `type`: `"set"` or `"delete"`
- `property`: the changed property key
- `previousValue`: the value before the mutation
- `value`: the value after the mutation
- `target`: the live proxy
- `snapshot`: a shallow copy after the mutation

### `Queue`

A small first-in, first-out queue used internally by the notifier and bridge. It is exported for consumers that need the same ordered delivery primitive.

```ts
import { Queue } from "@charliewilco/observatory";

const queue = new Queue(["a"]);

queue.enqueue("b");
queue.dequeue(); // "a"
queue.drain(); // ["b"]
```

## Development

```sh
npm install
npm run typecheck
npm test
npm run test:coverage
npm run build
```

The test suite uses Node's built-in test runner and runs against the built package output. Coverage is required to stay at 100% for lines, branches, and functions.
