import { useEffect, useRef, useState } from "react";
import { FluentProxy, getValue } from "./FluentProxy";

export function createComputeRunnerHook<T>(proxy: FluentProxy<T>) {
  return <U>(cb: () => U): (() => U) => {
    return useFluentCompute<T, U>(proxy, cb);
  };
}

const useFluentCompute = <T, U>(
  proxy: FluentProxy<T>,
  cb: () => U
): (() => U) => {
  const [, forceUpdate] = useState(0);

  const depsRef = useRef<Set<string>>(new Set());
  const prevStateRef = useRef<T | undefined>(undefined);
  const hasTrackedRef = useRef(false);
  const valueRef = useRef<U | undefined>(undefined);
  const callbackRef = useRef(cb);

  callbackRef.current = cb;

  useEffect(() => {
    if (!hasTrackedRef.current) {
      depsRef.current.clear();
      proxy.currentExecutionStack = depsRef.current;
      try {
        valueRef.current = callbackRef.current();
      } finally {
        proxy.currentExecutionStack = undefined;
        hasTrackedRef.current = true;
      }
      prevStateRef.current = proxy.getState();
    }
  }, []);

  useEffect(() => {
    const currentState = proxy.getState();
    const prevState = prevStateRef.current;
    if (!prevState) return;

    let hasChanged = false;
    for (const dep of depsRef.current) {
      const path = dep.split(".");
      const prevVal = getValue(path, prevState);
      const currVal = getValue(path, currentState);
      if (!Object.is(prevVal, currVal)) {
        hasChanged = true;
        break;
      }
    }
    if (hasChanged) {
      valueRef.current = callbackRef.current();
      prevStateRef.current = currentState;
      forceUpdate((cnt) => cnt + 1);
    }
  });

  return () => valueRef.current as U;
};
