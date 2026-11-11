import { getGenres, getTitles } from "@/lib/catalog";
import { availableYears, catalogHref, parseCatalogParams, queryTitles } from "@/lib/catalog/query";
import type { ContentType } from "@/lib/catalog/types";
import { ButtonLink } from "@/components/ui/Button";
import { ContentGrid } from "./ContentCard";
import { EmptyState } from "./EmptyState";
import { FilterBar } from "./FilterBar";

const COPY: Record<ContentType, { title: string; lead: string }> = {
  movie: { title: "Кино", lead: "Монгол хадмалтай, албан ёсны эрхтэй уран сайхны болон баримтат кинонууд." },
  anime: { title: "Анимэ", lead: "Гарч байгаа, дууссан, удахгүй гарах анимэ цувралууд улирал, ангиараа." },
  series: { title: "Цуврал", lead: "Олон улсын, солонгос, япон, турк болон бусад орны телевизийн цувралууд." },
};

export async function CatalogPage({ type, searchParams }: { type: ContentType; searchParams: Record<string, string | string[] | undefined> }) {
  const [all, genres] = await Promise.all([getTitles(), getGenres()]);
  const ofType = all.filter((t) => t.type === type);
  const query = { ...parseCatalogParams(searchParams), type, q: undefined };
  const results = queryTitles(ofType, query);
  const copy = COPY[type];

  return (
    <div className="page pt-8 sm:pt-12">
      <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{copy.title}</h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">{copy.lead}</p>

      <div className="mt-8">
        <FilterBar
          query={{ ...query, type: undefined }}
          genres={genres.filter((g) => g.appliesTo.includes(type))}
          years={availableYears(ofType)}
          showStatus={type !== "movie"}
          showRating={ofType.some((t) => t.externalRating != null)}
        />
      </div>

      <p className="mt-6 text-sm text-muted" aria-live="polite">
        {results.length} бүтээл
      </p>
      <div className="mt-4">
        {results.length > 0 ? (
          <ContentGrid titles={results} />
        ) : ofType.length === 0 ? (
          <EmptyState title="Одоогоор бүтээл нэмэгдээгүй байна" body="Лицензтэй бүтээл нийтлэгдмэгц энд харагдана." />
        ) : (
          <EmptyState
            title="Тохирох бүтээл олдсонгүй"
            body="Шүүлтүүрээ өөрчлөөд дахин оролдоно уу."
            action={
              <ButtonLink href={catalogHref(type)} variant="secondary">
                Бүх {copy.title.toLowerCase()} харах
              </ButtonLink>
            }
          />
        )}
      </div>
    </div>
  );
}
