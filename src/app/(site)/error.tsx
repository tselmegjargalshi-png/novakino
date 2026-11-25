"use client";

import { useEffect } from "react";
import { EmptyState } from "@/components/content/EmptyState";
import { Button, ButtonLink } from "@/components/ui/Button";

// Errors inside a page keep the site header and footer, so visitors can still navigate away.
export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => console.error(error), [error]);
  return (
    <div className="page flex min-h-[60vh] items-center py-16">
      <div className="mx-auto w-full max-w-xl">
        <EmptyState
          title="Алдаа гарлаа"
          body="Хуудсыг ачаалах үед алдаа гарлаа. Дахин оролдоно уу."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Button onClick={reset}>Дахин оролдох</Button>
              <ButtonLink href="/" variant="secondary">
                Нүүр хуудас
              </ButtonLink>
            </div>
          }
        />
        {error.digest && <p className="mt-4 text-center text-xs text-muted">Алдааны код: {error.digest}</p>}
      </div>
    </div>
  );
}
