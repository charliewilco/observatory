import { Observable } from "@charliewilco/observatory";

const n = new Observable<string>();

n.subscribe({
  onNext: (value) => console.log(value, "onNext", "subscription one"),
});
n.subscribe({
  onNext: (value) => console.log(value, "onNext", "subcription two"),
});

n.next("Hello");
n.next("...again");

const __n = new Observable<number>();

const value: number[] = [];

__n.subscribe({
  onNext(nextValue) {
    value.push(nextValue);
  },
});

__n.next(0);
__n.next(4);
__n.next(5);

console.log(...value);
