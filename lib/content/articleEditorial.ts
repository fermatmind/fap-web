import type { CmsArticle } from "@/lib/cms/articles";
import type { DisplayLocale } from "@/lib/i18n/locales";

function plainText(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/https?:\/\/[^\s)]+/g, " ")
    .replace(/&(?:#\w+|\w+);/g, " ");
}

export function editorialReadingMinutes(body: string, locale: DisplayLocale) {
  const prose = plainText(body.replace(/^```[^\n]*\n[\s\S]*?^```\s*$/gm, "")
    .replace(/^:::[^\n]*|^\s*(?:tag|tone|title|body|bad_label|good_label|bad|good):\s*/gm, ""));
  const units = locale === "en"
    ? prose.match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu)
    : prose.match(/\p{Script=Han}/gu);
  return Math.max(1, Math.ceil((units?.length ?? 0) / (locale === "en" ? 220 : 450)));
}

export function editorialDeck(value: string, locale: DisplayLocale) {
  const text = plainText(value).replace(/\s+/g, " ").trim();
  return new Intl.Segmenter(locale, { granularity: "sentence" }).segment(text)[Symbol.iterator]().next().value?.segment.trim() ?? "";
}

export function editorialScope(markdown: string) {
  for (const paragraph of markdown.split(/\n\s*\n/).slice(0, 10)) {
    const line = paragraph.trim().replace(/^>\s*/, "").replaceAll("**", "");
    const labeled = line.match(/^(?:Scope|适用范围|適用範圍)\s*[:：]\s*([^\n。]+?)(?:[。]|\.(?=\s|$)|$)/iu);
    if (labeled) return labeled[1].trim();
    const mainlandExample = line.match(/^(?:以下[适適]用|本文[适適]用)([^。\n]{2,80})/u);
    if (mainlandExample) return mainlandExample[1].trim();
    if (/^本文以.{2,24}為情境，引用[^。\n]{2,65}(?:法|稅|規範)/u.test(line)) return line.split("。")[0];
  }
  return undefined;
}

export function editorialRelated(
  article: Pick<CmsArticle, "slug" | "category">,
  items: CmsArticle[],
  locale: DisplayLocale,
  now = Date.now(),
) {
  const seen = new Set([article.slug]);
  const category = article.category?.slug;
  if (!category) return [];
  const result: CmsArticle[] = [];
  for (const item of items) {
    if (seen.has(item.slug) || item.locale !== (locale === "zh" ? "zh-CN" : locale)
      || item.category?.slug !== category || item.status !== "published" || !item.isPublic
      || !item.publishedRevisionId || (item.publishedAt && Date.parse(item.publishedAt) > now)
      || (item.scheduledAt && Date.parse(item.scheduledAt) > now)) continue;
    seen.add(item.slug);
    result.push(item);
    if (result.length === 5) break;
  }
  return result;
}
