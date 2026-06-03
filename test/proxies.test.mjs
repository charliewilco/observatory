import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Observable, ObservableBridge, SubscriptionState } from "../dist/index.js";

describe("ObservableBridge", () => {
  it("creates an observable-like proxy bridge", () => {
    const bridge = ObservableBridge.create({ count: 0 });
    const changes = [];

    const subscription = bridge.subscribe({
      onNext: (change) => changes.push(change),
    });

    bridge.proxy.count = 1;

    assert.equal(Observable.isObservable(bridge), true);
    assert.equal(bridge.closed, false);
    assert.equal(bridge.getValue(), bridge.proxy);
    assert.equal(changes.length, 1);
    assert.equal(changes[0].type, "set");
    assert.equal(changes[0].property, "count");
    assert.equal(changes[0].previousValue, 0);
    assert.equal(changes[0].value, 1);
    assert.equal(changes[0].target, bridge.proxy);
    assert.deepEqual(changes[0].snapshot, { count: 1 });

    bridge.remove(subscription);
    bridge.proxy.count = 2;

    assert.equal(changes.length, 1);
  });

  it("does not emit when a property keeps the same value", () => {
    const bridge = new ObservableBridge({ label: "same" });
    const changes = [];

    bridge.subscribe({ onNext: (change) => changes.push(change) });
    bridge.proxy.label = "same";

    assert.deepEqual(changes, []);
  });

  it("emits delete changes only for existing properties", () => {
    const bridge = new ObservableBridge({ label: "gone", other: "kept" });
    const changes = [];

    bridge.subscribe({ onNext: (change) => changes.push(change) });

    delete bridge.proxy.missing;
    delete bridge.proxy.label;

    assert.equal(changes.length, 1);
    assert.equal(changes[0].type, "delete");
    assert.equal(changes[0].property, "label");
    assert.equal(changes[0].previousValue, "gone");
    assert.equal(changes[0].value, undefined);
    assert.deepEqual(changes[0].snapshot, { other: "kept" });
  });

  it("uses shallow array snapshots for array proxies", () => {
    const bridge = new ObservableBridge(["a"]);
    const changes = [];

    bridge.subscribe({ onNext: (change) => changes.push(change) });

    bridge.proxy[0] = "b";

    assert.equal(changes.length, 1);
    assert.deepEqual(changes[0].snapshot, ["b"]);
  });

  it("completes subscribers and stops emitting after close", () => {
    const bridge = new ObservableBridge({ enabled: true });
    const changes = [];
    const doneCalls = [];

    const subscription = bridge.subscribe({
      onNext: (change) => changes.push(change),
      onDone: () => doneCalls.push("done"),
    });

    bridge.close();
    bridge.close();
    bridge.proxy.enabled = false;

    assert.equal(bridge.closed, true);
    assert.equal(subscription.state, SubscriptionState.CLOSED);
    assert.deepEqual(doneCalls, ["done"]);
    assert.deepEqual(changes, []);
  });
});
