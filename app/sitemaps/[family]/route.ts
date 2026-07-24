import {
  buildPublicSitemapResponse,
  resolvePublicSitemapFamilySegment,
} from "@/lib/seo/publicSitemap";

export const dynamic = "force-dynamic";
export const revalidate = 300;

type SitemapFamilyRouteContext = {
  params: Promise<{ family: string }>;
};

export async function GET(_request: Request, context: SitemapFamilyRouteContext): Promise<Response> {
  const { family: segment } = await context.params;
  const family = resolvePublicSitemapFamilySegment(segment);

  if (!family) {
    return new Response("Unknown sitemap family.\n", {
      status: 404,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    });
  }

  return buildPublicSitemapResponse(family);
}
