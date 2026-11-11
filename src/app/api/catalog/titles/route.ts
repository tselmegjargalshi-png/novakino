import { NextResponse, type NextRequest } from "next/server";
import { getTitles } from "@/lib/catalog";
import { queryTitles } from "@/lib/catalog/query";

/**
 * Public, read only catalog lookup used by search autocomplete (?q=) and the
 * device local watchlist (?keys=type/slug,...). Returns published titles only.
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const q = sp.get("q")?.slice(0, 80);
  const keys = sp.get("keys")?.slice(0, 6000).split(",").filter(Boolean).slice(0, 100);
  const limit = Math.min(Math.max(Number(sp.get("limit")) || 20, 1), 100);
  if (!q && !keys) return NextResponse.json({ error: "q or keys is required" }, { status: 400 });

  const all = await getTitles();
  const titles = keys
    ? keys.flatMap((k) => all.find((t) => `${t.type}/${t.slug}` === k) ?? [])
    : queryTitles(all, { q }).slice(0, limit);

  return NextResponse.json(
    { titles: titles.map((t) => ({ ...t, seasons: [], cast: [], directors: [] })) },
    { headers: { "Cache-Control": "public, max-age=60, s-maxage=300" } },
  );
}
