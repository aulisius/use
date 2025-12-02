# @faizaanceg/use

A tiny library of useful React hooks.

## Installation

```bash
npm install @faizaanceg/use @faizaanceg/pandora react react-dom
```

## Hooks

### `useStore`

A lightweight state management hook based on the reducer pattern. It allows you to define a "reducer factory" (an object where keys are action types and values are reducer functions) and automatically generates type-safe dispatch helpers.

**Usage:**

```tsx
import { useStore } from "@faizaanceg/use/store";

// 1. Define your state type
type State = { count: number };

// 2. Create a reducer factory
// Keys become the action names on the returned 'mutations' object
const factory = {
  increment: (state: State, action: { payload: number }) => ({
    ...state,
    count: state.count + action.payload,
  }),
  decrement: (state: State, action: { payload: number }) => ({
    ...state,
    count: state.count - action.payload,
  }),
};

function Counter() {
  // 3. Initialize the store
  const [state, mutations] = useStore(factory, { count: 0 });

  return (
    <div>
      <p>Count: {state.count}</p>
      {/* 4. Call generated mutations directly */}
      <button onClick={() => mutations.increment(1)}>Increment</button>
      <button onClick={() => mutations.decrement(1)}>Decrement</button>
    </div>
  );
}
```

### `useLocalKV`

A hook to subscribe to a key in a `KeyValueStore` (from `@faizaanceg/pandora`). It updates the component whenever the key's value changes, even across tabs (if supported by the storage backend).

**Requirement:**
You must wrap your application (or part of it) in a `KVProvider` to provide the `KeyValueStore` instance.

**Usage:**

```tsx
import { KeyValueStore } from "@faizaanceg/pandora/kv";
import { KVProvider, useLocalKV } from "@faizaanceg/use/kv";

// 1. Initialize the KeyValueStore (e.g., using localStorage)
const store = new KeyValueStore(localStorage);

function App() {
  return (
    <KVProvider kv={store}>
      <ThemeComponent />
    </KVProvider>
  );
}

function ThemeComponent() {
  // 2. Subscribe to a key. The component re-renders on change.
  // You can provide a default value as the second argument.
  const theme = useLocalKV<string>("theme", "light");

  return <div>Current theme: {theme}</div>;
}
```

