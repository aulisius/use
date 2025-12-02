import { KeyValueStore } from "@faizaanceg/pandora/kv";
import { KVProvider, useLocalKV } from "@faizaanceg/use/kv";
import type { Mutation } from "@faizaanceg/use/store";
import { useStore } from "@faizaanceg/use/store";
import { Window } from "happy-dom";
import assert from "node:assert";
import { describe, it } from "node:test";
import * as React from "react";
import * as ReactDOM from "react-dom/client";

describe("useStore", () => {
  type State = { count: number };

  const reducer = {
    increment: (state: State, action: Mutation<number>) => {
      return {
        ...state,
        count: state.count + action.payload,
      };
    },
    decrement: (state: State, action: Mutation<number>) => {
      return {
        ...state,
        count: state.count - action.payload,
      };
    },
  };

  function TestComponent() {
    const [state, actions] = useStore(reducer, {
      count: 0,
    } as State);
    return React.createElement(
      "div",
      null,
      React.createElement("span", { id: "count" }, state.count),
      React.createElement(
        "button",
        { id: "increment", onClick: () => actions.increment(1) },
        "Increment"
      ),
      React.createElement(
        "button",
        { id: "decrement", onClick: () => actions.decrement(1) },
        "Decrement"
      )
    );
  }
  it("should return the correct state", async (t) => {
    t.beforeEach(() => {
      const window = new Window();
      // @ts-expect-error
      globalThis.window = window;
      const document = window.document;
      // @ts-expect-error
      globalThis.document = document;
      const container = document.createElement("div");
      container.id = "root";
      document.body.appendChild(container);
    });
    await t.test("should update state via actions", async () => {
      const container = document.querySelector("#root");
      React.act(() => {
        ReactDOM.createRoot(container as HTMLElement).render(
          React.createElement(TestComponent, {}, null)
        );
      });
      const count = container?.querySelector<HTMLSpanElement>("#count");
      assert.strictEqual(count?.textContent, "0");
      const incrementButton =
        container?.querySelector<HTMLButtonElement>("#increment");
      const decrementButton =
        container?.querySelector<HTMLButtonElement>("#decrement");
      React.act(() => {
        incrementButton?.click();
      });
      assert.strictEqual(count?.textContent, "1");
      React.act(() => {
        decrementButton?.click();
      });
      assert.strictEqual(count?.textContent, "0");
    });
  });
});

describe("useLocalKV", () => {
  function TestComponent() {
    const value = useLocalKV<string>("test", "hello");
    return React.createElement(
      "div",
      null,
      React.createElement("span", { id: "value" }, value)
    );
  }
  let KV;
  it("should return the correct value", async (t) => {
    t.beforeEach(async () => {
      const window = new Window();
      // @ts-expect-error
      globalThis.window = window;
      const document = window.document;
      // @ts-expect-error
      globalThis.document = document;
      const container = document.createElement("div");
      container.id = "root";
      globalThis.localStorage = window.localStorage;
      KV = new KeyValueStore(window.localStorage);
      document.body.appendChild(container);
    });
    await t.test("should update value via actions", async () => {
      const container = document.querySelector("#root");
      React.act(() => {
        ReactDOM.createRoot(container as HTMLElement).render(
          React.createElement(
            KVProvider,
            { kv: KV },
            React.createElement(TestComponent, {}, null)
          )
        );
      });
      const value = container?.querySelector<HTMLSpanElement>("#value");
      assert.strictEqual(value?.textContent, "hello");
      React.act(() => {
        KV.set("test", "world");
      });
      assert.strictEqual(value?.textContent, "world");
    });
    await t.test("useLocalKV should be under a Context", async () => {
      const container = document.querySelector("#root");

      assert.throws(() => {
        React.act(() => {
          ReactDOM.createRoot(container as HTMLElement).render(
            React.createElement(TestComponent, {}, null)
          );
        });
      });
    });
  });
});
