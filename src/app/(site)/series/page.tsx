import type { Metadata } from "next";
import { CatalogPage } from "@/components/content/CatalogPage";

export const metadata: Metadata = { title: "Цуврал", alternates: { canonical: "/series" } };

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <CatalogPage type="series" searchParams={await searchParams} />;
}
