import type { ReactNode } from "react";
import { LogoMark } from "@/components/brand/Logo";

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-card border border-dashed border-line px-6 py-16 text-center">
      <LogoMark className="h-10 w-10 opacity-60" />
      <h2 className="mt-5 font-display text-lg font-semibold">{title}</h2>
      {body && <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">{body}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
