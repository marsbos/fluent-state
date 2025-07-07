import { useCallback, useRef, useState } from "react";
import { FluentProxy, FluentProxyType } from "./FluentProxy";

export function useFluentState<T extends object>(
  initialState: T
): FluentProxyType<T> {
  if (typeof initialState !== "object" || initialState === null) {
    throw new Error(
      "useFluentState requires an initial state of type object or array"
    );
  }
  const [_, setTrigger] = useState<number>(0);

  const onChange = useCallback(() => {
    setTrigger((prev) => prev + 1);
  }, []);

  const stateRef = useRef<FluentProxyType<T>>(
    new FluentProxy<T>(initialState, onChange).getProxy()
  );

  return stateRef.current as FluentProxyType<T>;
}
