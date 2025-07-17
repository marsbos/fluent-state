# fluent-state

> Fluent, immutable React local state that just makes sense.

<p>
  <img src="https://img.shields.io/npm/v/fluent-state.svg" alt="npm version" />
  <img src="https://img.shields.io/npm/dw/fluent-state.svg" alt="npm downloads" />
  <img src="https://img.shields.io/npm/l/fluent-state.svg" alt="license" />
</p>

A tiny (~2.4kb), proxy-based React hook for **deeply nested**, reactive state, **computed** reactive state and **built-in effects** — zero boilerplate, no reducers, no magic.

---

## 🚀 Installation

```bash
npm install fluent-state
```

Or with yarn:

```bash
yarn add fluent-state
```

---

## ⚡ Quick Start

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

⚡ [Live demo on CodeSandbox (state & effect) »](https://codesandbox.io/s/charming-robinson-wzp5j6-wzp5j6)

⚡ [Live demo on StackBlitz (state, compute & effect) »](https://stackblitz.com/edit/vitejs-vite-uh4kyzkf?file=src%2FApp.tsx)

---

## 💡 Why fluent-state?

I built fluent-state because I wanted a React state hook that:

- Replaces `useState`, `useReducer`, and `useEffect` with a single, fluent, and reactive API
- Feels like plain JavaScript with getter/setter functions
- Updates immutably and efficiently under the hood
- Tracks dependencies automatically, no manual arrays
- Handles deep nested objects and arrays naturally
- Avoids magic, globals, or complex APIs

---

## ✨ Key Features

- Fluent getter/setter API (`state.user.name("Alice")`)
- Immutable updates, fully React compatible
- Auto-tracked effects with zero boilerplate
- Works flawlessly with nested objects and arrays
- **Reactive computed state with `compute` for derived values**
- Tiny bundle size (~2kb)
- Full TypeScript support with accurate typings

---

## ⚙️ How fluent-state uses Proxies (but don’t worry!)

fluent-state uses JavaScript **Proxies** — but **not** to wrap your entire state object directly.

Instead, it wraps tiny **getter/setter functions** that correspond to specific **paths** inside your state. These proxies:

- Wrap just the accessors for each path, **completely separate from the actual state object**
- Are **lightweight and cached** for excellent React performance
- Have **no magic** — just normal JavaScript behavior

This means:

- You call fluent getter/setter functions like `state.user.name("Alice")`
- Immutable updates happen internally without mutating the original state
- Effects track which getter functions you use — no manual dependency arrays needed

In short: fluent-state’s proxies wrap **functions representing paths**, not the state object itself — keeping everything simple, predictable, and reactive.

---

## ⚙️ Computed State with `compute`

Besides `effect` for side-effects, `fluent-state` also provides the `compute` function to create **derived, reactive state** that automatically updates whenever its underlying dependencies change.

```tsx
import { useFluentState } from "fluent-state";

type Contact = {
  id: number;
  name: string;
  email: string;
};

type AppState = {
  form: {
    name: string;
    email: string;
  };
  contacts: Contact[];
};

export default function () {
  const [state, effect, compute] = useFluentState<AppState>({
    form: { name: "", email: "" },
    contacts: [
      { id: 1, name: "Alice", email: "alice@example.com" },
      { id: 2, name: "Bob", email: "bob@example.com" },
    ],
  });

  effect(() => {
    const contacts = state.contacts();
    console.log("Contacts changed:", contacts);
  });

  const isFormValid = compute(() => {
    const name: string = state.form.name();
    const email: string = state.form.email();
    return email.includes("@") && Boolean(name);
  });

  const handleAddContact = () => {
    if (isFormValid()) {
      const contacts = state.contacts;
      const newId = contacts().length + 1;
      contacts((prev) => [...prev, { id: newId, ...state.form() }]);
      state.form({ email: "", name: "" });
    }
  };

  return (
    <div>
      <h1>useFluentState - compute example</h1>

      <input
        value={state.form.name()}
        onChange={(e) => state.form.name(e.target.value)}
        placeholder="Enter name"
      />
      <input
        value={state.form.email()}
        onChange={(e) => state.form.email(e.target.value)}
        placeholder="Enter email"
      />
      <button disabled={!isFormValid()} onClick={handleAddContact}>
        Add contact
      </button>

      <ul>
        {state.contacts().map((contact) => (
          <li key={contact.id}>{contact.email}</li>
        ))}
      </ul>
    </div>
  );
}
```

- `compute` automatically tracks which proxy getters you call
- The computation re-runs whenever any of those dependencies change
- It’s the ideal replacement for `useMemo` + `useEffect` combinations
- `compute` returns a function you call to read the current computed value

---

## 🔍 Complex Example: Todo List with Nested State and Effects

```tsx
type Todo = {
  id: number;
  title: string;
  done: boolean;
};

function TodoApp() {
  const [state, effect] = useFluentState({
    todos: [
      { id: 1, title: "Learn fluent-state", done: false },
      { id: 2, title: "Build awesome apps", done: false },
    ],
    filter: "all" as "all" | "done" | "active",
  });

  // Effect: Log when filtered todos change
  effect(() => {
    const visibleTodos = state.todos().filter((todo) => {
      if (state.filter() === "done") return todo.done;
      if (state.filter() === "active") return !todo.done;
      return true;
    });
    console.log("Visible todos:", visibleTodos);
  });

  // Toggle todo done state
  function toggleDone(id: number) {
    state.todos((todos) =>
      todos.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo
      )
    );
  }

  // Change filter
  function setFilter(value: "all" | "done" | "active") {
    state.filter(value);
  }

  return (
    <>
      <h2>Todos</h2>
      <div>
        <button onClick={() => setFilter("all")}>All</button>
        <button onClick={() => setFilter("active")}>Active</button>
        <button onClick={() => setFilter("done")}>Done</button>
      </div>
      <ul>
        {state.todos().map((todo) => (
          <li key={todo.id}>
            <label>
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => toggleDone(todo.id)}
              />
              {todo.title}
            </label>
          </li>
        ))}
      </ul>
    </>
  );
}
```

This example shows how `useFluentState` manages deeply nested arrays and objects with a fluent, immutable API, while effects automatically track dependencies and run only when needed.

---

## ❓ FAQ

**Q: Why do I need to call state fields as functions like `state.user.name()`?**  
A: This getter function pattern allows automatic dependency tracking and controlled immutable updates, keeping your React components efficient.

**Q: Can I update nested state immutably without writing verbose code?**  
A: Yes! `useFluentState` handles immutable updates under the hood, so you can write concise updates like `state.user.address.city("New City")`.

**Q: How do effects know when to re-run?**  
A: Effects track which state getters you call during execution. They only re-run when those specific values change.

**Q: Does this work with arrays?**  
A: Absolutely. You can update arrays immutably and track changes as shown in the todo example.

---

## 🛣 Roadmap

- ✅ Fully working effect system with automatic dependency tracking
- ✅ Support for deeply nested objects and arrays
- ✅ Reactive computed state with `compute`
- ⏳ Persist plugin for saving state to localStorage or similar
- ⏳ Devtools integration for easier debugging
- ⏳ Optional global/shared state support
- ⏳ Performance optimizations and bug fixes

---

## ⚠️ Stability & Testing

fluent-state is a stable and reliable library with a solid foundation.  
While it currently lacks automated tests, it has been carefully designed and tested manually.

Adding automated test coverage is on the roadmap to ensure ongoing quality and reliability.

Contributions to help expand test coverage and improve robustness are very welcome!

---

## 🤝 Contributing

Contributions, feedback, and ideas are welcome! Feel free to open issues or PRs.

---

## 🪪 License

MIT © Marcel Bos

---

Built with care by [Marcel Bos](https://github.com/marsbos)
