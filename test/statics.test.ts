import { describe, it, expect, jest } from "@jest/globals";
import { Observable } from "../src";

describe("Static Methods", () => {
  it("isObservable()", () => {
    expect(Observable.isObservable("foo")).toBeFalsy();
    expect(Observable.isObservable(["foo", "bar", "baz"])).toBeFalsy();
    const o = new Observable();

    expect(Observable.isObservable(o)).toBeTruthy();
  });
});
