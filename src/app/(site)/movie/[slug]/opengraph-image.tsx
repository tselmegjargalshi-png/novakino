import { ogSize, titleOgImage } from "@/lib/og";

export const alt = "NOVAPLAY";
export const size = ogSize;
export const contentType = "image/png";
export const revalidate = 300;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  return titleOgImage("movie", (await params).slug);
}
