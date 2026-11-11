import type { MetadataRoute } from "next";
import { getTitles } from "@/lib/catalog";
import { titleHref } from "@/lib/catalog/query";
import { site } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const titles = await getTitles();
  return [
    ...["", "/movies", "/anime", "/series", "/genres"].map((p) => ({ url: `${site.url}${p}`, changeFrequency: "daily" as const })),
    ...titles.map((t) => ({ url: `${site.url}${titleHref(t)}`, lastModified: t.addedAt, changeFrequency: "weekly" as const })),
  ];
}
