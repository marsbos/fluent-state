# 🔁 useFluentState

**Fluent, reactive & immutable local state management for React.**

_And very small, only 2KB_

## ✨ Features

- 🔁 **Fluent syntax** — Update deeply nested state like `state.user.addresses[0]({ city: "New City" })`
- 🔒 **Immutable updates** — Safe for React; always triggers re-renders
- 📡 **Subscriptions** — Subscribe to any part of your state tree via `$subscribe`
- 🧼 **Minimal boilerplate** — No reducers, no context, no actions

## 📦 Installation

```bash
npm install fluent-state
```

## 🚀 Quick Start

```tsx
import { useFluentState } from "fluent-state";

type Address = { city: string };
type User = { name: string; addresses: Address[] };

const initialState = {
  user: {
    name: "Alice",
    addresses: [{ city: "Old City" }],
  },
};

function App() {
  const state = useFluentState<typeof initialState>(initialState);

  const changeCity = () => {
    state.user.addresses[0]({ city: "New City" });
  };

  useEffect(() => {
    const unsubscribe = state.user.addresses.$subscribe((oldVal, newVal) => {
      console.log("Addresses changed", oldVal, newVal);
    });
    return unsubscribe;
  }, []);

  return (
    <>
      <p>Current city: {state.user.addresses[0]().city}</p>
      <button onClick={changeCity}>Change city</button>
    </>
  );
}
```

## 🧠 API

### `useFluentState<T>(initialState: T): FluentProxy<T>`

Returns a proxy object that gives you:

- `path()` — get the value
- `path(newValue)` — set a new value
- `path(updateFn)` — update based on current value
- `path.$subscribe((oldVal, newVal) => {})` — subscribe to changes

### Example

```ts
state.user.name(); // "Alice"
state.user.name("Bob"); // update name
state.user.name((name) => name.toUpperCase());

const unsub = state.user.$subscribe((prev, next) => {
  console.log("User changed");
});
unsub(); // stop listening
```

## ✅ TypeScript Support

- Autocomplete on every level
- Type-safe path setters & subscribers
