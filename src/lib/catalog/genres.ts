import type { Genre } from "./types";

// Mirrors the genres seeded in supabase/migrations.
export const GENRES: Genre[] = [
  { slug: "action", nameMn: "Экшн", appliesTo: ["movie", "anime", "series"] },
  { slug: "adventure", nameMn: "Адал явдал", appliesTo: ["movie", "anime", "series"] },
  { slug: "comedy", nameMn: "Инээдмийн", appliesTo: ["movie", "anime", "series"] },
  { slug: "drama", nameMn: "Драм", appliesTo: ["movie", "series"] },
  { slug: "romance", nameMn: "Романтик", appliesTo: ["movie", "anime", "series"] },
  { slug: "horror", nameMn: "Аймшгийн", appliesTo: ["movie", "series"] },
  { slug: "thriller", nameMn: "Триллер", appliesTo: ["movie", "series"] },
  { slug: "mystery", nameMn: "Нууцлаг", appliesTo: ["movie", "anime", "series"] },
  { slug: "sci-fi", nameMn: "Шинжлэх ухааны уран зөгнөлт", appliesTo: ["movie", "series"] },
  { slug: "fantasy", nameMn: "Уран зөгнөлт", appliesTo: ["movie", "anime", "series"] },
  { slug: "animation", nameMn: "Хүүхэлдэйн", appliesTo: ["movie"] },
  { slug: "documentary", nameMn: "Баримтат", appliesTo: ["movie", "series"] },
  { slug: "shounen", nameMn: "Шонэн", appliesTo: ["anime"] },
  { slug: "shoujo", nameMn: "Шожо", appliesTo: ["anime"] },
  { slug: "seinen", nameMn: "Сэйнэн", appliesTo: ["anime"] },
  { slug: "isekai", nameMn: "Исэкай", appliesTo: ["anime"] },
  { slug: "slice-of-life", nameMn: "Өдөр тутмын амьдрал", appliesTo: ["anime"] },
  { slug: "psychological", nameMn: "Сэтгэл зүйн", appliesTo: ["anime", "series"] },
  { slug: "sports", nameMn: "Спорт", appliesTo: ["anime"] },
];
