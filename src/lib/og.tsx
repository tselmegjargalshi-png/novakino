import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getTitle } from "@/lib/catalog";
import type { ContentType } from "@/lib/catalog/types";
import { typeLabel } from "@/lib/i18n/mn";
import { site } from "@/lib/site";

/** Social share cards (Facebook, Messenger, X). 1200x630 is what every network expects. */
export const ogSize = { width: 1200, height: 630 };

const MARK =
  "M16 1C17.500 9 23 14.500 31 16C23 17.500 17.500 23 16 31C14.500 23 9 17.500 1 16C9 14.500 14.500 9 16 1ZM13.400 11.600v8.800l7.400-4.400Z";

async function fonts() {
  // Unbounded latin + cyrillic subsets merged into one file per weight (OFL licensed).
  // Ө ө Ү ү are added by scripts/add-mongolian-glyphs.py, since Unbounded ships without them.
  const dir = join(process.cwd(), "src/assets/fonts");
  const [regular, bold] = await Promise.all([readFile(join(dir, "unbounded-400.woff")), readFile(join(dir, "unbounded-600.woff"))]);
  return [
    { name: "Unbounded", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "Unbounded", data: bold, weight: 600 as const, style: "normal" as const },
  ];
}

function Card({ eyebrow, title, subtitle, image }: { eyebrow: string; title: string; subtitle?: string; image?: string }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: "#05050A",
        fontFamily: "Unbounded",
        color: "#F2F4FA",
      }}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element -- rendered by Satori, not the browser
        <img src={image} alt="" width={1200} height={630} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backgroundImage: "linear-gradient(135deg, #001275 0%, #05050A 45%, #05050A 70%, #00352a 100%)",
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          backgroundImage: "linear-gradient(90deg, rgba(5,5,10,0.95) 0%, rgba(5,5,10,0.6) 55%, rgba(5,5,10,0.15) 100%)",
        }}
      />
      <svg viewBox="0 0 32 32" width={300} height={300} style={{ position: "absolute", right: 70, top: 165, opacity: image ? 0 : 0.35 }}>
        <defs>
          <linearGradient id="m" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00FFA3" />
            <stop offset="0.55" stopColor="#00A8FF" />
            <stop offset="1" stopColor="#1A3DFF" />
          </linearGradient>
        </defs>
        <path fill="url(#m)" fillRule="evenodd" d={MARK} />
      </svg>
      <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px", width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <svg viewBox="0 0 32 32" width={52} height={52}>
            <defs>
              <linearGradient id="l" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
                <stop stopColor="#00FFA3" />
                <stop offset="0.55" stopColor="#00A8FF" />
                <stop offset="1" stopColor="#1A3DFF" />
              </linearGradient>
            </defs>
            <path fill="url(#l)" fillRule="evenodd" d={MARK} />
          </svg>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 600, letterSpacing: 1.5 }}>
            NOVA<span style={{ color: "#00FFA3" }}>PLAY</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 820 }}>
          <div style={{ display: "flex", fontSize: 24, fontWeight: 600, color: "#00FFA3", letterSpacing: 4, textTransform: "uppercase" }}>{eyebrow}</div>
          <div style={{ display: "flex", marginTop: 18, fontSize: title.length > 28 ? 58 : 72, fontWeight: 600, lineHeight: 1.1 }}>{title}</div>
          {subtitle && <div style={{ display: "flex", marginTop: 24, fontSize: 26, color: "rgba(242,244,250,0.78)", lineHeight: 1.4 }}>{subtitle}</div>}
        </div>
      </div>
    </div>
  );
}

export async function siteOgImage() {
  return new ImageResponse(<Card eyebrow="Кино · Анимэ · Цуврал" title={site.tagline} subtitle="Албан ёсны эрхтэй, монгол хадмалтай" />, {
    ...ogSize,
    fonts: await fonts(),
  });
}

export async function titleOgImage(type: ContentType, slug: string) {
  const t = await getTitle(type, slug);
  if (!t) return siteOgImage();
  const subtitle = [t.releaseYear, t.genres.slice(0, 2).map((g) => g.nameMn).join(", ")].filter(Boolean).join(" · ");
  return new ImageResponse(<Card eyebrow={typeLabel[t.type]} title={t.titleMn} subtitle={subtitle || undefined} image={t.backdropUrl ?? t.posterUrl} />, {
    ...ogSize,
    fonts: await fonts(),
  });
}
