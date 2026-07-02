import {
  buildPublicSitemapEntries,
  buildPublicSitemapXml,
  fetchBackendPublicSitemapSource,
} from "@/lib/seo/publicSitemap";

export const dynamic = "force-dynamic";
export const revalidate = 300;

const SUCCESS_CACHE_CONTROL = "public, max-age=300, s-maxage=600, stale-while-revalidate=86400";
const FAILURE_CACHE_CONTROL = "public, max-age=60, s-maxage=60";

export async function GET(): Promise<Response> {
  try {
    const payload = await fetchBackendPublicSitemapSource();
    const entries = buildPublicSitemapEntries(payload);

    if (entries.length === 0) {
      throw new Error("Backend sitemap source returned no public sitemap entries.");
    }

    return new Response(buildPublicSitemapXml(entries), {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": SUCCESS_CACHE_CONTROL,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Public sitemap source unavailable.";
    return new Response(`Public sitemap source unavailable: ${message}\n`, {
      status: 503,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": FAILURE_CACHE_CONTROL,
      },
    });
  }
}
