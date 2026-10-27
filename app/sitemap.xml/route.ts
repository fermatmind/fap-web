import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { appendFriendshipSitemapEntries } from "@/lib/friendship/sitemap";
import {
  buildPublicSitemapEntries,
  buildPublicSitemapXml,
  buildPublicSitemapXmlResponse,
  fetchBackendPublicSitemapSource,
} from "@/lib/seo/publicSitemap";

export const dynamic = "force-dynamic";

const CACHE_CONTROL = "private, no-store, max-age=0, must-revalidate";

export async function GET(request?: Request): Promise<Response> {
  try {
    const payload = await fetchBackendPublicSitemapSource();
    const entries = buildPublicSitemapEntries(payload);

    if (entries.length === 0) {
      throw new Error("Backend sitemap source returned no public sitemap entries.");
    }

    return await buildPublicSitemapXmlResponse(
      buildPublicSitemapXml(appendFriendshipSitemapEntries(appendFunSitemapEntries(entries))),
      { "Cache-Control": CACHE_CONTROL, "CDN-Cache-Control": "no-store" },
      request,
    );
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
