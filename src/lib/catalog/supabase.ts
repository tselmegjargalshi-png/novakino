import { artworkUrl, createPublicClient } from "@/lib/supabase/server";
import type { CatalogRepository, ContentType, Genre, Season, Title } from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */
// Rows come from the `public_content` view, which already enforces
// published status, release time and active approved MN rights.

function hueFrom(id: string): number {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return 200 + (h % 150); // stay in the blue to magenta range of the brand
}

function toTitle(row: any, genres: Map<string, Title["genres"]>, studios: Map<string, string>): Title {
  return {
    id: row.id,
    type: row.type,
    slug: row.slug,
    titleMn: row.title_mn,
    titleOriginal: row.title_original ?? undefined,
    titleEn: row.title_en ?? undefined,
    titleJa: row.title_ja ?? undefined,
    titleKo: row.title_ko ?? undefined,
    synopsisMn: row.synopsis_mn ?? undefined,
    releaseYear: row.release_year ?? undefined,
    runtimeMinutes: row.runtime_minutes ?? undefined,
    ageRating: row.age_rating ?? undefined,
    externalRating: row.external_rating != null ? Number(row.external_rating) : undefined,
    externalRatingSource: row.external_rating_source ?? undefined,
    countryCode: row.country_code ?? undefined,
    studio: row.studio_id ? studios.get(row.studio_id) : undefined,
    airingStatus: row.airing_status ?? undefined,
    accessTier: row.access_tier,
    posterUrl: artworkUrl(row.poster_path),
    backdropUrl: artworkUrl(row.backdrop_path),
    genres: genres.get(row.id) ?? [],
    subtitleLanguages: row.subtitle_languages ?? [],
    audioLanguages: [],
    cast: [],
    directors: [],
    seasons: [],
    addedAt: row.created_at,
    hue: hueFrom(row.id),
  };
}

async function loadAll(): Promise<Title[]> {
  const db = createPublicClient();
  const [content, links, studios] = await Promise.all([
    db.from("public_content").select("*").order("created_at", { ascending: false }).limit(1000),
    db.from("content_genres").select("content_id, genres(slug, name_mn)"),
    db.from("studios").select("id, name"),
  ]);
  if (content.error) throw new Error(`Catalog query failed: ${content.error.message}`);
  if (links.error) throw new Error(`Genre query failed: ${links.error.message}`);
  if (studios.error) throw new Error(`Studio query failed: ${studios.error.message}`);

  const genreMap = new Map<string, Title["genres"]>();
  for (const l of links.data as any[]) {
    if (!l.genres) continue;
    const list = genreMap.get(l.content_id) ?? [];
    list.push({ slug: l.genres.slug, nameMn: l.genres.name_mn });
    genreMap.set(l.content_id, list);
  }
  const studioMap = new Map<string, string>((studios.data as any[]).map((s) => [s.id, s.name]));

  const featured = await db.from("banners").select("content_id").eq("is_active", true).order("sort_order");
  const featuredIds = new Set((featured.data ?? []).map((b: any) => b.content_id));

  return (content.data as any[]).map((row) => ({
    ...toTitle(row, genreMap, studioMap),
    featured: featuredIds.has(row.id),
  }));
}

export const supabaseRepository: CatalogRepository = {
  isDemo: false,
  listTitles: loadAll,

  async getTitle(type: ContentType, slug: string) {
    const all = await loadAll();
    const base = all.find((t) => t.type === type && t.slug === slug);
    if (!base) return null;

    const db = createPublicClient();
    const [people, seasons] = await Promise.all([
      db.from("content_people").select("role, billing_order, people(name)").eq("content_id", base.id).order("billing_order"),
      db
        .from("seasons")
        .select("season_number, title_mn, episodes(episode_number, title_mn, synopsis_mn, runtime_minutes, release_at)")
        .eq("content_id", base.id)
        .order("season_number"),
    ]);
    const credits = (people.data ?? []) as any[];
    const seasonRows = (seasons.data ?? []) as any[];

    return {
      ...base,
      cast: credits.filter((c) => c.role === "cast" || c.role === "voice").map((c) => c.people?.name).filter(Boolean),
      directors: credits.filter((c) => c.role === "director").map((c) => c.people?.name).filter(Boolean),
      seasons: seasonRows.map<Season>((s) => ({
        number: s.season_number,
        titleMn: s.title_mn ?? undefined,
        episodes: ((s.episodes ?? []) as any[])
          .sort((a, b) => a.episode_number - b.episode_number)
          .map((e) => ({
            number: e.episode_number,
            titleMn: e.title_mn ?? undefined,
            synopsisMn: e.synopsis_mn ?? undefined,
            runtimeMinutes: e.runtime_minutes ?? undefined,
            releaseDate: e.release_at ?? undefined,
          })),
      })),
    };
  },

  async listGenres(): Promise<Genre[]> {
    const db = createPublicClient();
    const { data, error } = await db.from("genres").select("slug, name_mn, applies_to").order("sort_order");
    if (error) throw new Error(`Genre list failed: ${error.message}`);
    return (data as any[]).map((g) => ({ slug: g.slug, nameMn: g.name_mn, appliesTo: g.applies_to }));
  },
};
