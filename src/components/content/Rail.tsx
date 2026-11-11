"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

/** Horizontally scrolling row. Touch scroll on phones, arrow buttons on desktop. */
export function Rail({ title, href, children }: { title: string; href?: string; children: ReactNode }) {
  const ref = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 });
  }, []);

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update]);

  const scroll = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.85, behavior: "smooth" });

  return (
    <section className="mt-10 sm:mt-14" aria-label={title}>
      <div className="page flex items-end justify-between gap-4">
        <h2 className="font-display text-lg font-semibold tracking-tight sm:text-xl">{title}</h2>
        <div className="flex items-center gap-2">
          {href && (
            <Link href={href} className="mr-1 text-sm text-muted transition-colors hover:text-electric">
              Бүгдийг үзэх
            </Link>
          )}
          <button
            type="button"
            onClick={() => scroll(-1)}
            disabled={edges.start}
            aria-label={`${title}: өмнөх`}
            className="hidden h-9 w-9 items-center justify-center rounded-full border border-line text-ink transition hover:border-electric disabled:opacity-30 md:inline-flex"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            disabled={edges.end}
            aria-label={`${title}: дараах`}
            className="hidden h-9 w-9 items-center justify-center rounded-full border border-line text-ink transition hover:border-electric disabled:opacity-30 md:inline-flex"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <ul
        ref={ref}
        onScroll={update}
        className="no-scrollbar mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-2 pt-1 sm:gap-4 sm:scroll-px-8 sm:px-8 lg:scroll-px-12 lg:px-12 min-[1536px]:scroll-px-[calc((100vw-1440px)/2+48px)] min-[1536px]:px-[calc((100vw-1440px)/2+48px)]"
      >
        {children}
      </ul>
    </section>
  );
}

export function RailItem({ children }: { children: ReactNode }) {
  return <li className="w-[42vw] shrink-0 snap-start sm:w-[27vw] md:w-[21vw] lg:w-[190px] xl:w-[204px]">{children}</li>;
}
