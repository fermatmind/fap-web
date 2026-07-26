import {
  buildPublicSitemapEntries,
  buildPublicSitemapXml,
  fetchBackendPublicSitemapSource,
} from "@/lib/seo/publicSitemap";

export const dynamic = "force-dynamic";

const CACHE_CONTROL = "private, no-store, max-age=0, must-revalidate";

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
        "Cache-Control": CACHE_CONTROL,
        "CDN-Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Public sitemap source unavailable.";
    return new Response(`Public sitemap source unavailable: ${message}\n`, {
      status: 503,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": CACHE_CONTROL,
        "CDN-Cache-Control": "no-store",
      },
    });
  }
}
