"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Device local watchlist. Stored in localStorage until accounts arrive
 * (Phase C), when it moves to the `watchlists` table.
 */
const KEY = "novaplay.watchlist.v1";
const EVENT = "novaplay:watchlist";
const EMPTY: string[] = [];
let cache: { raw: string | null; value: string[] } = { raw: null, value: EMPTY };

function read(): string[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return EMPTY;
  }
  if (raw === cache.raw) return cache.value;
  let value = EMPTY;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) value = parsed.filter((x): x is string => typeof x === "string").slice(0, 500);
  } catch {
    value = EMPTY;
  }
  cache = { raw, value };
  return value;
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

/** Keys are "type/slug". Returns null during server render and hydration. */
export function useWatchlist() {
  const items = useSyncExternalStore<string[] | null>(subscribe, read, () => null);

  const toggle = useCallback((key: string) => {
    const current = read();
    const next = current.includes(key) ? current.filter((k) => k !== key) : [key, ...current];
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      return false;
    }
    window.dispatchEvent(new Event(EVENT));
    return true;
  }, []);

  return { items, toggle };
}
