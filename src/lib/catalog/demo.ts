import { GENRES } from "./genres";
import type { AiringStatus, CatalogRepository, ContentType, Season, Title } from "./types";

/**
 * Placeholder catalog shown only while Supabase is not configured.
 * Every title here is invented for layout purposes. None of them is a real
 * film, anime or series, and no third party artwork is used.
 */
const genre = (slug: string) => {
  const g = GENRES.find((x) => x.slug === slug);
  if (!g) throw new Error(`Unknown genre ${slug}`);
  return { slug: g.slug, nameMn: g.nameMn };
};

function seasons(counts: number[], startYear: number, runtime: number): Season[] {
  return counts.map((count, s) => ({
    number: s + 1,
    episodes: Array.from({ length: count }, (_, e) => ({
      number: e + 1,
      titleMn: `${e + 1}-р анги`,
      runtimeMinutes: runtime,
      releaseDate: `${startYear + s}-${String((e % 12) + 1).padStart(2, "0")}-${String(((e * 7) % 27) + 1).padStart(2, "0")}`,
    })),
  }));
}

interface Seed {
  type: ContentType;
  slug: string;
  mn: string;
  en: string;
  synopsis: string;
  year: number;
  genres: string[];
  hue: number;
  age: string;
  country: string;
  runtime?: number;
  status?: AiringStatus;
  eps?: number[];
  subs?: string[];
  audio?: string[];
  featured?: boolean;
  tier?: Title["accessTier"];
}

