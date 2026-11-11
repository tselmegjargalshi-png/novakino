import type { Metadata } from "next";
import { MyList } from "@/components/content/MyList";

export const metadata: Metadata = { title: "Миний жагсаалт", robots: { index: false } };

export default function MyListPage() {
  return (
    <div className="page pt-8 sm:pt-12">
      <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Миний жагсаалт</h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
        Жагсаалт одоогоор зөвхөн энэ төхөөрөмж, энэ хөтөч дээр хадгалагдана.
      </p>
      <div className="mt-8">
        <MyList />
      </div>
    </div>
  );
}
