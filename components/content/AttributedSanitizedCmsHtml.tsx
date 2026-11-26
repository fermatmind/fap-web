"use client";

import { useMemo } from "react";
import { prepareArticleHtml, sanitizeCmsHtml, type CmsHtmlSanitizeOptions } from "@/lib/cms/sanitizeCmsRichText";
import { AttributedCmsLinkHydrator } from "@/components/content/AttributedCmsLinkHydrator";
import type { Locale } from "@/lib/i18n/locales";
import type { SeoCtaSourceRouteFamily } from "@/lib/tracking/seoCtaAttribution";

type AttributedSanitizedCmsHtmlProps = {
  className?: string;
  html: string;
  locale: Locale;
  sourceRouteFamily: SeoCtaSourceRouteFamily;
  sourceSlug: string;
  sourcePath: string;
  contentId?: string | number | null;
  internalLinkLabels?: CmsHtmlSanitizeOptions["internalLinkLabels"];
  editorialHeadingAnchors?: boolean;
  minimumHeadingLevel?: CmsHtmlSanitizeOptions["minimumHeadingLevel"];
};

export function AttributedSanitizedCmsHtml({
  className,
  html,
  locale,
  sourceRouteFamily,
  sourceSlug,
  sourcePath,
  contentId,
  internalLinkLabels,
  minimumHeadingLevel,
  editorialHeadingAnchors,
}: AttributedSanitizedCmsHtmlProps) {
  const sanitizedHtml = useMemo(
    () => editorialHeadingAnchors ? prepareArticleHtml(html, locale).html : sanitizeCmsHtml(html, { internalLinkLabels, locale, minimumHeadingLevel }),
    [html, internalLinkLabels, locale, minimumHeadingLevel, editorialHeadingAnchors]
  );

  return (
    <AttributedCmsLinkHydrator
      className={className}
      locale={locale}
      sourceRouteFamily={sourceRouteFamily}
      sourceSlug={sourceSlug}
      sourcePath={sourcePath}
      contentId={contentId}
    >
      <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
    </AttributedCmsLinkHydrator>
  );
}
