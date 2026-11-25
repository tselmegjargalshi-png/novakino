import type { Metadata } from "next";
import type { ReactNode } from "react";
import { legal } from "@/lib/legal";

/** Info pages stay out of search results until the owner approves the final text (legal.draft = false). */
export function legalMetadata(title: string, path: string, description: string): Metadata {
  return { title, description, alternates: { canonical: path }, robots: legal.draft ? { index: false, follow: true } : undefined };
}

export function LegalPage({ title, updated, children }: { title: string; updated?: string; children: ReactNode }) {
  return (
    <article className="page max-w-3xl pt-8 sm:pt-12">
      {legal.draft && (
        <p role="note" className="mb-8 rounded-card border border-electric/40 bg-electric/5 px-4 py-3 text-sm text-ink/90">
          Энэ хуудас төслийн хувилбар байна. Эцсийн агуулгыг хууль зүйн зөвлөхөөр хянуулсны дараа нийтэлнэ.
        </p>
      )}
      <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
      {updated && <p className="mt-3 text-sm text-muted">Сүүлд шинэчилсэн: {updated}</p>}
      <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-ink/85 [&_a]:text-electric [&_a]:underline [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-2">
        {children}
      </div>
    </article>
  );
}
