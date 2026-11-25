// Working brand. Change here when the final brand is approved.
export const site = {
  name: "NOVAPLAY",
  tagline: "Кино, анимэ, цуврал нэг дор",
  description:
    "NOVAPLAY бол албан ёсны эрхтэй кино, анимэ, цувралыг монгол хадмалтай үзүүлэх стриминг платформ.",
  url: siteUrl(),
};

/**
 * Canonical origin for links, sitemap and share images. NEXT_PUBLIC_SITE_URL wins;
 * on Vercel we fall back to the project's production domain (e.g. novaplay.space)
 * so canonical URLs never point at localhost.
 */
function siteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}
