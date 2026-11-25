import { LegalPage, legalMetadata } from "@/components/content/LegalPage";
import { legal } from "@/lib/legal";

export const metadata = legalMetadata("Холбоо барих", "/contact", "Тусламж, санал хүсэлт, эрх эзэмшигчдэд зориулсан холбоо барих мэдээлэл.");

export default function ContactPage() {
  return (
    <LegalPage title="Холбоо барих">
      <p>Асуулт, санал хүсэлт, техникийн асуудлаар доорх сувгаар холбогдоно уу.</p>
      <ul>
        <li>Имэйл: {legal.email}</li>
        <li>Утас: {legal.phone}</li>
        <li>Хаяг: {legal.address}</li>
      </ul>
      <h2>Зохиогчийн эрх эзэмшигчдэд</h2>
      <p>
        Хэрэв манай сайт дээрх бүтээл таны эрхийг зөрчсөн гэж үзвэл бүтээлийн нэр, холбоос, эрхийг нотлох баримттайгаар {legal.email}{" "}
        хаягаар мэдэгдэнэ үү. Бид [TODO: хариу өгөх хугацаа] дотор хянаж хариу өгнө.
      </p>
    </LegalPage>
  );
}
