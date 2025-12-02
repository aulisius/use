import {
  Reducer,
  useMemo,
  useReducer,
  ReducerWithoutAction,
  Dispatch,
} from "react";

export type Mutation<A> = { type?: string; payload: A };

export type ReducerFactory<S> = Record<
  string,
  Reducer<S, Mutation<any>> | ReducerWithoutAction<S>
>;

type MutationsFactory<Store, Factory> = {
  [K in keyof Factory]: (payload: ReadPayloadType<Store, Factory[K]>) => void;
};

type ReducerCreator = <Store>(
  factory: ReducerFactory<Store>
) => Reducer<Store, Mutation<any>>;

let createReducer: ReducerCreator = (factory) => (state, action) =>
  factory[action.type!]?.(state, action) ?? state;

type ReadPayloadType<S, T> = T extends (
  state: S,
  action: { payload: infer P }
) => S
  ? P
  : never;

function mapDispatch<Store, Factory extends ReducerFactory<Store>>(
  dispatch: React.Dispatch<{ type: keyof Factory; payload: any }>,
  factory: Factory
) {
  return Object.fromEntries(
    Object.keys(factory).map((type) => [
      type,
      (payload) => dispatch({ type, payload }),
    ])
  ) as MutationsFactory<Store, Factory>;
}
/**
 * React hook for creating and managing a local React store based on a reducer factory.
 *
 * `useStore` initializes the store with the provided `initialState` and returns a tuple containing:
 * 1. The current state of the store.
 * 2. A dispatching object (mutations) that allows triggering actions to update the store.
 *
 * The reducer factory `factory` defines how state transitions are handled for different action types.
 * The returned state is derived from the reducer functions in the factory, and the mutations object
 * provides methods to dispatch actions that will trigger the corresponding reducer functions.
 *
 * @example
 * const factory = {
 *   increment: (state, action) => ({ ...state, count: state.count + action.payload }),
 *   decrement: (state, action) => ({ ...state, count: state.count - action.payload }),
 * };
 * const [state, mutations] = useStore(factory, { count: 0 });
 * // Now, mutations.increment(1) updates state.count by +1
 */
export function useStore<
  Factory extends ReducerFactory<Store>,
  Store = Factory extends Record<string, infer S> ? S : never
>(factory: Factory, initialState: Store) {
  const [state, dispatch] = useReducer(
    useMemo(() => createReducer<Store>(factory), [factory]),
    initialState
  );
  return [
    state,
    useMemo(
      () =>
        mapDispatch<Store, Factory>(
          dispatch as Dispatch<{ type: keyof Factory; payload: any }>,
          factory
        ),
      [factory]
    ),
  ] as const;
}
