import { EmptyState } from "@/components/content/EmptyState";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl items-center px-4">
      <div className="w-full">
        <EmptyState title="Хуудас олдсонгүй" body="Таны хайсан хуудас байхгүй эсвэл бүтээлийн эрхийн хугацаа дууссан байж магадгүй." action={<ButtonLink href="/">Нүүр хуудас руу буцах</ButtonLink>} />
      </div>
    </main>
  );
}
