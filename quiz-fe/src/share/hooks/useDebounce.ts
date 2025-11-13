import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Returns a debounced version of the given value. The returned value will only
 * update after the specified delay has elapsed without the source value changing.
 *
 * @example
 * const debouncedSearch = useDebounce(searchText, 300);
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = (globalThis as any).setTimeout(() => setDebouncedValue(value), delay);
    return () => {
      (globalThis as any).clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Returns a debounced callback and a cancel function.
 * The callback will be invoked only after `delay` ms have passed since the
 * last call.
 *
 * @example
 * const { callback: debouncedOnChange, cancel } = useDebouncedCallback((v) => { ... }, 300);
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  fn: T,
  delay = 300
) {
  const timer = useRef<number | undefined>(undefined);
  const fnRef = useRef<T>(fn);

  // keep latest fn
  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  const cancel = useCallback(() => {
    if (timer.current !== undefined) {
      (globalThis as any).clearTimeout(timer.current);
      timer.current = undefined;
    }
  }, []);

  const callback = useCallback(
    (...args: Parameters<T>) => {
      cancel();
      timer.current = (globalThis as any).setTimeout(() => {
        // call current function reference
        fnRef.current(...(args as any));
        timer.current = undefined;
      }, delay) as unknown as number;
    },
    [delay, cancel]
  );

  // cleanup on unmount
  useEffect(() => cancel, [cancel]);

  return { callback, cancel } as const;
}

export default useDebounce;
