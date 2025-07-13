import { useEffect, useRef } from "react";
import { FluentProxy, getValue } from "./FluentProxy";

export function createEffectRunnerHook<T>(proxy: FluentProxy<T>) {
  return (cb: () => void) => {
    return useFluentEffect(proxy, cb);
  };
}

type EffectFunction = () => void;

const useFluentEffect = <T>(proxy: FluentProxy<T>, cb: EffectFunction) => {
  const depsRef = useRef<Set<string>>(new Set());
  const prevStateRef = useRef<T | undefined>(undefined);
  const hasTrackedRef = useRef(false);
  const callbackRef = useRef(cb);

  callbackRef.current = cb;

  useEffect(() => {
    if (!hasTrackedRef.current) {
      depsRef.current.clear();
      proxy.currentExecutionStack = depsRef.current;

      try {
        callbackRef.current(); // Just tracking
      } finally {
        proxy.currentExecutionStack = undefined;
        hasTrackedRef.current = true;
      }
      // Save Init state
      prevStateRef.current = proxy.getState();
    }
  }, []);

  useEffect(() => {
    const currentState = proxy.getState();
    const prevState = prevStateRef.current;
    if (!prevState) return;

    for (const dep of depsRef.current) {
      const path = dep.split(".");
      const prevVal = getValue(path, prevState);
      const currVal = getValue(path, currentState);

      if (!Object.is(prevVal, currVal)) {
        prevStateRef.current = currentState;
        callbackRef.current();
        return;
      }
    }
  });
};
