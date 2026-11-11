"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Poster } from "./Artwork";
import Link from "next/link";
import type { Title } from "@/lib/catalog/types";
import { titleHref } from "@/lib/catalog/query";
import { typeLabel } from "@/lib/i18n/mn";

const RECENT_KEY = "novaplay.recent-searches.v1";

function readRecent(): string[] {
  try {
    const v: unknown = JSON.parse(window.localStorage.getItem(RECENT_KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").slice(0, 6) : [];
  } catch {
    return [];
  }
}

type Suggestion = Pick<Title, "id" | "type" | "slug" | "titleMn" | "releaseYear" | "hue" | "posterUrl" | "backdropUrl">;

export function SearchBox({ initial, extraParams }: { initial: string; extraParams: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState(initial);
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => setRecent(readRecent()), []);
  useEffect(() => setValue(initial), [initial]);

  // Debounced autocomplete.
  useEffect(() => {
    const q = value.trim();
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    const ctrl = new AbortController();
    const id = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/catalog/titles?q=${encodeURIComponent(q)}&limit=6`, { signal: ctrl.signal });
        if (res.ok) setSuggestions((await res.json()).titles);
      } catch {
        /* aborted or offline: keep previous suggestions */
      }
    }, 180);
    return () => {
      ctrl.abort();
      window.clearTimeout(id);
    };
  }, [value]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => !boxRef.current?.contains(e.target as Node) && setFocused(false);
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const submit = (raw: string) => {
    const q = raw.trim().slice(0, 80);
    if (q) {
      const next = [q, ...readRecent().filter((r) => r !== q)].slice(0, 6);
      try {
        window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable */
      }
      setRecent(next);
    }
    const params = new URLSearchParams(extraParams);
    if (q) params.set("q", q);
    else params.delete("q");
    const qs = params.toString();
    setFocused(false);
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const clearRecent = () => {
    try {
      window.localStorage.removeItem(RECENT_KEY);
    } catch {
      /* storage unavailable */
    }
    setRecent([]);
  };

  const showRecent = focused && value.trim().length < 2 && recent.length > 0;
  const showSuggestions = focused && value.trim().length >= 2 && suggestions.length > 0;

  return (
    <div ref={boxRef} className="relative">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          submit(value);
        }}
        className="relative"
      >
        <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" strokeWidth={1.75} />
        <input
          type="search"
          name="q"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={(e) => e.key === "Escape" && setFocused(false)}
          maxLength={80}
          autoComplete="off"
          placeholder="Нэр, төрөл, он, жүжигчин, студиэр хайх"
          aria-label="Хайлт"
          className="h-14 w-full rounded-full border border-line bg-surface-2 pl-14 pr-28 text-base text-ink placeholder:text-muted/70 transition-colors focus:border-electric focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        {value && (
          <button type="button" onClick={() => { setValue(""); submit(""); }} aria-label="Хайлт арилгах" className="absolute right-[5.5rem] top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        )}
        <button type="submit" className="absolute right-2 top-1/2 h-10 -translate-y-1/2 rounded-full bg-violet px-5 text-sm font-medium text-white transition hover:bg-[#8b61ff]">
          Хайх
        </button>
      </form>

      {(showRecent || showSuggestions) && (
        <div className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl">
          {showRecent && (
            <>
              <div className="flex items-center justify-between px-5 pt-4">
                <p className="text-xs uppercase tracking-[0.14em] text-muted">Сүүлд хайсан</p>
                <button type="button" onClick={clearRecent} className="text-xs text-electric hover:underline">
                  Арилгах
                </button>
              </div>
              <ul className="p-2">
                {recent.map((r) => (
                  <li key={r}>
                    <button type="button" onClick={() => { setValue(r); submit(r); }} className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm text-ink hover:bg-white/5">
                      <Search className="h-4 w-4 text-muted" />
                      {r}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
          {showSuggestions && (
            <ul className="p-2">
              {suggestions.map((s) => (
                <li key={s.id}>
                  <Link href={titleHref(s)} className="flex items-center gap-3 rounded-xl p-2 hover:bg-white/5">
                    <span className="relative h-14 w-10 shrink-0 overflow-hidden rounded-md [&_p]:hidden">
                      <Poster title={s} sizes="40px" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-ink">{s.titleMn}</span>
                      <span className="block text-xs text-muted">{[typeLabel[s.type], s.releaseYear].filter(Boolean).join(" · ")}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
