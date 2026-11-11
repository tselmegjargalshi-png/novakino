import type { Metadata } from "next";
import { CatalogPage } from "@/components/content/CatalogPage";

export const metadata: Metadata = { title: "Анимэ", alternates: { canonical: "/anime" } };

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <CatalogPage type="anime" searchParams={await searchParams} />;
}
