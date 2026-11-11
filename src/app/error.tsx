"use client";

import { EmptyState } from "@/components/content/EmptyState";
import { Button } from "@/components/ui/Button";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl items-center px-4">
      <div className="w-full">
        <EmptyState title="Алдаа гарлаа" body="Хуудсыг ачаалах үед алдаа гарлаа. Дахин оролдоно уу." action={<Button onClick={reset}>Дахин оролдох</Button>} />
      </div>
    </main>
  );
}
