import clsx from "clsx";
import Image from "next/image";
import type { Title } from "@/lib/catalog/types";
import { typeLabel } from "@/lib/i18n/mn";
import { LogoMark } from "@/components/brand/Logo";

type ArtTitle = Pick<Title, "titleMn" | "type" | "hue" | "posterUrl" | "backdropUrl">;

/**
 * Generated brand artwork used when a title has no licensed image yet.
 * The title's hue is folded into the palette's royal blue to cyan mint range
 * (hue 155 to 235) so every poster stays on brand but still looks distinct.
 */
export function generatedBackground(hue: number): string {
  const h = 155 + Math.round((((hue % 360) + 360) % 360) * (80 / 360));
  return [
    `radial-gradient(120% 85% at 15% 0%, hsl(${h} 95% 45% / 0.8), transparent 60%)`,
    `radial-gradient(90% 70% at 100% 100%, hsl(231 100% 45% / 0.75), transparent 58%)`,
    `radial-gradient(60% 50% at 80% 10%, hsl(158 100% 50% / 0.35), transparent 70%)`,
    "#0b0c16",
  ].join(", ");
}

export function Poster({ title, sizes, priority }: { title: ArtTitle; sizes: string; priority?: boolean }) {
  if (title.posterUrl) {
    return (
      <Image src={title.posterUrl} alt={`${title.titleMn} постер`} fill sizes={sizes} priority={priority} className="object-cover" />
    );
  }
  return (
    <div className="absolute inset-0" style={{ background: generatedBackground(title.hue) }} aria-hidden="true">
      <div className="starfield absolute inset-0 opacity-70" />
      <LogoMark className="absolute -right-6 -top-6 h-28 w-28 opacity-20 mix-blend-screen" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
      <div className="absolute inset-x-3 bottom-3">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/70">{typeLabel[title.type]}</p>
        <p className="mt-1 font-display text-[15px] font-semibold leading-tight text-white [text-wrap:balance]">{title.titleMn}</p>
      </div>
    </div>
  );
}

export function Backdrop({ title, priority, className }: { title: ArtTitle; priority?: boolean; className?: string }) {
  return (
    <div className={clsx("absolute inset-0 overflow-hidden", className)} aria-hidden="true">
      {title.backdropUrl ? (
        <Image src={title.backdropUrl} alt="" fill sizes="100vw" priority={priority} className="object-cover" />
      ) : (
        <div className="absolute inset-0" style={{ background: generatedBackground(title.hue) }}>
          <div className="starfield absolute inset-0" />
          <LogoMark className="absolute right-[6%] top-[14%] h-[52%] w-auto opacity-25 mix-blend-screen" />
        </div>
      )}
    </div>
  );
}
