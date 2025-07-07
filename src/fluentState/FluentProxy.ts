export type Primitive = string | number | boolean | null | undefined | symbol;

export type Access<T> = {
  (): T;
  (value: T, silent?: boolean): void;
  (updater: (v: T) => T, silent?: boolean): void;
  $subscribe: (callback: Subscriber<T>) => () => void;
};

export type FluentProxyType<T> = T extends Primitive
  ? Access<T>
  : T extends Array<infer U>
  ? FluentArrayProxyType<U>
  : FluentObjectProxyType<T>;

type FluentObjectProxyType<T> = {
  [K in keyof T]: FluentProxyType<T[K]>;
} & Access<T> & {
    $subscribe: (callback: Subscriber<T>) => () => void;
  };

type FluentArrayProxyType<T> = {
  [K in keyof Array<T>]: K extends `${number}`
    ? FluentProxyType<T>
    : Array<T>[K];
} & Access<T[]> & {
    $subscribe: (callback: Subscriber<T[]>) => () => void;
  };

export type OnChange = {
  (): void;
};

export type Subscriber<T> = (oldValue: T, newValue: T) => void;

enum ProxyExtensions {
  SUBSCRIBE = "$subscribe",
}

function getValue(path: (string | number)[], target: any) {
  return path.reduce((acc, key) => acc?.[key], target);
}

function setValue(path: (string | number)[], target: any, value: any) {
  if (path.length === 0) return value;

  const [head, ...rest] = path;
  let clone;

  if (Array.isArray(target)) {
    clone = [...target];
  } else {
    clone = { ...target };
  }
  clone[head] = setValue(rest, target[head], value);
  return clone;
}

export class FluentProxy<T> {
  private _state: T;
  private _proxy: FluentProxyType<T>;
  private _onChange: OnChange;
  private subscriberCache: Map<string, Set<Subscriber<T>>> = new Map();
  private proxyCache = new Map<string, FluentProxyType<any>>();

  constructor(initialState: T, onChange: OnChange) {
    this._state = initialState;
    this.proxyCache = new Map();
    this._onChange = onChange;
    this._proxy = this.createProxy() as FluentProxyType<T>;
  }

  getProxy(): FluentProxyType<T> {
    return this._proxy;
  }

  notifyParent(path: string[], oldState: T) {
    if (!path.length) {
      return;
    }
    const segments = path.slice(0, -1);
    const joinedPath = segments.join(".");
    const subscribers = this.subscriberCache.get(joinedPath);
    if (subscribers) {
      const currValue = getValue(segments, oldState);
      const newValue = getValue(segments, this._state);
      subscribers.forEach((subscriber) => subscriber(currValue, newValue));
    }
    this.notifyParent(segments, oldState);
  }

  createSubscriber(path: string[]) {
    const currentPath = path.join(".");
    return (callback: Subscriber<T>) => {
      if (!this.subscriberCache.has(currentPath)) {
        this.subscriberCache.set(currentPath, new Set());
      }
      this.subscriberCache.get(currentPath)!.add(callback);
      // Notify subscriber immediately:
      return this.createUnSubscriber(path, callback);
    };
  }

  createUnSubscriber(path: string[], subscriber: Subscriber<T>) {
    const currentPath = path.join(".");
    return () => {
      const set = this.subscriberCache?.get(currentPath);
      set?.delete(subscriber);
      if (set?.size === 0) {
        this.subscriberCache?.delete(currentPath);
      }
    };
  }

  createProxy(
    path: string[] = [],
    isSubscriber?: boolean
  ): FluentProxyType<any> {
    const key = path.join(".");

    if (this.proxyCache.has(key)) {
      return this.proxyCache.get(key) as FluentProxyType<any>;
    }

    const proxyFn = (...args: any[]) => {
      if (args.length === 0) {
        return getValue(path, this._state);
      } else {
        if (isSubscriber) {
          return;
        }
        const [arg] = args;
        const currentValue = getValue(path, this._state);
        const newValue =
          typeof arg === "function" ? arg(getValue(path, this._state)) : arg;

        if (!Object.is(currentValue, newValue)) {
          const currentState = this._state;
          this._state = setValue(path, this._state, newValue);
          const subscribers = this.subscriberCache.get(path.join("."));
          if (subscribers?.size) {
            subscribers.forEach((cb) => {
              cb(currentValue, newValue);
            });
          }
          // Notify parent subscribers
          this.notifyParent(path, currentState);
          this._onChange();
        }
      }
    };

    const proxy = new Proxy(proxyFn, {
      get: (_, prop) => {
        if (prop === ProxyExtensions.SUBSCRIBE) {
          return this.createSubscriber(path);
        }
        return this.createProxy(
          [...path, String(prop)],
          prop === ProxyExtensions.SUBSCRIBE
        );
      },
    }) as FluentProxyType<any>;

    this.proxyCache.set(key, proxy);
    return proxy;
  }
}
