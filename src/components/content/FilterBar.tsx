"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import clsx from "clsx";
import type { CatalogQuery, ContentType } from "@/lib/catalog/types";
import { sortLabel, statusLabel, typeLabel } from "@/lib/i18n/mn";

interface Props {
  query: CatalogQuery;
  genres: { slug: string; nameMn: string }[];
  years: number[];
  showStatus?: boolean;
  showType?: boolean;
  showRating?: boolean;
}

/** Filters live in the URL so every filtered view is linkable and server rendered. */
export function FilterBar({ query, genres, years, showStatus, showType, showRating }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  const set = (key: keyof CatalogQuery, value: string) => {
    const next: Record<string, string> = {};
    for (const [k, v] of Object.entries({ ...query, [key]: value || undefined })) {
      if (v !== undefined && v !== "" && !(k === "sort" && v === "newest")) next[k] = String(v);
    }
    const qs = new URLSearchParams(next).toString();
    startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  };

  const active = Boolean(query.genre || query.year || query.status || query.type || (query.sort && query.sort !== "newest"));
  const sorts = (["newest", "year", "title", "rating"] as const).filter((s) => s !== "rating" || showRating);

  return (
    <div className={clsx("flex flex-wrap items-center gap-2.5 transition-opacity", pending && "opacity-60")}>
      {showType && (
        <select aria-label="Ангилал" className="field" value={query.type ?? ""} onChange={(e) => set("type", e.target.value)}>
          <option value="">Бүх ангилал</option>
          {(Object.keys(typeLabel) as ContentType[]).map((t) => (
            <option key={t} value={t}>
              {typeLabel[t]}
            </option>
          ))}
        </select>
      )}
      <select aria-label="Төрөл" className="field max-w-[60vw]" value={query.genre ?? ""} onChange={(e) => set("genre", e.target.value)}>
        <option value="">Бүх төрөл</option>
        {genres.map((g) => (
          <option key={g.slug} value={g.slug}>
            {g.nameMn}
          </option>
        ))}
      </select>
      <select aria-label="Гарсан он" className="field" value={query.year ?? ""} onChange={(e) => set("year", e.target.value)}>
        <option value="">Бүх он</option>
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
      {showStatus && (
        <select aria-label="Төлөв" className="field" value={query.status ?? ""} onChange={(e) => set("status", e.target.value)}>
          <option value="">Бүх төлөв</option>
          {(["ongoing", "completed", "upcoming"] as const).map((s) => (
            <option key={s} value={s}>
              {statusLabel[s]}
            </option>
          ))}
        </select>
      )}
      <select aria-label="Эрэмбэлэх" className="field" value={query.sort ?? "newest"} onChange={(e) => set("sort", e.target.value)}>
        {sorts.map((s) => (
          <option key={s} value={s}>
            {sortLabel[s]}
          </option>
        ))}
      </select>
      {active && (
        <button
          type="button"
          onClick={() => startTransition(() => router.push(query.q ? `${pathname}?q=${encodeURIComponent(query.q)}` : pathname, { scroll: false }))}
          className="h-11 rounded-full px-4 text-sm text-electric transition hover:bg-white/5"
        >
          Шүүлтүүр арилгах
        </button>
      )}
    </div>
  );
}
