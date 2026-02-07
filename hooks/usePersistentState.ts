import { useEffect, useState } from 'react';

interface PersistentStateOptions<T> {
  deserialize?: (raw: string) => T;
  serialize?: (value: T) => string;
  validate?: (value: T) => boolean;
}

export const usePersistentState = <T>(
  key: string,
  initialValue: T,
  options?: PersistentStateOptions<T>,
) => {
  const deserialize = options?.deserialize ?? ((raw: string) => JSON.parse(raw) as T);
  const serialize = options?.serialize ?? ((value: T) => JSON.stringify(value));
  const validate = options?.validate ?? (() => true);

  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;

    try {
      const storedValue = window.localStorage.getItem(key);
      if (!storedValue) return initialValue;
      const parsedValue = deserialize(storedValue);
      return validate(parsedValue) ? parsedValue : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.setItem(key, serialize(state));
    } catch {
      // Ignore local storage failures (private mode, quota exceeded, etc.)
    }
  }, [key, serialize, state]);

  return [state, setState] as const;
};
