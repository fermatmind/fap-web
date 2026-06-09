import type { ReactNode } from "react";
import { sanitizeCmsUrl } from "@/lib/cms/sanitizeCmsRichText";

export function stripMarkdownEmphasisMarkers(text: string): string {
  return text.replace(/\*+/g, "");
}

export function renderCmsInlineMarkdown(text: string, keyPrefix: string): ReactNode[] {
  const normalized = text.replace(/\n/g, " ");
  const pattern = /(\[[^\]]+\]\([^)]+\))/g;
  const parts = normalized.split(pattern).filter((part) => part.length > 0);

  return parts.map((part, index) => {
    const key = `${keyPrefix}-${index}`;
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const label = stripMarkdownEmphasisMarkers(link[1] ?? "");
      const href = sanitizeCmsUrl(link[2] ?? "");
      if (!href) {
        return <span key={key}>{label}</span>;
      }

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

    return <span key={key}>{stripMarkdownEmphasisMarkers(part)}</span>;
  });
}
