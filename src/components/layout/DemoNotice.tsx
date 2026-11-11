/** Shown only while the site runs on placeholder data instead of licensed titles. */
export function DemoNotice() {
  return (
    <div className="border-b border-violet/30 bg-deep/60 text-center text-xs text-ink/90">
      <p className="page py-2">
        Жишээ каталог: эдгээр нь загварын зориулалттай зохиомол бүтээлүүд. Лицензтэй контент оруулсны дараа автоматаар солигдоно.
      </p>
    </div>
  );
}
