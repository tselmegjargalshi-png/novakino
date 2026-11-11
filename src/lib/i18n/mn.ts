import type { AccessTier, AiringStatus, ContentType, SortKey } from "@/lib/catalog/types";

export const typeLabel: Record<ContentType, string> = { movie: "Кино", anime: "Анимэ", series: "Цуврал" };
export const statusLabel: Record<AiringStatus, string> = {
  ongoing: "Гарч байгаа",
  completed: "Дууссан",
  upcoming: "Удахгүй",
};
export const tierLabel: Record<AccessTier, string> = { free: "Үнэгүй", standard: "Стандарт", premium: "Премиум" };
export const sortLabel: Record<SortKey, string> = {
  newest: "Шинээр нэмэгдсэн",
  year: "Гарсан он",
  title: "Нэрээр",
  rating: "Үнэлгээгээр",
};

const languages: Record<string, string> = {
  mn: "Монгол",
  en: "Англи",
  ja: "Япон",
  ko: "Солонгос",
  tr: "Турк",
  zh: "Хятад",
  ru: "Орос",
};
export const languageLabel = (code: string) => languages[code] ?? code.toUpperCase();

const countries: Record<string, string> = {
  MN: "Монгол",
  JP: "Япон",
  KR: "Өмнөд Солонгос",
  TR: "Турк",
  US: "АНУ",
  GB: "Их Британи",
  CN: "Хятад",
  FR: "Франц",
};
export const countryLabel = (code: string) => countries[code] ?? code;

export function formatRuntime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? (m ? `${h} ц ${m} мин` : `${h} ц`) : `${m} мин`;
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return `${y} оны ${m} сарын ${d}`;
}