const seeds: Seed[] = [
  { type: "movie", slug: "tengeriin-khayaa", mn: "Тэнгэрийн хаяа", en: "Edge of the Sky", year: 2026, genres: ["sci-fi", "adventure"], hue: 262, age: "13+", country: "MN", runtime: 128, featured: true, tier: "premium",
    synopsis: "Сансрын станцын залуу инженер дэлхийтэй холбоо тасарсан гурван хоногт багаа аврах цорын ганц замыг эрж хайна." },
  { type: "movie", slug: "suulchiin-galt-tereg", mn: "Сүүлчийн галт тэрэг", en: "The Last Train", year: 2025, genres: ["thriller", "mystery"], hue: 218, age: "16+", country: "MN", runtime: 109,
    synopsis: "Шөнийн галт тэрэгний нэг зорчигч алга болсноор мөрдөгч үүр цайхаас өмнө үнэнийг олох ёстой болно." },
  { type: "movie", slug: "tsagaan-sariin-udesh", mn: "Цагаан сарын үдэш", en: "Lunar New Year's Eve", year: 2025, genres: ["comedy", "drama"], hue: 330, age: "7+", country: "MN", runtime: 96, tier: "free",
    synopsis: "Битүүний орой гурван үеийн гэр бүл нэг дээвэр дор цугларч, олон жил нуусан жижиг нууцууд нэг нэгээрээ ил болно." },
  { type: "movie", slug: "goviin-suuder", mn: "Говийн сүүдэр", en: "Shadow of the Gobi", year: 2024, genres: ["action", "adventure"], hue: 28, age: "16+", country: "MN", runtime: 117,
    synopsis: "Тэмээн жингийн хөтөч асан эр алдагдсан ачааг хайж говийн гүн рүү сүүлчийн аялалдаа гарна." },
  { type: "movie", slug: "mungun-nuur", mn: "Мөнгөн нуур", en: "Silver Lake", year: 2024, genres: ["romance", "drama"], hue: 196, age: "13+", country: "MN", runtime: 104,
    synopsis: "Арван жилийн дараа төрсөн нутагтаа эргэн ирсэн гэрэл зурагчин нуурын эрэг дээр анхны хайртайгаа дахин учирна." },
  { type: "movie", slug: "chimeegui-uul", mn: "Чимээгүй уул", en: "The Silent Mountain", year: 2023, genres: ["documentary"], hue: 160, age: "0+", country: "MN", runtime: 82, tier: "free",
    synopsis: "Алтайн өндөрлөгт дөрвөн улирлыг өнгөрөөсөн малчин айлын нэг жилийн түүх." },

  { type: "anime", slug: "od-tuugch", mn: "Од түүгч", en: "Star Gatherer", year: 2026, genres: ["shounen", "adventure", "fantasy"], hue: 250, age: "13+", country: "JP", runtime: 24, status: "ongoing", eps: [12, 6], featured: true,
    synopsis: "Унасан оддыг цуглуулдаг хүү тэнгэрийн газрын зургийг бүтээхээр найзуудтайгаа хязгааргүй аялалд гарна." },
  { type: "anime", slug: "salkhinii-khot", mn: "Салхины хот", en: "City of Wind", year: 2024, genres: ["slice-of-life", "romance"], hue: 186, age: "7+", country: "JP", runtime: 23, status: "completed", eps: [12], tier: "free",
    synopsis: "Далайн эргийн жижиг хотод шилжиж ирсэн сурагч охин салхин сэнсний засварчинтай танилцаж, өдөр тутмын жижиг гайхамшгуудыг нээнэ." },
  { type: "anime", slug: "khoyor-dakhi-yertunts", mn: "Хоёр дахь ертөнц", en: "The Second World", year: 2025, genres: ["isekai", "fantasy", "comedy"], hue: 290, age: "13+", country: "JP", runtime: 24, status: "ongoing", eps: [10],
    synopsis: "Номын санч залуу шидэт ертөнцөд сэрэхдээ өөрийгөө баатар биш, харин баатрын нягтлан бодогч болсныг мэднэ." },
  { type: "anime", slug: "kharankhuin-shatar", mn: "Харанхуйн шатар", en: "Chess in the Dark", year: 2023, genres: ["psychological", "mystery", "seinen"], hue: 236, age: "16+", country: "JP", runtime: 25, status: "completed", eps: [13],
    synopsis: "Нууц тэмцээнд уригдсан шатарчин нүүдэл бүр нь бодит амьдралд үр дагавартайг ойлгоно." },
  { type: "anime", slug: "shidet-tsetserleg", mn: "Шидэт цэцэрлэг", en: "The Enchanted Garden", year: 2027, genres: ["shoujo", "fantasy"], hue: 318, age: "7+", country: "JP", runtime: 24, status: "upcoming", eps: [],
    synopsis: "Эмээгийнхээ орхисон цэцэрлэгийг сэргээх охин цэцэг бүр нэг хүслийг биелүүлдгийг олж мэднэ." },
  { type: "anime", slug: "musun-talbai", mn: "Мөсөн талбай", en: "The Ice Rink", year: 2025, genres: ["sports", "shounen"], hue: 204, age: "7+", country: "JP", runtime: 24, status: "ongoing", eps: [8],
    synopsis: "Хөдөөний сургуулийн хоккейн баг улсын аварга болох мөрөөдлөө ганцхан өвлийн дотор биелүүлэхээр зүтгэнэ." },

  { type: "series", slug: "niisleliin-shunu", mn: "Нийслэлийн шөнө", en: "Capital Nights", year: 2026, genres: ["drama", "thriller"], hue: 270, age: "16+", country: "MN", runtime: 48, status: "ongoing", eps: [8], featured: true, tier: "premium",
    synopsis: "Шөнийн ээлжийн түргэн тусламжийн эмч, сэтгүүлч, цагдаа гурвын зам нэг хэргээр огтлолцоно." },
  { type: "series", slug: "tsenkher-dalain-zakhidal", mn: "Цэнхэр далайн захидал", en: "Letters from the Blue Sea", year: 2025, genres: ["romance", "drama"], hue: 200, age: "13+", country: "KR", runtime: 62, status: "completed", eps: [16], audio: ["ko"],
    synopsis: "Арлын шуудангийн ажилтан хаяггүй захидлуудын эзнийг хайж явахдаа өөрийн өнгөрсөнтэй нүүр тулна." },
  { type: "series", slug: "sakuragiin-gudamj", mn: "Сакурагийн гудамж", en: "Sakura Street", year: 2024, genres: ["drama", "comedy"], hue: 340, age: "7+", country: "JP", runtime: 45, status: "completed", eps: [10], audio: ["ja"],
    synopsis: "Хуучны жижиг гудамжны гуанзыг өвлөж авсан залуу тогооч хөршүүдийнхээ түүхийг хоолоор дамжуулан сонсоно." },
  { type: "series", slug: "bosforiin-salkhi", mn: "Босфорын салхи", en: "Wind of the Bosphorus", year: 2025, genres: ["romance", "drama"], hue: 16, age: "13+", country: "TR", runtime: 120, status: "ongoing", eps: [20, 6], audio: ["tr"],
    synopsis: "Хоёр эргийн хоёр гэр бүлийн үр хүүхэд хуучны өс хонзонг үл харгалзан хамтдаа шинэ амьдрал эхлүүлэхийг оролдоно." },
  { type: "series", slug: "aldagdsan-ekspedits", mn: "Алдагдсан экспедиц", en: "The Lost Expedition", year: 2024, genres: ["mystery", "adventure"], hue: 150, age: "13+", country: "MN", runtime: 52, status: "completed", eps: [6],
    synopsis: "Зуун жилийн өмнө ор сураггүй болсон судалгааны багийн тэмдэглэл олдсоноор шинэ баг тэдний мөрөөр хөдөлнө." },
  { type: "series", slug: "ger-buliin-kherg", mn: "Гэр бүлийн хэрэг", en: "Family Business", year: 2023, genres: ["comedy"], hue: 44, age: "7+", country: "MN", runtime: 26, status: "completed", eps: [10, 10], tier: "free",
    synopsis: "Гурван ах дүү аавынхаа жижиг дэлгүүрийг хамтдаа авч явах гэж өдөр бүр шинэ маргаан, шинэ инээдэм үүсгэнэ." },
];

const DEMO_TITLES: Title[] = seeds.map((s, i) => ({
  id: `demo-${s.slug}`,
  type: s.type,
  slug: s.slug,
  titleMn: s.mn,
  titleEn: s.en,
  synopsisMn: s.synopsis,
  releaseYear: s.year,
  runtimeMinutes: s.runtime,
  ageRating: s.age,
  countryCode: s.country,
  airingStatus: s.status,
  accessTier: s.tier ?? "standard",
  genres: s.genres.map(genre),
  subtitleLanguages: s.subs ?? (i % 3 === 2 ? ["mn"] : ["mn", "en"]),
  audioLanguages: s.audio ?? (s.country === "JP" ? ["ja"] : ["mn"]),
  maxResolution: s.tier === "premium" ? 2160 : 1080,
  cast: [],
  directors: [],
  seasons: s.eps ? seasons(s.eps, s.year, s.runtime ?? 24) : [],
  addedAt: new Date(Date.UTC(2026, 9, 28 - i * 3)).toISOString(),
  featured: s.featured,
  hue: s.hue,
}));

export const demoRepository: CatalogRepository = {
  isDemo: true,
  async listTitles() {
    return DEMO_TITLES;
  },
  async getTitle(type, slug) {
    return DEMO_TITLES.find((t) => t.type === type && t.slug === slug) ?? null;
  },
  async listGenres() {
    return GENRES;
  },
};
