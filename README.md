# fluent-state

> **Fluent. Immutable. React state that just makes sense.**  
> Nested, reactive state with zero boilerplate and automatic effect tracking — no signals, no reducers, no headaches.

---

## 🧠 Why I built fluent-state

I was building a React app with deeply nested state. I wanted control and structure — but I didn’t want reducers, actions, or global stores. Just... a nice way to manage state.

I tried:

- **Redux** — too verbose, too much setup.
- **Zustand** — nice, but not great with deeply nested data.
- **MobX** — felt magical, unpredictable in team settings.
- **Signals** — powerful, but unfamiliar and frameworky.

I wanted something that:

- Feels like **plain JavaScript** (getters/setters).
- Updates **immutably** under the hood.
- Tracks **dependencies automatically** — no more `useEffect([a, b, c])` nonsense.
- Doesn’t rerun effects on every render unless something _actually_ changed.

So I built it — with a little help from AI for some of the trickier TypeScript parts and complex logic. But the core concept, the API design, and the majority of the code are all mine.

## ✨ Key features

- ✅ **Fluent API** — access and update state with a simple `.()` function
- 🔁 **Immutable updates** — always safe, always React-friendly
- 🎯 **Auto-tracked effects** — no more manual dependency arrays
- 🧩 **Fully nested** — works flawlessly with deep object trees and arrays
- 🛡 **No magic** — no decorators, no proxies that break debugging, no class-based weirdness
- 🧠 **Intuitive mental model** — you always know what’s going on

---

## 🚀 Quick example

```tsx
import { useFluentState } from "fluent-state";

function Counter() {
  const [state, effect] = useFluentState({ count: 0 });

  effect(() => {
    console.log("Count changed:", state.count());
  });

  return (
    <>
      <p>Count: {state.count()}</p>
      <button onClick={() => state.count((c) => c + 1)}>Increment</button>
    </>
  );
}
```

> ✅ Effects don’t rerun on re-render.  
> ✅ Only when `.count()` value changes.  
> ✅ No dependency array needed.

---

## 🧪 Nested state? Bring it on

```tsx
const [state, effect] = useFluentState({
  user: {
    name: "Alice",
    address: { city: "Amsterdam" },
    hobbies: ["reading", "cycling"],
  },
});

effect(() => {
  console.log("City is:", state.user.address.city());
});

state.user.address.city("Rotterdam");
state.user.hobbies((h) => [...h, "coding"]);
```

Fluent access, fluent updates — even in arrays and deeply nested structures.

---

## 🔁 Working with arrays

```tsx
const [state] = useFluentState({ items: ["apple", "banana"] });

state.items((items) => [...items, "ananas"]);
```

---

## 🥊 Compared to other tools

| Feature / Tool          | fluent-state    | Redux        | Zustand | MobX         | Signals (React) |
| ----------------------- | --------------- | ------------ | ------- | ------------ | --------------- |
| ✅ Fluent API           | Yes             | No           | Partial | Yes          | Yes             |
| ✅ Immutable updates    | Yes (automatic) | Yes (manual) | Yes     | No (mutable) | Yes             |
| ✅ Auto effect tracking | Yes             | No           | No      | Yes          | Yes             |
| ✅ Handles deep state   | Yes             | Complex      | Limited | Yes          | Yes             |
| ✅ Predictable          | Yes             | Yes          | Yes     | Sometimes    | Mostly          |
| ✅ React integration    | Full            | Full         | Full    | Full         | Beta            |
| ✅ Lightweight          | ~2kb core       | Heavy        | Medium  | Medium-heavy | Medium          |

---

## 🧘 Philosophy

**No magic. No globals. No fragile reactivity.**

Fluent-state is local by default. You use it like `useState`, but get the power of a reactive store — with full React compatibility and no extra concepts to learn.

This was born out of frustration, tested in the real world, and built with care. It’s not the flashiest, but it’s **clean, stable, and powerful.**

---

## 🛠 Installation

```bash
npm install fluent-state
```

---

## 🧩 API Summary

```ts
const [state, effect] = useFluentState(initialState);

// Get value
state.count(); // 0

// Set value
state.count(1);

// Update with function
state.count((prev) => prev + 1);

// Nested
state.user.address.city("Amsterdam");

// Arrays
state.items((arr) => [...arr, "new item"]);

// Auto-tracked effect
effect(() => {
  console.log(state.count());
});
```

---

## 🧪 No unnecessary re-renders

Your component re-renders only when needed.  
Your effects re-run only when the _actual values you use_ change.

---

## 📦 Roadmap

- ✅ Fully working effect system
- ✅ Nested array/object support
- ⏳ Persist plugin
- ⏳ Devtools
- ⏳ Global/shared state opt-in

---

## 🤝 Contributions welcome

This is early but stable — and already powerful.

If you have ideas, improvements, or want to help shape its future: jump in!

---

## 🪪 License

MIT © Marcel Bos

---

## 🙋‍♂️ Author

Built by [Marcel Bos](https://github.com/marsbos)

Follow for updates, thoughts & ideas.

---
