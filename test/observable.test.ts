import { describe, it, expect, jest } from "@jest/globals";
import { Observable } from "../src";

describe("Observable", () => {
  it("creates subscription", () => {
    const n = new Observable();

    const subscription = n.subscribe({
      onNext: (value) => console.log(value),
      onError: (err) => console.error(err),
      onDone: () => {
        console.log("Done");
      },
    });

    expect(n.subscribe).toBeDefined();
    expect(subscription.unsubscribe).toBeDefined();
    expect(n.subscriptions).toEqual(1);
  });

  it("calls next", () => {
    const n = new Observable<string>();
    const onNext1 = jest.fn();
    const onNext2 = jest.fn();

    n.subscribe({ onNext: onNext1 });
    n.subscribe({ onNext: onNext2 });

    n.next("Hello");

    expect(onNext1).toHaveBeenCalledTimes(1);
    expect(onNext1).toHaveBeenCalledWith("Hello");
    expect(onNext2).toHaveBeenCalledTimes(1);
    expect(onNext2).toHaveBeenCalledWith("Hello");

    n.next("Again");

    expect(onNext1).toHaveBeenCalledTimes(2);
    expect(onNext1).toHaveBeenCalledWith("Again");
    expect(onNext2).toHaveBeenCalledTimes(2);
    expect(onNext2).toHaveBeenCalledWith("Again");
  });

  it("clears subscriptions", () => {
    const n = new Observable<string>();
    const s = n.subscribe({
      onNext: jest.fn(),
    });

    expect(n.subscriptions).toEqual(1);

    s.unsubscribe();

    expect(n.subscriptions).toEqual(0);
  });
});
