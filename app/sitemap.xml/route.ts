import { buildSitemapIndexXml } from "@/lib/seo/sitemap";
import { canonicalUrl } from "@/lib/site";

export async function GET() {
  const xml = buildSitemapIndexXml([canonicalUrl("/sitemap-en.xml"), canonicalUrl("/sitemap-zh.xml")]);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
