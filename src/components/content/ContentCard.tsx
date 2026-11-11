import Link from "next/link";
import type { Title } from "@/lib/catalog/types";
import { titleHref } from "@/lib/catalog/query";
import { statusLabel, tierLabel } from "@/lib/i18n/mn";
import { Poster } from "./Artwork";

export function ContentCard({ title, sizes = "(min-width: 1024px) 200px, 40vw" }: { title: Title; sizes?: string }) {
  const meta = [title.releaseYear, title.genres[0]?.nameMn].filter(Boolean).join(" · ");
  return (
    <Link href={titleHref(title)} className="group block" aria-label={title.titleMn}>
      <div className="relative aspect-[2/3] overflow-hidden rounded-card bg-surface ring-1 ring-white/5 transition duration-300 ease-nova group-hover:-translate-y-1 group-hover:ring-electric/60 group-hover:shadow-[0_18px_40px_-18px_rgb(124_77_255/0.7)]">
        <Poster title={title} sizes={sizes} />
        <div className="absolute left-2 top-2 flex gap-1">
          {title.accessTier !== "standard" && (
            <span className="rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-electric backdrop-blur">
              {tierLabel[title.accessTier]}
            </span>
          )}
          {title.airingStatus === "upcoming" && (
            <span className="rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky backdrop-blur">
              {statusLabel.upcoming}
            </span>
          )}
        </div>
      </div>
      <p className="mt-2.5 truncate text-sm font-medium text-ink">{title.titleMn}</p>
      {meta && <p className="mt-0.5 truncate text-xs text-muted">{meta}</p>}
    </Link>
  );
}

export function ContentGrid({ titles }: { titles: Title[] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {titles.map((t) => (
        <li key={t.id}>
          <ContentCard title={t} sizes="(min-width: 1280px) 16vw, (min-width: 768px) 24vw, 46vw" />
        </li>
      ))}
    </ul>
  );
}
