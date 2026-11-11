import type { Metadata } from "next";
import { DetailPage, detailMetadata } from "@/components/content/DetailPage";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 300;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return detailMetadata("movie", (await params).slug);
}

export default async function Page({ params }: Props) {
  return <DetailPage type="movie" slug={(await params).slug} />;
}
