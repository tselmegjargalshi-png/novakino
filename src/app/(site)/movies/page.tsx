import type { Metadata } from "next";
import { CatalogPage } from "@/components/content/CatalogPage";

export const metadata: Metadata = { title: "Кино", alternates: { canonical: "/movies" } };

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <CatalogPage type="movie" searchParams={await searchParams} />;
}
