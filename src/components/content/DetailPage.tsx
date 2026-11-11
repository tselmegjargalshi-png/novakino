import type { Metadata } from "next";
import { Star } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { getTitle, getTitles } from "@/lib/catalog";
import { catalogHref, relatedTitles, titleHref } from "@/lib/catalog/query";
import type { ContentType, Title } from "@/lib/catalog/types";
import { countryLabel, formatRuntime, languageLabel, statusLabel, tierLabel, typeLabel } from "@/lib/i18n/mn";
import { site } from "@/lib/site";
import { Badge } from "@/components/ui/Badge";
import { Backdrop, Poster } from "./Artwork";
import { ContentCard } from "./ContentCard";
import { Rail, RailItem } from "./Rail";
import { SeasonList } from "./SeasonList";
import { WatchlistButton } from "./WatchlistButton";

export async function detailMetadata(type: ContentType, slug: string): Promise<Metadata> {
  const t = await getTitle(type, slug);
  if (!t) return { title: "Олдсонгүй" };
  const title = t.releaseYear ? `${t.titleMn} (${t.releaseYear})` : t.titleMn;
  return {
    title,
    description: t.synopsisMn,
    alternates: { canonical: titleHref(t) },
    openGraph: {
      title,
      description: t.synopsisMn,
      type: type === "movie" ? "video.movie" : "video.tv_show",
      images: t.backdropUrl ?? t.posterUrl ? [{ url: (t.backdropUrl ?? t.posterUrl)! }] : undefined,
    },
  };
}

function jsonLd(t: Title) {
  return {
    "@context": "https://schema.org",
    "@type": t.type === "movie" ? "Movie" : "TVSeries",
    name: t.titleMn,
    alternateName: t.titleOriginal ?? t.titleEn,
    description: t.synopsisMn,
    url: `${site.url}${titleHref(t)}`,
    image: t.posterUrl,
    datePublished: t.releaseYear ? String(t.releaseYear) : undefined,
    genre: t.genres.map((g) => g.nameMn),
    inLanguage: t.audioLanguages[0],
    director: t.directors.map((name) => ({ "@type": "Person", name })),
    actor: t.cast.map((name) => ({ "@type": "Person", name })),
    numberOfSeasons: t.type === "movie" ? undefined : t.seasons.length || undefined,
  };
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.14em] text-muted">{label}</dt>
      <dd className="mt-1.5 text-sm leading-relaxed text-ink">{children}</dd>
    </div>
  );
}

