import { Observable } from "./observable";

export class ObservableBridge<T> {
  static create<T>(value: T) {
    return new ObservableBridge(value);
  }

  #closed?: boolean;

  #destination: Observable<T>;
  #value: T;

  constructor(initialValue: T) {
    this.#value = initialValue;

    this.#destination = new Observable();
  }

  getValue(): T {
    return this.#value;
  }
}
