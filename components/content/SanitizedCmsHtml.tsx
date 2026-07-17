import { sanitizeCmsHtml, type CmsHtmlSanitizeOptions } from "@/lib/cms/sanitizeCmsRichText";

export function SanitizedCmsHtml({
  allowImages,
  className,
  html,
  internalLinkLabels,
  locale,
  minimumHeadingLevel,
}: {
  allowImages?: CmsHtmlSanitizeOptions["allowImages"];
  className?: string;
  html: string;
  internalLinkLabels?: CmsHtmlSanitizeOptions["internalLinkLabels"];
  locale?: CmsHtmlSanitizeOptions["locale"];
  minimumHeadingLevel?: CmsHtmlSanitizeOptions["minimumHeadingLevel"];
}) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(html, { allowImages, internalLinkLabels, locale, minimumHeadingLevel }) }} />;
}
