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
