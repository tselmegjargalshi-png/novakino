"use client";

import { ChevronLeft, ChevronRight, Info, Pause, Play, Star } from "lucide-react";
import clsx from "clsx";
import { useEffect, useState } from "react";
import type { Title } from "@/lib/catalog/types";
import { titleHref } from "@/lib/catalog/query";
import { formatRuntime, statusLabel, typeLabel } from "@/lib/i18n/mn";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Backdrop } from "./Artwork";
import { WatchlistButton } from "./WatchlistButton";

const INTERVAL_MS = 8000;

export function Hero({ titles }: { titles: Title[] }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const count = titles.length;

  useEffect(() => {
    if (!playing || hovered || count < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % count), INTERVAL_MS);
    return () => window.clearTimeout(id);
  }, [index, playing, hovered, count]);

  if (count === 0) return null;
  const go = (delta: number) => setIndex((i) => (i + delta + count) % count);

  return (
    <section
      className="relative -mt-[var(--np-header-h)] h-[78svh] min-h-[540px] max-h-[820px] w-full overflow-hidden"
      aria-roledescription="carousel"
      aria-label="Онцлох бүтээлүүд"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {titles.map((t, i) => (
        <div
          key={t.id}
          className={clsx("absolute inset-0 transition-opacity duration-700 ease-nova", i === index ? "opacity-100" : "pointer-events-none opacity-0")}
          aria-hidden={i !== index}
        >
          <Backdrop title={t} priority={i === 0} />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-bg/95 via-bg/45 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-bg via-bg/60 to-transparent" />

      <div className="page relative flex h-full flex-col justify-end pb-16 sm:pb-20">
        {titles.map((t, i) => {
          const meta = [
            t.releaseYear,
            t.genres.map((g) => g.nameMn).slice(0, 2).join(", "),
            t.type === "movie" && t.runtimeMinutes ? formatRuntime(t.runtimeMinutes) : null,
            t.type !== "movie" && t.airingStatus ? statusLabel[t.airingStatus] : null,
          ].filter(Boolean);
          return (
            <div
              key={t.id}
              className={clsx("max-w-2xl", i === index ? "block motion-safe:animate-[heroIn_600ms_cubic-bezier(0.2,0.8,0.2,1)]" : "hidden")}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} / ${count}: ${t.titleMn}`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-electric">{typeLabel[t.type]}</p>
              <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.08] tracking-tight [text-wrap:balance] sm:text-5xl lg:text-6xl">
                {t.titleMn}
              </h1>
              <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-ink/85">
                {t.ageRating && <Badge tone="outline">{t.ageRating}</Badge>}
                {t.externalRating != null && (
                  <span className="inline-flex items-center gap-1 font-medium">
                    <Star className="h-3.5 w-3.5 fill-current text-electric" />
                    {t.externalRating.toFixed(1)}
                    {t.externalRatingSource && <span className="text-muted">{t.externalRatingSource}</span>}
                  </span>
                )}
                {meta.map((m) => (
                  <span key={String(m)} className="text-ink/80">
                    {m}
                  </span>
                ))}
              </div>
              {t.synopsisMn && <p className="mt-5 line-clamp-3 max-w-xl text-[15px] leading-relaxed text-ink/80 sm:text-base">{t.synopsisMn}</p>}
              <div className="mt-7 flex flex-wrap gap-3">
                <ButtonLink href={titleHref(t)} size="lg">
                  <Info className="h-4 w-4" />
                  Дэлгэрэнгүй
                </ButtonLink>
                <WatchlistButton itemKey={`${t.type}/${t.slug}`} />
              </div>
            </div>
          );
        })}

        {count > 1 && (
          <div className="absolute bottom-5 left-4 right-4 flex items-center justify-between sm:left-8 sm:right-8 lg:left-12 lg:right-12">
            <div className="flex items-center gap-2">
              {titles.map((t, i) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`${i + 1}-р бүтээл: ${t.titleMn}`}
                  aria-current={i === index}
                  className="group flex h-6 items-center"
                >
                  <span className={clsx("block h-1 rounded-full transition-all duration-300 ease-nova", i === index ? "w-8 bg-electric" : "w-4 bg-white/30 group-hover:bg-white/60")} />
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Автомат солигдохыг зогсоох" : "Автомат солигдохыг үргэлжлүүлэх"} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/30 text-ink backdrop-blur transition hover:border-electric">
                {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              </button>
              <button type="button" onClick={() => go(-1)} aria-label="Өмнөх бүтээл" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/30 text-ink backdrop-blur transition hover:border-electric">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => go(1)} aria-label="Дараах бүтээл" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/30 text-ink backdrop-blur transition hover:border-electric">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
