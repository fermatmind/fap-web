import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listTypes } from "@/lib/content";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);

  return {
    title: "Professions",
    description: "Browse personality profiles and profession-oriented interpretation notes.",
    alternates: {
      canonical: localizedPath("/professions", locale),
    },
  };
}

export default async function ProfessionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const withLocale = (path: string) => localizedPath(path, locale);
  const types = listTypes();

  return (
    <Container as="main" className="space-y-6 py-10">
      <section className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
          Library
        </p>
        <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">Professions</h1>
        <p className="m-0 text-[var(--fm-text-muted)]">
          Explore personality profiles and practical interpretation notes.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {types.map((type) => (
          <Card
            key={type.code}
            className="border-[var(--fm-border)] bg-[var(--fm-surface)] shadow-[var(--fm-shadow-sm)] transition hover:shadow-[var(--fm-shadow-md)]"
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                <Badge>{type.code}</Badge>
                <CardTitle className="font-serif text-[var(--fm-text)]">{type.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="m-0 text-sm text-[var(--fm-text-muted)]">{type.description}</p>
              <Link
                href={withLocale(`/professions/${type.code}`)}
                className="text-sm font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]"
              >
                View details
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </Container>
  );
}
