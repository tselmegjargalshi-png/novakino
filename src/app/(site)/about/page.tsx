import Link from "next/link";
import { LegalPage, legalMetadata } from "@/components/content/LegalPage";
import { site } from "@/lib/site";

export const metadata = legalMetadata("Бидний тухай", "/about", `${site.name} гэж юу вэ, бид хэрхэн ажилладаг тухай.`);

export default function AboutPage() {
  return (
    <LegalPage title="Бидний тухай">
      <p>
        {site.name} бол кино, анимэ, цувралыг монгол хадмалтай, албан ёсны түгээлтийн эрхтэйгээр үзүүлэх стриминг платформ юм. Бид
        каталогт оруулах бүтээл бүрийн Монгол дахь түгээлтийн эрхийг баталгаажуулсны дараа л нийтэлдэг.
      </p>
      <h2>Бидний зорилго</h2>
      <p>[TODO: Компанийн зорилго, үүсгэн байгуулсан түүх, багийн тухай 2 3 өгүүлбэр.]</p>
      <h2>Эрх ба түншлэл</h2>
      <p>[TODO: Хамтран ажилладаг студи, дистрибьютерүүд. Нийтэд зарлах боломжтой эсэхийг шалгана уу.]</p>
      <h2>Холбоо барих</h2>
      <p>
        Санал хүсэлт, хамтын ажиллагааны асуудлаар <Link href="/contact">холбоо барих</Link> хуудсаар хандана уу.
      </p>
    </LegalPage>
  );
}
