import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RelatedContentItem } from "@/lib/content";

type RelatedContentProps = {
  title: string;
  items: RelatedContentItem[];
};

export function RelatedContent({ title, items }: RelatedContentProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <h2 className="m-0 font-serif text-2xl font-semibold text-[var(--fm-text)]">
        {title}
      </h2>
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <Card key={`${item.href}-${item.slug}`} className="border-[var(--fm-border)] bg-[var(--fm-surface)] shadow-[var(--fm-shadow-sm)]">
            <CardHeader className="space-y-2">
              <CardTitle className="text-lg font-semibold text-[var(--fm-text)]">
                <Link href={item.href} className="hover:text-[var(--fm-accent)]">
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
        ))}
      </div>
    </section>
  );
}
