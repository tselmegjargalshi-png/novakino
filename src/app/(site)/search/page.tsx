import type { Metadata } from "next";
import { getGenres, getTitles } from "@/lib/catalog";
import { availableYears, parseCatalogParams, queryTitles } from "@/lib/catalog/query";
import { ContentCard, ContentGrid } from "@/components/content/ContentCard";
import { EmptyState } from "@/components/content/EmptyState";
import { FilterBar } from "@/components/content/FilterBar";
import { Rail, RailItem } from "@/components/content/Rail";
import { SearchBox } from "@/components/content/SearchBox";

export const metadata: Metadata = { title: "Хайлт", robots: { index: false, follow: true } };

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = parseCatalogParams(await searchParams);
  const [all, genres] = await Promise.all([getTitles(), getGenres()]);
  const results = queryTitles(all, query);
  const hasQuery = Boolean(query.q || query.genre || query.year || query.type || query.status);
  const genreName = genres.find((g) => g.slug === query.genre)?.nameMn;

  const extra = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) if (k !== "q" && v !== undefined) extra.set(k, String(v));

  return (
    <>
      <div className="page pt-8 sm:pt-12">
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Хайлт</h1>
        <div className="mt-6 max-w-3xl">
          <SearchBox initial={query.q ?? ""} extraParams={extra.toString()} />
        </div>
        <div className="mt-5">
          <FilterBar query={query} genres={genres} years={availableYears(all)} showType showStatus showRating={all.some((t) => t.externalRating != null)} />
        </div>

        <p className="mt-7 text-sm text-muted" aria-live="polite">
          {hasQuery
            ? `${[query.q && `"${query.q}"`, genreName].filter(Boolean).join(", ") || "Шүүлтүүр"}: ${results.length} илэрц`
            : `Нийт ${results.length} бүтээл`}
        </p>
        <div className="mt-4">
          {results.length > 0 ? (
            <ContentGrid titles={results} />
          ) : (
            <EmptyState title="Илэрц олдсонгүй" body="Өөр үгээр хайх эсвэл шүүлтүүрээ багасгаж үзнэ үү. Доор шинээр нэмэгдсэн бүтээлүүдийг санал болгож байна." />
          )}
        </div>
      </div>
      {results.length === 0 && all.length > 0 && (
        <Rail title="Шинээр нэмэгдсэн">
          {queryTitles(all, { sort: "newest" })
            .slice(0, 12)
            .map((t) => (
              <RailItem key={t.id}>
                <ContentCard title={t} />
              </RailItem>
            ))}
        </Rail>
      )}
    </>
  );
}
