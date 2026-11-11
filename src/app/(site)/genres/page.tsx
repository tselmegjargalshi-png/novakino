import type { Metadata } from "next";
import Link from "next/link";
import { getGenres, getTitles } from "@/lib/catalog";
import { generatedBackground } from "@/components/content/Artwork";

export const metadata: Metadata = { title: "Төрөл", alternates: { canonical: "/genres" } };
export const revalidate = 300;

export default async function GenresPage() {
  const [genres, titles] = await Promise.all([getGenres(), getTitles()]);
  const counts = new Map<string, number>();
  for (const t of titles) for (const g of t.genres) counts.set(g.slug, (counts.get(g.slug) ?? 0) + 1);

  return (
    <div className="page pt-8 sm:pt-12">
      <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Төрөл</h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">Кино, анимэ, цувралыг төрлөөр нь хайж олоорой.</p>
      <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {genres.map((g, i) => {
          const n = counts.get(g.slug) ?? 0;
          return (
            <li key={g.slug}>
              <Link
                href={`/search?genre=${g.slug}`}
                className="group relative flex h-28 flex-col justify-end overflow-hidden rounded-card p-4 ring-1 ring-white/5 transition duration-300 ease-nova hover:-translate-y-0.5 hover:ring-electric/60 sm:h-32"
              >
                <span className="absolute inset-0 opacity-70 transition-opacity group-hover:opacity-100" style={{ background: generatedBackground(215 + ((i * 23) % 130)) }} aria-hidden="true" />
                <span className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" aria-hidden="true" />
                <span className="relative font-display text-[15px] font-semibold leading-tight">{g.nameMn}</span>
                <span className="relative mt-1 text-xs text-ink/70">{n} бүтээл</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
