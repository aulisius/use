import { KeyValueStore } from "@faizaanceg/pandora/kv";
import * as React from "react";

const KVContext = React.createContext<KeyValueStore | null>(null);

/**
 * A React Context Provider for the KeyValueStore.
 *
 * This provider must wrap any component tree that utilizes the `useLocalKV` hook.
 * It passes the `KeyValueStore` instance down to consumers.
 *
 * @param props - The component props.
 * @param props.kv - The instance of `KeyValueStore` to be made available to the application.
 * @param props.children - The child components that will have access to the store.
 *
 * @example
 * ```tsx
 * import { KeyValueStore } from "@faizaanceg/pandora/kv";
 * import { KVProvider } from "./kv";
 *
 * const store = new KeyValueStore();
 *
 * function App() {
 *   return (
 *     <KVProvider kv={store}>
 *       <RootComponent />
 *     </KVProvider>
 *   );
 * }
 * ```
 */
export function KVProvider({
  children,
  kv,
}: React.PropsWithChildren<{ kv: KeyValueStore }>) {
  return React.createElement(KVContext.Provider, { value: kv }, children);
}

/**
 * React hook to subscribe to a specific key in the KeyValueStore.
 *
 * `useLocalKV` retrieves the current value associated with the provided `key` from the
 * `KeyValueStore` provided via `KVProvider`. It automatically subscribes to changes, ensuring
 * the component re-renders whenever the value changes:
 * - Locally within the same application instance.
 * - Across tabs/windows via the `storage` event (if the underlying store supports it).
 *
 * @template T - The expected type of the value stored.
 * @param key - The unique key identifier to retrieve from the store.
 * @param defaultValue - An optional default value to return if the key does not exist or holds no value.
 * @returns The current value associated with the key, or the `defaultValue` (or `null` if neither is present).
 *
 * @throws {Error} If the hook is used outside of a `KVProvider`.
 *
 * @example
 * ```tsx
 * // Basic usage
 * const theme = useLocalKV('theme');
 * ```
 *
 * @example
 * ```tsx
 * // Usage with a default value and type
 * const count = useLocalKV<number>('count', 0);
 * ```
 */
export function useLocalKV<T = unknown>(
  key: string,
  defaultValue?: T
): T | null {
  const kv = React.useContext(KVContext);
  if (!kv) {
    throw new Error("useLocalKV must be used within a KVProvider");
  }
  const [value, setValue] = React.useState(() => kv.get(key, defaultValue));
  React.useEffect(() => {
    function handleStorageChange(event: StorageEvent) {
      if (event.key === key) {
        setValue(kv!.get(key));
      }
    }
    window.addEventListener("storage", handleStorageChange);
    const cleanup = kv.subscribe(key, () => setValue(kv.get(key)));
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      cleanup();
    };
  }, [key]);
  return value;
}
