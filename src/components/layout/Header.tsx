"use client";

import clsx from "clsx";
import { Bookmark, Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/Logo";

const NAV = [
  { href: "/", label: "Нүүр", match: (p: string) => p === "/" },
  { href: "/movies", label: "Кино", match: (p: string) => p.startsWith("/movie") },
  { href: "/anime", label: "Анимэ", match: (p: string) => p.startsWith("/anime") },
  { href: "/series", label: "Цуврал", match: (p: string) => p.startsWith("/series") },
  { href: "/genres", label: "Төрөл", match: (p: string) => p.startsWith("/genres") },
  { href: "/my-list", label: "Миний жагсаалт", match: (p: string) => p.startsWith("/my-list") },
];

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
    <header
      className={clsx(
        "sticky top-0 z-50 h-[var(--np-header-h)] transition-colors duration-300",
        scrolled || open ? "border-b border-white/5 bg-bg/85 backdrop-blur-xl" : "bg-gradient-to-b from-black/60 to-transparent",
      )}
    >
      <div className="page flex h-full items-center gap-8">
        <Link href="/" aria-label="NOVAPLAY нүүр хуудас" className="shrink-0">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Үндсэн цэс">
          {NAV.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "relative rounded-full px-3.5 py-2 text-sm transition-colors",
                  active ? "text-ink" : "text-muted hover:text-ink",
                )}
              >
                {item.label}
                {active && <span className="absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded-full bg-electric" />}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Link href="/search" aria-label="Хайлт" className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink transition hover:bg-white/10">
            <Search className="h-5 w-5" strokeWidth={1.75} />
          </Link>
          <Link href="/my-list" aria-label="Миний жагсаалт" className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink transition hover:bg-white/10 lg:hidden">
            <Bookmark className="h-5 w-5" strokeWidth={1.75} />
          </Link>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Цэс хаах" : "Цэс нээх"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink transition hover:bg-white/10 lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

    </header>
      {open && (
        <nav id="mobile-nav" aria-label="Гар утасны цэс" className="fixed inset-0 z-40 overflow-y-auto bg-bg/95 pt-[calc(var(--np-header-h)+48px)] backdrop-blur-xl lg:hidden">
          <ul className="page py-4">
            {NAV.map((item) => {
              const active = item.match(pathname);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={clsx("flex h-14 items-center border-b border-white/5 font-display text-lg", active ? "text-electric" : "text-ink")}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
            <li>
              <Link href="/search" className="flex h-14 items-center font-display text-lg text-ink">
                Хайлт
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </>
  );
}
