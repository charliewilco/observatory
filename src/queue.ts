/**
 * A small first-in, first-out queue used for ordered notification delivery.
 */
export class Queue<T> implements Iterable<T> {
  private readonly _items: T[] = [];

  /**
   * Create a queue with optional initial values.
   */
  constructor(values: Iterable<T> = []) {
    for (const value of values) {
      this.enqueue(value);
    }
  }

  /**
   * The number of items currently waiting in the queue.
   */
  public get size(): number {
    return this._items.length;
  }

  /**
   * Whether the queue has no pending items.
   */
  public get isEmpty(): boolean {
    return this.size === 0;
  }

  /**
   * Add an item to the end of the queue.
   */
  public enqueue(value: T): this {
    this._items.push(value);
    return this;
  }

  /**
   * Read the next item without removing it.
   */
  public peek(): T | undefined {
    return this._items[0];
  }

  /**
   * Remove and return the next item.
   */
  public dequeue(): T | undefined {
    return this._items.shift();
  }

  /**
   * Remove every item from the queue.
   */
  public clear(): void {
    this._items.length = 0;
  }

  /**
   * Remove and return every queued item in insertion order.
   */
  public drain(): T[] {
    const items = [...this._items];

    this.clear();
    return items;
  }

  /**
   * Iterate over the queued items without removing them.
   */
  public [Symbol.iterator](): Iterator<T> {
    return this._items[Symbol.iterator]();
  }
}
