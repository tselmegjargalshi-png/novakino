import { LegalPage, legalMetadata } from "@/components/content/LegalPage";
import { legal } from "@/lib/legal";
import { site } from "@/lib/site";

export const metadata = legalMetadata("Нууцлалын бодлого", "/privacy", `${site.name} таны мэдээллийг хэрхэн цуглуулж, ашигладаг тухай.`);

// Draft structure only. Facts about current behaviour are accurate as of this commit; TODOs need the owner.
export default function PrivacyPage() {
  return (
    <LegalPage title="Нууцлалын бодлого" updated={legal.updated}>
      <p>
        {legal.company} нь {site.name} хэрэглэгчдийн хувийн мэдээллийг Монгол Улсын Хүний хувийн мэдээлэл хамгаалах тухай хуульд нийцүүлэн
        хамгаална.
      </p>
      <h2>1. Одоо цуглуулж буй мэдээлэл</h2>
      <ul>
        <li>
          &quot;Миний жагсаалт&quot; болон сүүлд хайсан үгс зөвхөн таны төхөөрөмжийн хөтөч дээр (localStorage) хадгалагдана, манай серверт
          илгээгдэхгүй.
        </li>
        <li>Хостинг үйлчилгээ (Vercel) техникийн лог болон нэргүй хандалтын статистик бүртгэж болно.</li>
        <li>[TODO: Бүртгэл, төлбөр нэмэгдэх үед цуглуулах мэдээлэл (имэйл, утас, төлбөрийн түүх).]</li>
      </ul>
      <h2>2. Мэдээллийг ашиглах зорилго</h2>
      <p>[TODO: Үйлчилгээ үзүүлэх, санал болгох, төлбөр тооцоо, хууль ёсны шаардлага.]</p>
      <h2>3. Гуравдагч этгээд</h2>
      <p>[TODO: Хостинг (Vercel), өгөгдлийн сан (Supabase), видео провайдер, төлбөрийн үйлчилгээ.]</p>
      <h2>4. Таны эрх</h2>
      <p>[TODO: Мэдээллээ харах, засах, устгуулах хүсэлт гаргах журам.]</p>
      <h2>5. Холбоо барих</h2>
      <p>Нууцлалтай холбоотой асуудлаар {legal.email} хаягаар хандана уу.</p>
    </LegalPage>
  );
}
