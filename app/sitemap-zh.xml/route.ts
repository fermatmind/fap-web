import { buildSitemapXml, loadSitemapSource } from "@/lib/seo/sitemap";
import { canonicalUrl } from "@/lib/site";

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const items = await loadSitemapSource("zh", origin);

  const urls = [
    { loc: canonicalUrl("/zh") },
    { loc: canonicalUrl("/zh/tests") },
    ...items
      .filter((item) => item.is_indexable !== false)
      .map((item) => ({
        loc: canonicalUrl(`/zh/tests/${item.slug}`),
        lastmod: item.lastmod,
      })),
  ];

  const xml = buildSitemapXml(urls);
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
