import type { CatalogQuery, ContentType, Title } from "./types";

const norm = (s: string) => s.toLocaleLowerCase("mn").normalize("NFKC").trim();

function haystack(t: Title): string {
  return norm(
    [
      t.titleMn,
      t.titleOriginal,
      t.titleEn,
      t.titleJa,
      t.titleKo,
      t.studio,
      t.releaseYear,
      ...t.genres.map((g) => g.nameMn),
      ...t.genres.map((g) => g.slug),
      ...t.cast,
      ...t.directors,
    ]
      .filter(Boolean)
      .join(" "),
  );
}

/** Every whitespace separated term must match somewhere in the title's searchable text. */
export function matchesSearch(t: Title, q: string): boolean {
  const terms = norm(q).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const hay = haystack(t);
  return terms.every((term) => hay.includes(term));
}

export function queryTitles(titles: Title[], query: CatalogQuery): Title[] {
  const out = titles.filter(
    (t) =>
      (!query.type || t.type === query.type) &&
      (!query.genre || t.genres.some((g) => g.slug === query.genre)) &&
      (!query.year || t.releaseYear === query.year) &&
      (!query.status || t.airingStatus === query.status) &&
      (!query.q || matchesSearch(t, query.q)),
  );
  const sort = query.sort ?? "newest";
  return out.sort((a, b) => {
    if (sort === "title") return a.titleMn.localeCompare(b.titleMn, "mn");
    if (sort === "year") return (b.releaseYear ?? 0) - (a.releaseYear ?? 0);
    if (sort === "rating") return (b.externalRating ?? -1) - (a.externalRating ?? -1);
    return b.addedAt.localeCompare(a.addedAt);
  });
}

/** Rule based "similar titles": same type first, ranked by shared genres. */
export function relatedTitles(all: Title[], target: Title, limit = 12): Title[] {
  const slugs = new Set(target.genres.map((g) => g.slug));
  return all
    .filter((t) => t.id !== target.id)
    .map((t) => ({
      t,
      score: t.genres.filter((g) => slugs.has(g.slug)).length * 2 + (t.type === target.type ? 1 : 0),
    }))
    .filter((x) => x.score > 1)
    .sort((a, b) => b.score - a.score || b.t.addedAt.localeCompare(a.t.addedAt))
    .slice(0, limit)
    .map((x) => x.t);
}

export function availableYears(titles: Title[]): number[] {
  return [...new Set(titles.map((t) => t.releaseYear).filter((y): y is number => !!y))].sort((a, b) => b - a);
}

const TYPE_PATH: Record<ContentType, string> = { movie: "movie", anime: "anime", series: "series" };
export const titleHref = (t: Pick<Title, "type" | "slug">) => `/${TYPE_PATH[t.type]}/${t.slug}`;
export const catalogHref = (type: ContentType) => (type === "movie" ? "/movies" : `/${type}`);

export function parseCatalogParams(sp: Record<string, string | string[] | undefined>): CatalogQuery {
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k]?.[0] : (sp[k] as string | undefined));
  const year = Number(one("year"));
  const sort = one("sort");
  const status = one("status");
  const type = one("type");
  return {
    q: one("q")?.slice(0, 80) || undefined,
    genre: one("genre") || undefined,
    year: Number.isInteger(year) && year > 1887 && year < 2101 ? year : undefined,
    sort: sort === "year" || sort === "title" || sort === "rating" || sort === "newest" ? sort : undefined,
    status: status === "ongoing" || status === "completed" || status === "upcoming" ? status : undefined,
    type: type === "movie" || type === "anime" || type === "series" ? type : undefined,
  };
}
