import { sanitizeCmsHtml } from "@/lib/cms/sanitizeCmsRichText";

export function SanitizedCmsHtml({
  className,
  html,
}: {
  className?: string;
  html: string;
}) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(html) }} />;
}
