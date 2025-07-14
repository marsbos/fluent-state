export type Primitive = string | number | boolean | null | undefined | symbol;

export type Access<T> = {
  (): T;
  (value: T | ((prev: T) => T)): void;
};

export type FluentProxyType<T> = [T] extends [Primitive]
  ? Access<T>
  : T extends Array<infer U>
  ? FluentArrayProxyType<U>
  : FluentObjectProxyType<T>;

type FluentObjectProxyType<T> = {
  [K in keyof T]: FluentProxyType<T[K]>;
} & Access<T>;

type FluentArrayProxyType<T> = Array<FluentProxyType<T> & Access<T>> &
  Access<T[]>;

export type OnChange = {
  (): void;
};

export function getValue(path: (string | number)[], target: any) {
  return path.reduce((acc, key) => acc?.[key], target);
}

function setValue(path: (string | number)[], obj: any, value: any) {
  if (path.length === 0) return value;

  const [head, ...rest] = path;
  const currentTarget = obj?.[head];
  const updatedTarget: any = setValue(rest, currentTarget, value);

  if (Object.is(currentTarget, updatedTarget)) {
    return obj;
  }

  if (Array.isArray(obj)) {
    const copy = [...obj];
    copy[head as number] = updatedTarget;
    return copy;
  }

  return {
    ...obj,
    [head]: updatedTarget,
  };
}

export class FluentProxy<T> {
  private _state: T;
  private _proxy: FluentProxyType<T>;
  private _onChange: OnChange;
  private proxyCache = new Map<string, FluentProxyType<any>>();

  public currentExecutionStack?: Set<string>;

  constructor(initialState: T, onChange: OnChange) {
    this._state = initialState;
    this.currentExecutionStack = undefined;
    this.proxyCache = new Map();
    this._onChange = onChange;
    this._proxy = this.createProxy() as FluentProxyType<T>;
  }

  getState() {
    return this._state;
  }

  getProxy(): FluentProxyType<T> {
    return this._proxy;
  }

  createProxy<T>(path: string[] = []): FluentProxyType<T> {
    const key = path.join(".");

    if (this.proxyCache.has(key)) {
      return this.proxyCache.get(key) as FluentProxyType<T>;
    }

    const proxyFn = ((...args: [] | [T | ((prev: T) => T)]) => {
      if (args.length === 0) {
        if (this.currentExecutionStack !== undefined) {
          this.currentExecutionStack.add([...path].join("."));
        }
        return getValue(path, this._state) as T;
      } else {
        const [arg] = args;
        const currentValue = getValue(path, this._state) as T;
        const newValue =
          typeof arg === "function"
            ? (arg as (prev: T) => T)(currentValue)
            : arg;

        if (!Object.is(currentValue, newValue)) {
          this._state = setValue(path, this._state, newValue);
          this._onChange();
        }
      }
    }) as Access<T>;

    const proxy = new Proxy(proxyFn, {
      get: (_, prop) => {
        if (typeof prop === "symbol") {
          return Reflect.get(proxyFn, prop);
        }
        return this.createProxy([...path, String(prop)]);
      },
    }) as FluentProxyType<T>;

    this.proxyCache.set(key, proxy);
    return proxy;
  }
}
