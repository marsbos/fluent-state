import { useCallback, useMemo, useRef, useState } from "react";
import { FluentProxy, FluentProxyType } from "./FluentProxy";
import { createEffectRunnerHook } from "./useFluentEffect";
import { createComputeRunnerHook } from "./useFluentCompute";

type UseFluentStateReturn<T> = [
  FluentProxyType<T>, // proxied lighweight get/set functions
  (cb: () => void) => void, // effect
  <U>(cb: () => U) => () => U // compute
];

export function useFluentState<T>(initialState: T): UseFluentStateReturn<T> {
  if (typeof initialState !== "object" || initialState === null) {
    throw new Error(
      "useFluentState requires an initial state of type object or array"
    );
  }
  const [, forceUpdate] = useState<number>(0);

  const onChange = useCallback(() => {
    forceUpdate((prev) => prev + 1);
  }, []);

  const fluentProxy = useMemo(() => {
    return new FluentProxy<T>(initialState, onChange);
  }, []);

  const stateRef = fluentProxy.getProxy();

  const effectFactory = useRef(createEffectRunnerHook<T>(fluentProxy));
  const computeFactory = useRef(createComputeRunnerHook<T>(fluentProxy));

  return [stateRef, effectFactory.current, computeFactory.current];
}
