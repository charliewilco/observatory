import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Queue } from "../dist/index.js";

describe("Queue", () => {
  it("starts empty by default", () => {
    const queue = new Queue();

    assert.equal(queue.size, 0);
    assert.equal(queue.isEmpty, true);
    assert.equal(queue.peek(), undefined);
    assert.equal(queue.dequeue(), undefined);
    assert.deepEqual(queue.drain(), []);
  });

  it("can be seeded and iterated without draining", () => {
    const queue = new Queue(["first", "second"]);

    assert.equal(queue.size, 2);
    assert.equal(queue.isEmpty, false);
    assert.equal(queue.peek(), "first");
    assert.deepEqual([...queue], ["first", "second"]);
    assert.equal(queue.size, 2);
  });

  it("enqueues, dequeues, clears, and drains in insertion order", () => {
    const queue = new Queue();

    assert.equal(queue.enqueue("a"), queue);
    queue.enqueue("b").enqueue("c");

    assert.equal(queue.dequeue(), "a");
    assert.deepEqual(queue.drain(), ["b", "c"]);
    assert.equal(queue.isEmpty, true);

    queue.enqueue("d").enqueue("e");
    queue.clear();

    assert.equal(queue.size, 0);
    assert.equal(queue.dequeue(), undefined);
  });
});
