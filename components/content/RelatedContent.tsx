import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RelatedContentItem } from "@/lib/content";
import { formatPublicContentKind, inferPublicContentKind, normalizePublicHref } from "@/lib/navigation/publicLinking";
import type { Locale } from "@/lib/i18n/locales";

type RelatedContentProps = {
  title: string;
  items: RelatedContentItem[];
  locale: Locale;
};

export function RelatedContent({ title, items, locale }: RelatedContentProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <h2 className="m-0 font-serif text-2xl font-semibold text-[var(--fm-text)]">
        {title}
      </h2>
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((item) => {
          const itemKind = item.pageType ?? inferPublicContentKind(item.href);
          const itemKindLabel = formatPublicContentKind(itemKind, locale);

          return (
            <Card key={`${item.href}-${item.slug}`} className="border-[var(--fm-border)] bg-[var(--fm-surface)] shadow-[var(--fm-shadow-sm)]">
              <CardHeader className="space-y-2">
                {itemKindLabel ? (
                  <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
                    {itemKindLabel}
                  </p>
                ) : null}
                <CardTitle className="text-lg font-semibold text-[var(--fm-text)]">
                  <Link href={normalizePublicHref(item.href, locale)} className="hover:text-[var(--fm-accent)]">
                    {item.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              {item.summary ? (
                <CardContent className="pt-0 text-sm text-[var(--fm-text-muted)]">
                  <p className="m-0">{item.summary}</p>
                </CardContent>
              ) : null}
            </Card>
          );
        })}
      </div>
    </section>
  );
}
