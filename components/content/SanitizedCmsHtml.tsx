import { sanitizeCmsHtml, type CmsHtmlSanitizeOptions } from "@/lib/cms/sanitizeCmsRichText";

export function SanitizedCmsHtml({
  className,
  html,
  internalLinkLabels,
  locale,
  minimumHeadingLevel,
}: {
  className?: string;
  html: string;
  internalLinkLabels?: CmsHtmlSanitizeOptions["internalLinkLabels"];
  locale?: CmsHtmlSanitizeOptions["locale"];
  minimumHeadingLevel?: CmsHtmlSanitizeOptions["minimumHeadingLevel"];
}) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(html, { internalLinkLabels, locale, minimumHeadingLevel }) }} />;
}
