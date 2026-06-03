import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SubscriptionNotifier, SubscriptionState } from "../dist/index.js";

function createSubscription() {
  const values = [];
  const errors = [];
  const doneCalls = [];

  return {
    values,
    errors,
    doneCalls,
    subscription: {
      state: SubscriptionState.RUNNING,
      next(value) {
        values.push(value);
      },
      error(error) {
        errors.push(error);
      },
      done() {
        doneCalls.push("done");
        this.state = SubscriptionState.CLOSED;
      },
      unsubscribe() {
        this.done();
      },
    },
  };
}

describe("SubscriptionNotifier", () => {
  it("flushes an empty queue without side effects", () => {
    const notifier = new SubscriptionNotifier();

    assert.doesNotThrow(() => notifier.flush());
  });

  it("delivers queued notifications in insertion order", () => {
    const notifier = new SubscriptionNotifier();
    const first = createSubscription();
    const second = createSubscription();
    const error = new Error("queued");

    notifier.enqueue({
      subscription: first.subscription,
      type: "next",
      value: "first",
    });
    notifier.enqueue({
      subscription: second.subscription,
      type: "error",
      value: error,
    });
    notifier.enqueue({
      subscription: first.subscription,
      type: "done",
    });
    notifier.flush();
    notifier.flush();

    assert.deepEqual(first.values, ["first"]);
    assert.deepEqual(first.errors, []);
    assert.deepEqual(first.doneCalls, ["done"]);
    assert.equal(first.subscription.state, SubscriptionState.CLOSED);
    assert.deepEqual(second.values, []);
    assert.deepEqual(second.errors, [error]);
    assert.deepEqual(second.doneCalls, []);
  });
});