export async function DetailPage({ type, slug }: { type: ContentType; slug: string }) {
  const t = await getTitle(type, slug);
  if (!t) notFound();
  const related = relatedTitles(await getTitles(), t);
  const altTitles = [...new Set([t.titleOriginal, t.titleEn, t.titleJa, t.titleKo].filter((x): x is string => !!x && x !== t.titleMn))];
  const episodeCount = t.seasons.reduce((n, s) => n + s.episodes.length, 0);
  const meta = [
    t.releaseYear,
    t.type === "movie" ? t.runtimeMinutes && formatRuntime(t.runtimeMinutes) : episodeCount > 0 && `${t.seasons.length} улирал, ${episodeCount} анги`,
    t.type !== "movie" && t.airingStatus && statusLabel[t.airingStatus],
    t.type !== "movie" && t.runtimeMinutes && `Анги бүр ${formatRuntime(t.runtimeMinutes)}`,
  ].filter(Boolean) as (string | number)[];

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(t)).replace(/</g, "\\u003c") }} />
      <div className="relative -mt-[var(--np-header-h)] overflow-hidden pt-[var(--np-header-h)]">
        <Backdrop title={t} priority className="opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/80 to-bg/30" />
        <div className="page relative grid gap-8 pb-10 pt-10 sm:pt-16 md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr] lg:gap-12">
          <div className="relative mx-auto aspect-[2/3] w-44 overflow-hidden rounded-card shadow-2xl ring-1 ring-white/10 md:mx-0 md:w-full">
            <Poster title={t} sizes="(min-width: 1024px) 280px, 240px" priority />
          </div>
          <div className="min-w-0 self-end">
            <nav aria-label="Байршил" className="text-xs text-muted">
              <Link href="/" className="hover:text-ink">Нүүр</Link>
              <span className="mx-2">/</span>
              <Link href={catalogHref(t.type)} className="hover:text-ink">{typeLabel[t.type]}</Link>
            </nav>
            <h1 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight [text-wrap:balance] sm:text-4xl lg:text-5xl">{t.titleMn}</h1>
            {altTitles.length > 0 && <p className="mt-2 text-sm text-muted">{altTitles.join(" · ")}</p>}

            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-ink/85">
              {t.ageRating && <Badge tone="outline">{t.ageRating}</Badge>}
              <Badge tone="accent">{tierLabel[t.accessTier]}</Badge>
              {t.externalRating != null && (
                <span className="inline-flex items-center gap-1 font-medium">
                  <Star className="h-3.5 w-3.5 fill-current text-electric" />
                  {t.externalRating.toFixed(1)}
                  {t.externalRatingSource && <span className="font-normal text-muted">{t.externalRatingSource}</span>}
                </span>
              )}
              {meta.map((m) => (
                <span key={String(m)}>{m}</span>
              ))}
            </div>

            {t.genres.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-2">
                {t.genres.map((g) => (
                  <li key={g.slug}>
                    <Link href={`${catalogHref(t.type)}?genre=${g.slug}`} className="inline-flex h-8 items-center rounded-full border border-line px-3.5 text-xs text-ink/90 transition hover:border-electric hover:text-electric">
                      {g.nameMn}
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {t.synopsisMn && <p className="mt-6 max-w-3xl text-[15px] leading-relaxed text-ink/85 sm:text-base">{t.synopsisMn}</p>}

            <div className="mt-7">
              <WatchlistButton itemKey={`${t.type}/${t.slug}`} />
            </div>
          </div>
        </div>
      </div>

      <div className="page mt-4">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-6 rounded-card border border-line bg-surface p-5 sm:grid-cols-3 sm:p-7 lg:grid-cols-4">
          {t.directors.length > 0 && <Fact label="Найруулагч">{t.directors.join(", ")}</Fact>}
          {t.cast.length > 0 && <Fact label="Жүжигчид">{t.cast.join(", ")}</Fact>}
          {t.studio && <Fact label="Студи">{t.studio}</Fact>}
          {t.countryCode && <Fact label="Улс">{countryLabel(t.countryCode)}</Fact>}
          {t.audioLanguages.length > 0 && <Fact label="Дууны хэл">{t.audioLanguages.map(languageLabel).join(", ")}</Fact>}
          {t.subtitleLanguages.length > 0 && <Fact label="Хадмал">{t.subtitleLanguages.map(languageLabel).join(", ")}</Fact>}
          {t.maxResolution && <Fact label="Дээд чанар">{t.maxResolution >= 2160 ? "4K" : `${t.maxResolution}p`}</Fact>}
          {t.ageRating && <Fact label="Насны ангилал">{t.ageRating}</Fact>}
        </dl>

        {t.type !== "movie" && (
          <section className="mt-12" aria-labelledby="episodes-heading">
            <h2 id="episodes-heading" className="font-display text-xl font-semibold tracking-tight">Улирал ба ангиуд</h2>
            <div className="mt-5">
              {t.seasons.length > 0 ? <SeasonList seasons={t.seasons} /> : <p className="text-sm text-muted">Ангиудын хуваарь удахгүй зарлагдана.</p>}
            </div>
          </section>
        )}
      </div>

      {related.length > 0 && (
        <Rail title="Төстэй бүтээлүүд">
          {related.map((r) => (
            <RailItem key={r.id}>
              <ContentCard title={r} />
            </RailItem>
          ))}
        </Rail>
      )}
    </article>
  );
}
