import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { site } from "@/lib/site";

// Links are grouped by purpose under a heading, so each column reads as one set.
const GROUPS = [
  {
    title: "Үзэх",
    links: [
      { href: "/movies", label: "Кино" },
      { href: "/anime", label: "Анимэ" },
      { href: "/series", label: "Цуврал" },
      { href: "/genres", label: "Төрөл" },
    ],
  },
  {
    title: "Миний",
    links: [
      { href: "/search", label: "Хайлт" },
      { href: "/my-list", label: "Миний жагсаалт" },
    ],
  },
];

const INFO = [
  { href: "/about", label: "Бидний тухай" },
  { href: "/contact", label: "Холбоо барих" },
  { href: "/terms", label: "Үйлчилгээний нөхцөл" },
  { href: "/privacy", label: "Нууцлалын бодлого" },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-white/5">
      <div className="page flex flex-col gap-8 py-10 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-muted">
            {site.name} дээрх бүх бүтээл албан ёсны түгээлтийн эрхтэйгээр нийтлэгдэнэ.
          </p>
        </div>
        <nav aria-label="Хөл хэсгийн цэс" className="grid grid-cols-2 gap-x-16 gap-y-8">
          {GROUPS.map((g) => (
            <div key={g.title}>
              <p className="text-xs uppercase tracking-[0.14em] text-ink/70">{g.title}</p>
              <ul className="mt-4 space-y-3 text-sm">
                {g.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-muted transition-colors hover:text-ink">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="page flex flex-col gap-3 border-t border-white/5 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} {site.name}. Бүх эрх хуулиар хамгаалагдсан.</p>
        <nav aria-label="Мэдээллийн хуудсууд">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {INFO.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition-colors hover:text-ink">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
