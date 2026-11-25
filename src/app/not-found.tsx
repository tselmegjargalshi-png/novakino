import type { Metadata } from "next";
import { EmptyState } from "@/components/content/EmptyState";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Хуудас олдсонгүй", robots: { index: false } };

// Rendered outside the (site) layout for unknown URLs, so it brings its own header and footer.
export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main" className="page flex min-h-[60vh] items-center py-16">
        <div className="mx-auto w-full max-w-xl">
          <EmptyState
            title="Хуудас олдсонгүй"
            body="Таны хайсан хуудас байхгүй эсвэл бүтээлийн эрхийн хугацаа дууссан байж магадгүй."
            action={
              <div className="flex flex-wrap justify-center gap-3">
                <ButtonLink href="/">Нүүр хуудас руу буцах</ButtonLink>
                <ButtonLink href="/search" variant="secondary">
                  Бүтээл хайх
                </ButtonLink>
              </div>
            }
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
