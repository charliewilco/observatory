<h1 align="center">Observatory</h1>

An observable library

## Install

```sh
yarn add @charliewilco/observatory
```

## Usage

```ts
import { Observable } from "@charliewilco/observatory";

const n = new Observable<string>();

n.subscribe({ onNext: (nextValue) => console.log(nextValue) });

n.next("Hello");

// Console: "hello"
```
