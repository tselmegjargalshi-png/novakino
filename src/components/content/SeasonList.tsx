"use client";

import clsx from "clsx";
import { useState } from "react";
import type { Season } from "@/lib/catalog/types";
import { formatDate, formatRuntime } from "@/lib/i18n/mn";

export function SeasonList({ seasons }: { seasons: Season[] }) {
  const [active, setActive] = useState(seasons[0]?.number ?? 1);
  const season = seasons.find((s) => s.number === active) ?? seasons[0];
  if (!season) return null;

  return (
    <div>
      {seasons.length > 1 && (
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="tablist" aria-label="Улирал сонгох">
          {seasons.map((s) => (
            <button
              key={s.number}
              type="button"
              role="tab"
              aria-selected={s.number === active}
              onClick={() => setActive(s.number)}
              className={clsx(
                "h-10 shrink-0 rounded-full border px-5 text-sm transition",
                s.number === active ? "border-electric bg-violet/20 text-ink" : "border-line text-muted hover:text-ink",
              )}
            >
              {s.titleMn ?? `${s.number}-р улирал`}
            </button>
          ))}
        </div>
      )}
      {season.episodes.length === 0 ? (
        <p className="mt-5 text-sm text-muted">Энэ улирлын ангиуд хараахан нэмэгдээгүй байна.</p>
      ) : (
        <ol className="mt-5 divide-y divide-white/5 rounded-card border border-line bg-surface">
          {season.episodes.map((e) => (
            <li key={e.number} className="flex items-start gap-4 px-4 py-4 sm:px-5">
              <span className="w-8 shrink-0 pt-0.5 font-display text-base text-electric">{e.number}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink">{e.titleMn ?? `${e.number}-р анги`}</p>
                {e.synopsisMn && <p className="mt-1 text-sm leading-relaxed text-muted">{e.synopsisMn}</p>}
                <p className="mt-1 text-xs text-muted">
                  {[e.releaseDate && formatDate(e.releaseDate), e.runtimeMinutes && formatRuntime(e.runtimeMinutes)].filter(Boolean).join(" · ")}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
