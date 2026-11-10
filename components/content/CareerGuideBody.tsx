import { SanitizedCmsHtml } from "@/components/content/SanitizedCmsHtml";
import type { CareerGuideDetailViewModel } from "@/lib/cms/career-guides";
import { renderSimpleMarkdown } from "@/lib/content/renderSimpleMarkdown";
import type { DisplayLocale } from "@/lib/i18n/locales";

export function CareerGuideBody({ guide, locale }: { guide: CareerGuideDetailViewModel; locale: DisplayLocale }) {
  const contentLocale = locale === "zh-TW" ? "zh" : locale;
  const bodyMd = stripDuplicateFirstHeading(guide.bodyMd, guide.title);

  if (guide.bodyHtml.trim()) {
    return <SanitizedCmsHtml html={guide.bodyHtml} locale={contentLocale} />;
  }

  if (bodyMd.trim()) {
    return renderSimpleMarkdown(bodyMd, {
      locale: contentLocale, headingIdPrefix: "career-guide-body", scrollableTables: true,
      ...(locale === "zh-TW" ? { scrollableTableLabel: "可橫向捲動的表格" } : {}),
    });
  }

  return null;
}

function stripDuplicateFirstHeading(markdown: string, title: string): string {
  const normalizedTitle = title.replace(/\s+/g, " ").trim();
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const firstContentIndex = lines.findIndex((line) => line.trim());

  if (firstContentIndex === -1) {
    return markdown;
  }

  const firstContentLine = lines[firstContentIndex] ?? "";
  const headingMatch = firstContentLine.match(/^#\s+(.+)$/);

  if (!headingMatch) {
    return markdown;
  }

  const headingText = headingMatch[1]?.replace(/\s+/g, " ").trim();
  if (headingText !== normalizedTitle) {
    return markdown;
  }

  lines.splice(firstContentIndex, 1);
  return lines.join("\n").trimStart();
}
