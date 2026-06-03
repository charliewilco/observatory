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

## Development

```sh
npm install
npm run typecheck
npm test
npm run build
```

The test suite uses Node's built-in test runner and runs against the built package output.
