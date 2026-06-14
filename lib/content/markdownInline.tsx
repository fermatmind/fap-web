import type { ReactNode } from "react";
import { sanitizeCmsUrl } from "@/lib/cms/sanitizeCmsRichText";
import { labelInternalHref, splitInternalLinkText, type InternalLinkLabelMap } from "@/lib/content/internalLinkText";
import type { Locale } from "@/lib/i18n/locales";

export function stripMarkdownEmphasisMarkers(text: string): string {
  return text.replace(/\*+/g, "");
}

export function renderCmsInlineMarkdown(
  text: string,
  keyPrefix: string,
  options: { internalLinkLabels?: InternalLinkLabelMap; locale?: Locale } = {}
): ReactNode[] {
  const normalized = text.replace(/\n/g, " ");
  const pattern = /(\[[^\]]+\]\([^)]+\))/g;
  const parts = normalized.split(pattern).filter((part) => part.length > 0);

  return parts.flatMap((part, index) => {
    const key = `${keyPrefix}-${index}`;
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const href = sanitizeCmsUrl(link[2] ?? "");
      const rawLabel = stripMarkdownEmphasisMarkers(link[1] ?? "");
      if (!href) {
        return <span key={key}>{rawLabel}</span>;
      }

      const label = rawLabel.trim() === href.trim()
        ? labelInternalHref(href, options.internalLinkLabels, options.locale ?? "zh") ?? rawLabel
        : rawLabel;
      const isExternal = /^https?:\/\//i.test(href);
      return (
        <a
          key={key}
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="text-[var(--fm-accent)] underline-offset-2 hover:underline"
        >
          {label}
        </a>
      );
    }

    return splitInternalLinkText(stripMarkdownEmphasisMarkers(part), options.internalLinkLabels, options.locale ?? "zh").map((textPart, partIndex) => {
      const partKey = `${key}-plain-${partIndex}`;
      if (textPart.type === "link") {
        return (
          <a key={partKey} href={textPart.href} className="text-[var(--fm-accent)] underline-offset-2 hover:underline">
            {textPart.label}
          </a>
        );
      }

      return <span key={partKey}>{textPart.text}</span>;
    });
  });
}
