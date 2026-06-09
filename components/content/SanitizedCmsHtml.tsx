import { sanitizeCmsHtml, type CmsHtmlSanitizeOptions } from "@/lib/cms/sanitizeCmsRichText";

export function SanitizedCmsHtml({
  className,
  html,
  minimumHeadingLevel,
}: {
  className?: string;
  html: string;
  minimumHeadingLevel?: CmsHtmlSanitizeOptions["minimumHeadingLevel"];
}) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(html, { minimumHeadingLevel }) }} />;
}
