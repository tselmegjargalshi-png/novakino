import { describe, expect, it } from "vitest";
import { demoRepository } from "@/lib/catalog/demo";
import { availableYears, matchesSearch, parseCatalogParams, queryTitles, relatedTitles, titleHref } from "@/lib/catalog/query";

const titles = await demoRepository.listTitles();

describe("catalog query", () => {
  it("filters by type, genre, year and status", () => {
    expect(queryTitles(titles, { type: "anime" }).every((t) => t.type === "anime")).toBe(true);
    expect(queryTitles(titles, { type: "anime", status: "upcoming" }).map((t) => t.slug)).toEqual(["shidet-tsetserleg"]);
    expect(queryTitles(titles, { genre: "documentary" })).toHaveLength(1);
    expect(queryTitles(titles, { year: 2023 }).every((t) => t.releaseYear === 2023)).toBe(true);
  });

  it("searches Mongolian and English titles, genres and years, case insensitive", () => {
    expect(queryTitles(titles, { q: "ГОВИЙН" }).map((t) => t.slug)).toEqual(["goviin-suuder"]);
    expect(queryTitles(titles, { q: "last train" }).map((t) => t.slug)).toEqual(["suulchiin-galt-tereg"]);
    expect(queryTitles(titles, { q: "исэкай" })).toHaveLength(1);
    expect(matchesSearch(titles[0], "тэнгэрийн 2026")).toBe(true);
    expect(queryTitles(titles, { q: "zzzz" })).toHaveLength(0);
  });

  it("sorts", () => {
    const byYear = queryTitles(titles, { sort: "year" }).map((t) => t.releaseYear ?? 0);
    expect(byYear).toEqual([...byYear].sort((a, b) => b - a));
    const newest = queryTitles(titles, {}).map((t) => t.addedAt);
    expect(newest).toEqual([...newest].sort().reverse());
  });

  it("builds SEO friendly paths", () => {
    expect(titleHref({ type: "movie", slug: "a-b" })).toBe("/movie/a-b");
    expect(titleHref({ type: "anime", slug: "a" })).toBe("/anime/a");
    expect(titleHref({ type: "series", slug: "a" })).toBe("/series/a");
  });

  it("rejects malformed params", () => {
    expect(parseCatalogParams({ year: "abc", sort: "drop table", status: "x", type: "y" })).toEqual({
      q: undefined, genre: undefined, year: undefined, sort: undefined, status: undefined, type: undefined,
    });
    expect(parseCatalogParams({ year: "2025", sort: "title", q: "x".repeat(200) }).q).toHaveLength(80);
  });

  it("relates titles by shared genres and never returns the title itself", () => {
    const target = titles.find((t) => t.slug === "od-tuugch")!;
    const related = relatedTitles(titles, target);
    expect(related.length).toBeGreaterThan(0);
    expect(related.some((t) => t.id === target.id)).toBe(false);
  });

  it("demo data is consistent", () => {
    expect(new Set(titles.map((t) => t.slug)).size).toBe(titles.length);
    expect(titles.filter((t) => t.type === "movie").every((t) => t.seasons.length === 0)).toBe(true);
    expect(availableYears(titles)[0]).toBe(2027);
  });
});
