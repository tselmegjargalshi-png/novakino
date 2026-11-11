import { getTitles } from "@/lib/catalog";
import { queryTitles } from "@/lib/catalog/query";
import type { Title } from "@/lib/catalog/types";
import { ContentCard } from "@/components/content/ContentCard";
import { EmptyState } from "@/components/content/EmptyState";
import { Hero } from "@/components/content/Hero";
import { Rail, RailItem } from "@/components/content/Rail";

export const revalidate = 300;

interface Collection {
  title: string;
  href?: string;
  items: Title[];
}

/**
 * Collections that need data we do not have yet are omitted, not faked:
 * "Үргэлжлүүлэн үзэх" and "Танд санал болгох" need accounts (Phase C),
 * "Хамгийн их үзсэн" and "Тренд болж буй" need viewing data (Phase D).
 */
function buildCollections(all: Title[]): Collection[] {
  const newest = (type: Title["type"]) => queryTitles(all, { type, sort: "newest" }).slice(0, 20);
  const rated = all.filter((t) => t.externalRating != null);
  return [
    { title: "Онцлох бүтээлүүд", items: all.filter((t) => t.featured) },
    { title: "Шинээр нэмэгдсэн кино", href: "/movies", items: newest("movie") },
    { title: "Шинэ анимэ", href: "/anime", items: newest("anime") },
    { title: "Шинэ цуврал", href: "/series", items: newest("series") },
    { title: "Монгол хадмалтай", items: all.filter((t) => t.subtitleLanguages.includes("mn")).slice(0, 20) },
    { title: "Өндөр үнэлгээтэй", items: queryTitles(rated, { sort: "rating" }).slice(0, 20) },
  ].filter((c) => c.items.length > 0);
}

export default async function HomePage() {
  const all = await getTitles();
  if (all.length === 0) {
    return (
      <div className="page pt-16">
        <EmptyState title="Каталог удахгүй нээгдэнэ" body="Лицензтэй бүтээлүүд нийтлэгдмэгц энд харагдана." />
      </div>
    );
  }
  const featured = all.filter((t) => t.featured);
  const hero = (featured.length > 0 ? featured : all).slice(0, 5);
  const collections = buildCollections(all);

  return (
    <>
      <Hero titles={hero} />
      <div className="relative z-10 -mt-6">
        {collections.map((c) => (
          <Rail key={c.title} title={c.title} href={c.href}>
            {c.items.map((t) => (
              <RailItem key={t.id}>
                <ContentCard title={t} />
              </RailItem>
            ))}
          </Rail>
        ))}
      </div>
    </>
  );
}
