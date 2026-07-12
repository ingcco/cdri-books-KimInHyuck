import type { LocalStorageKey } from "@/constants/localStorageKey";

export const getLocalStorage = <T>(key: LocalStorageKey, fallback: T): T => {
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export const setLocalStorage = <T>(key: LocalStorageKey, value: T): void => {
  window.localStorage.setItem(key, JSON.stringify(value));
};
