import clsx from "clsx";
import type { ReactNode } from "react";

export function Badge({ children, tone = "neutral", className }: { children: ReactNode; tone?: "neutral" | "accent" | "outline"; className?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex h-6 items-center rounded-md px-2 text-xs font-medium",
        tone === "neutral" && "bg-white/10 text-ink",
        tone === "accent" && "bg-violet/25 text-electric",
        tone === "outline" && "border border-white/25 text-ink",
        className,
      )}
    >
      {children}
    </span>
  );
}
