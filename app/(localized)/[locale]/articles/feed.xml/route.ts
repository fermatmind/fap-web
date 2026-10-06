import { getPublicArticleFeed, serializeArticleAtom, ARTICLE_FEED_TYPE } from "@/lib/cms/articleFeed";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, follow" };

export async function GET(request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "en" && locale !== "zh") return new Response("Not found", { status: 404, headers });
  if (new URL(request.url).search) return new Response("Feed filters are unavailable", { status: 400, headers });
  try {
    const articles = await getPublicArticleFeed(locale);
    return new Response(serializeArticleAtom(locale, articles), {
      headers: { ...headers, "Content-Type": `${ARTICLE_FEED_TYPE}; charset=utf-8` },
    });
  } catch {
    return new Response(locale === "zh" ? "订阅源暂时不可用，请稍后重试。" : "Feed temporarily unavailable. Please retry later.", {
      status: 503, headers: { ...headers, "Retry-After": "60", "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
