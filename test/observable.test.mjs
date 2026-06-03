import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { describe, it } from "node:test";
import { Observable, SubscriptionState } from "../dist/index.js";

describe("Observable", () => {
  it("creates a running subscription", () => {
    const observable = new Observable();
    const subscription = observable.subscribe({});

    assert.equal(typeof observable.subscribe, "function");
    assert.equal(typeof subscription.unsubscribe, "function");
    assert.equal(subscription.state, SubscriptionState.RUNNING);
    assert.equal(observable.subscriptions, 1);
  });

  it("sends next values to every subscriber", () => {
    const observable = new Observable();
    const firstValues = [];
    const secondValues = [];

    observable.subscribe({ onNext: (value) => firstValues.push(value) });
    observable.subscribe({ onNext: (value) => secondValues.push(value) });

    observable.next("Hello");
    observable.next("Again");

    assert.deepEqual(firstValues, ["Hello", "Again"]);
    assert.deepEqual(secondValues, ["Hello", "Again"]);
    assert.equal(observable.subscriptions, 2);
  });

  it("sends errors without closing subscriptions", () => {
    const observable = new Observable();
    const errors = [];
    const values = [];

    observable.subscribe({
      onNext: (value) => values.push(value),
      onError: (err) => errors.push(err),
    });

    const error = new Error("boom");

    observable.error(error);
    observable.next("still running");

    assert.deepEqual(errors, [error]);
    assert.deepEqual(values, ["still running"]);
    assert.equal(observable.subscriptions, 1);
  });

  it("flushes done notifications and clears subscriptions", () => {
    const observable = new Observable();
    const doneCalls = [];
    const values = [];

    observable.subscribe({
      onNext: (value) => values.push(value),
      onDone: () => doneCalls.push("first"),
    });
    observable.subscribe({
      onNext: (value) => values.push(value),
      onDone: () => doneCalls.push("second"),
    });

    observable.done();
    observable.next("ignored");

    assert.deepEqual(doneCalls, ["first", "second"]);
    assert.deepEqual(values, []);
    assert.equal(observable.subscriptions, 0);
  });

  it("removes a subscription when it is unsubscribed", () => {
    const observable = new Observable();
    const doneCalls = [];

    const subscription = observable.subscribe({
      onDone: () => doneCalls.push("done"),
    });

    subscription.unsubscribe();
    subscription.unsubscribe();

    assert.deepEqual(doneCalls, ["done"]);
    assert.equal(subscription.state, SubscriptionState.CLOSED);
    assert.equal(observable.subscriptions, 0);
  });

  it("ignores next and error calls after unsubscribe", () => {
    const observable = new Observable();
    const values = [];
    const errors = [];

    const subscription = observable.subscribe({
      onNext: (value) => values.push(value),
      onError: (err) => errors.push(err),
    });

    subscription.unsubscribe();
    subscription.next("direct");
    subscription.error(new Error("ignored"));
    observable.next("observable");

    assert.deepEqual(values, []);
    assert.deepEqual(errors, []);
  });

  it("can clear subscriptions without calling done handlers", () => {
    const observable = new Observable();
    const doneCalls = [];

    observable.subscribe({ onDone: () => doneCalls.push("done") });
    observable.UNSAFE_clear();

    assert.equal(observable.subscriptions, 0);
    assert.deepEqual(doneCalls, []);
  });
});

describe("Observable static helpers", () => {
  it("recognizes Observable-like values", () => {
    const observable = new Observable();
    const observableLike = {
      subscribe() {
        return {
          unsubscribe() {},
          state: SubscriptionState.RUNNING,
          next() {},
          error() {},
          done() {},
        };
      },
      remove() {},
    };

    assert.equal(Observable.isObservable("foo"), false);
    assert.equal(Observable.isObservable(["foo", "bar", "baz"]), false);
    assert.equal(Observable.isObservable(observable), true);
    assert.equal(Observable.isObservable(observableLike), true);
  });

  it("returns Observable-like values unchanged from from()", () => {
    const observable = new Observable();

    assert.equal(Observable.from(observable), observable);
  });

  it("creates a synchronous observable from one value", () => {
    const observable = Observable.from("hello");
    const values = [];
    const doneCalls = [];

    const subscription = observable.subscribe({
      onNext: (value) => values.push(value),
      onDone: () => doneCalls.push("done"),
    });

    assert.deepEqual(values, ["hello"]);
    assert.deepEqual(doneCalls, ["done"]);
    assert.equal(subscription.state, SubscriptionState.CLOSED);
    assert.equal(observable.subscriptions, 0);
  });

  it("creates a synchronous observable from an iterable", () => {
    const observable = Observable.from(new Set(["a", "b", "c"]));
    const values = [];

    observable.subscribe({ onNext: (value) => values.push(value) });

    assert.deepEqual(values, ["a", "b", "c"]);
  });
});

describe("package output", () => {
  it("can be loaded through CommonJS", () => {
    const require = createRequire(import.meta.url);
    const cjs = require("../dist/index.cjs");

    assert.equal(typeof cjs.Observable, "function");
    assert.equal(typeof cjs.SubscriptionNotifier, "function");
  });
});
