import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPersonalityProfileBySlugOrType, listPersonalityProfiles } from "@/lib/cms/personality";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateStaticParams() {
  const { items } = await listPersonalityProfiles({ locale: "en", perPage: 100 }).catch(() => ({ items: [] }));
  return items.flatMap((type) => [
    { locale: "en", code: type.slug || type.typeCode },
    { locale: "zh", code: type.slug || type.typeCode },
  ]);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; code: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, code } = await params;
  const locale = resolveLocale(localeParam);
  const type = await getPersonalityProfileBySlugOrType(code, locale);
  const normalizedCode = String(type?.slug || code).toLowerCase();

  if (!type) {
    return {
      title: "Type Not Found",
      robots: { index: false, follow: false },
    };
  }

  return buildPageMetadata({
    locale,
    pathname: locale === "zh" ? `/zh/professions/${normalizedCode}` : `/en/professions/${normalizedCode}`,
    title: `${type.typeCode} - ${type.title}`,
    description: type.excerpt,
    alternatesByLocale: {
      en: `/en/professions/${normalizedCode}`,
      zh: `/zh/professions/${normalizedCode}`,
      xDefault: "/",
    },
  });
}

export default async function ProfessionDetailPage({
  params,
}: {
  params: Promise<{ locale: string; code: string }>;
}) {
  const { locale: localeParam, code } = await params;
  const locale = resolveLocale(localeParam);
  const type = await getPersonalityProfileBySlugOrType(code, locale);

  if (!type) return notFound();

  return (
    <Container as="main" className="space-y-6 py-10">
      <section className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
          Type Profile
        </p>
        <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">
          {type.typeCode} · {type.title}
        </h1>
        <p className="m-0 text-[var(--fm-text-muted)]">{type.excerpt}</p>
      </section>

      <Card className="border-[var(--fm-border)] bg-[var(--fm-surface)] shadow-[var(--fm-shadow-sm)]">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{type.typeCode}</Badge>
            <CardTitle className="font-serif text-[var(--fm-text)]">{type.title}</CardTitle>
          </div>
          <p className="m-0 text-sm text-[var(--fm-text-muted)]">{type.excerpt}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {type.sections.length ? (
            <div className="flex flex-wrap gap-2">
              {type.sections.slice(0, 4).map((section) => (
                <Badge key={section.sectionKey}>{section.title}</Badge>
              ))}
            </div>
          ) : null}
          {type.updatedAt ? (
            <p className="m-0 text-sm text-[var(--fm-text-muted)]">Updated: {type.updatedAt}</p>
          ) : null}
          <Link
            href={localizedPath("/professions", locale)}
            className="text-sm font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]"
          >
            Back to professions
          </Link>
        </CardContent>
      </Card>
    </Container>
  );
}
