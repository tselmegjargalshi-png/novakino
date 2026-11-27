import clsx from "clsx";
import { Fragment, type ReactNode } from "react";

/**
 * A row of facts separated by a dot, so neighbouring values read as separate
 * items instead of one run-on sentence ("2026 · Драм · 2 ц 8 мин").
 */
export function MetaList({ items, className }: { items: ReactNode[]; className?: string }) {
  const shown = items.filter((x) => x !== null && x !== undefined && x !== false && x !== "");
  if (shown.length === 0) return null;
  return (
    <span className={clsx("inline-flex flex-wrap items-center gap-x-2 gap-y-1", className)}>
      {shown.map((m, i) => (
        <Fragment key={i}>
          {i > 0 && (
            <span aria-hidden="true" className="text-muted/60">
              ·
            </span>
          )}
          <span>{m}</span>
        </Fragment>
      ))}
    </span>
  );
}
