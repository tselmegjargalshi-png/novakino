"use client";

import { Check, Plus } from "lucide-react";
import { buttonClass } from "@/components/ui/Button";
import { useWatchlist } from "@/lib/watchlist";

export function WatchlistButton({ itemKey, size = "lg" }: { itemKey: string; size?: "md" | "lg" }) {
  const { items, toggle } = useWatchlist();
  const saved = items?.includes(itemKey) ?? false;
  return (
    <button
      type="button"
      onClick={() => toggle(itemKey)}
      disabled={items === null}
      aria-pressed={saved}
      className={buttonClass("secondary", size)}
    >
      {saved ? <Check className="h-4 w-4 text-electric" /> : <Plus className="h-4 w-4" />}
      {saved ? "Жагсаалтад байгаа" : "Жагсаалтад нэмэх"}
    </button>
  );
}
