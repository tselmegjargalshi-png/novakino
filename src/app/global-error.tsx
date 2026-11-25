"use client";

import "./globals.css";

// Last resort when the root layout itself fails. It must render its own <html> and <body>.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="mn">
      <body className="flex min-h-screen items-center justify-center px-4 text-center">
        <div>
          <h1 className="font-display text-2xl font-semibold">Алдаа гарлаа</h1>
          <p className="mt-3 text-sm text-muted">Сайтыг ачаалах үед алдаа гарлаа. Дахин оролдоно уу.</p>
          <div className="mt-6 flex justify-center gap-3">
            <button type="button" onClick={reset} className="h-10 rounded-full bg-violet px-5 text-sm font-medium text-white">
              Дахин оролдох
            </button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- the app shell is broken here, so use a full reload */}
            <a href="/" className="inline-flex h-10 items-center rounded-full border border-white/10 px-5 text-sm">
              Нүүр хуудас
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
