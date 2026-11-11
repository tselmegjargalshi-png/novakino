"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Title } from "@/lib/catalog/types";
import { useWatchlist } from "@/lib/watchlist";
import { ButtonLink } from "@/components/ui/Button";
import { ContentCard } from "./ContentCard";
import { EmptyState } from "./EmptyState";

export function MyList() {
  const { items, toggle } = useWatchlist();
  const [titles, setTitles] = useState<Title[] | null>(null);
  const [failed, setFailed] = useState(false);
  const keys = items?.join(",");

  useEffect(() => {
    if (keys === undefined) return;
    if (keys === "") {
      setTitles([]);
      return;
    }
    const ctrl = new AbortController();
    fetch(`/api/catalog/titles?keys=${encodeURIComponent(keys)}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { titles: Title[] }) => {
        setTitles(d.titles);
        setFailed(false);
      })
      .catch((e: Error) => e.name !== "AbortError" && setFailed(true));
    return () => ctrl.abort();
  }, [keys]);

  if (failed) return <EmptyState title="Жагсаалтыг ачаалж чадсангүй" body="Интернэт холболтоо шалгаад хуудсаа дахин ачаална уу." />;
  if (titles === null) {
    return (
      <ul className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6" aria-busy="true" aria-label="Ачаалж байна">
        {Array.from({ length: 6 }, (_, i) => (
          <li key={i} className="aspect-[2/3] animate-pulse rounded-card bg-surface" />
        ))}
      </ul>
    );
  }
  if (titles.length === 0) {
    return (
      <EmptyState
        title="Жагсаалт хоосон байна"
        body="Бүтээлийн хуудсан дээрх «Жагсаалтад нэмэх» товчийг дарж дараа үзэх бүтээлээ хадгалаарай."
        action={<ButtonLink href="/">Бүтээл үзэх</ButtonLink>}
      />
    );
  }
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {titles.map((t) => (
        <li key={t.id} className="relative">
          <ContentCard title={t} />
          <button
            type="button"
            onClick={() => toggle(`${t.type}/${t.slug}`)}
            aria-label={`${t.titleMn}: жагсаалтаас хасах`}
            className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-ink backdrop-blur transition hover:bg-violet"
          >
            <X className="h-4 w-4" />
          </button>
        </li>
      ))}
    </ul>
  );
}
