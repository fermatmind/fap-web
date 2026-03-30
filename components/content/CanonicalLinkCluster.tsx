import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import {
  formatGraphLinkLabel,
  type ContentGraphLink,
} from "@/lib/navigation/contentGraph";

type CanonicalLinkClusterProps = {
  title: string;
  items: ContentGraphLink[];
  locale: Locale;
  testId?: string;
};

export function CanonicalLinkCluster({
  title,
  items,
  locale,
  testId,
}: CanonicalLinkClusterProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section
      className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      data-testid={testId}
    >
      <h2 className="m-0 font-serif text-xl font-semibold text-[var(--fm-text)]">{title}</h2>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Link key={`${item.href}-${item.label}`} href={item.href} className="fm-help-chip-link">
            {formatGraphLinkLabel(item, locale)}
          </Link>
        ))}
      </div>
    </section>
  );
}
