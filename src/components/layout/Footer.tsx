import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { site } from "@/lib/site";

const LINKS = [
  { href: "/movies", label: "Кино" },
  { href: "/anime", label: "Анимэ" },
  { href: "/series", label: "Цуврал" },
  { href: "/genres", label: "Төрөл" },
  { href: "/search", label: "Хайлт" },
  { href: "/my-list", label: "Миний жагсаалт" },
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
        <nav aria-label="Хөл хэсгийн цэс">
          <ul className="grid grid-cols-2 gap-x-10 gap-y-3 text-sm sm:grid-cols-3">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-muted transition-colors hover:text-ink">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
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
