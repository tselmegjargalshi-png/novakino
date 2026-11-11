export type ContentType = "movie" | "anime" | "series";
export type AiringStatus = "upcoming" | "ongoing" | "completed";
export type AccessTier = "free" | "standard" | "premium";

export interface Genre {
  slug: string;
  nameMn: string;
  appliesTo: ContentType[];
}

export interface Episode {
  number: number;
  titleMn?: string;
  synopsisMn?: string;
  runtimeMinutes?: number;
  releaseDate?: string;
}

export interface Season {
  number: number;
  titleMn?: string;
  episodes: Episode[];
}

export interface Title {
  id: string;
  type: ContentType;
  slug: string;
  titleMn: string;
  titleOriginal?: string;
  titleEn?: string;
  titleJa?: string;
  titleKo?: string;
  synopsisMn?: string;
  releaseYear?: number;
  runtimeMinutes?: number;
  ageRating?: string;
  externalRating?: number;
  externalRatingSource?: string;
  countryCode?: string;
  studio?: string;
  airingStatus?: AiringStatus;
  accessTier: AccessTier;
  posterUrl?: string;
  backdropUrl?: string;
  genres: { slug: string; nameMn: string }[];
  subtitleLanguages: string[];
  audioLanguages: string[];
  maxResolution?: number;
  cast: string[];
  directors: string[];
  seasons: Season[];
  addedAt: string;
  featured?: boolean;
  /** Hue for generated placeholder artwork when no licensed image exists. */
  hue: number;
}

export type SortKey = "newest" | "year" | "title" | "rating";

export interface CatalogQuery {
  type?: ContentType;
  genre?: string;
  year?: number;
  status?: AiringStatus;
  sort?: SortKey;
  q?: string;
}

export interface CatalogRepository {
  /** True when the data is placeholder demo content, not licensed titles. */
  readonly isDemo: boolean;
  listTitles(): Promise<Title[]>;
  getTitle(type: ContentType, slug: string): Promise<Title | null>;
  listGenres(): Promise<Genre[]>;
}
