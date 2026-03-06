import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { RelatedContent } from "@/components/content/RelatedContent";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  listRelatedArticlesForType,
  listRelatedCareerItemsForType,
  listMbtiRecommendationTypes,
} from "@/lib/content";
import { getPersonalityProfile } from "@/lib/personality";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { buildBreadcrumbJsonLd, buildPersonJsonLd } from "@/lib/seo/generateSchema";
import { buildPageMetadata } from "@/lib/seo/metadata";

export function generateStaticParams() {
  return listMbtiRecommendationTypes().flatMap((type) => [
    { locale: "en", type: type.toLowerCase() },
    { locale: "zh", type: type.toLowerCase() },
  ]);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; type: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, type } = await params;
  const locale = resolveLocale(localeParam);
  const personality = getPersonalityProfile(type, locale);

  if (!personality) {
    return { title: "Not Found", robots: { index: false, follow: false } };
  }

  return buildPageMetadata({
    locale,
    pathname:
      locale === "zh"
        ? `/zh/personality/${personality.slug}`
        : `/en/personality/${personality.slug}`,
    title:
      locale === "zh"
        ? `${personality.type} 人格指南`
        : `${personality.type} Personality Guide`,
    description:
      locale === "zh"
        ? `了解 ${personality.type} 的优势、弱项、人际模式和职业方向。`
        : `Discover strengths, weaknesses, relationship patterns, and career direction for the ${personality.type} personality type.`,
    alternatesByLocale: {
      en: `/en/personality/${personality.slug}`,
      zh: `/zh/personality/${personality.slug}`,
      xDefault: "/",
    },
  });
}

export default async function PersonalityDetailPage({
  params,
}: {
  params: Promise<{ locale: string; type: string }>;
}) {
  const { locale: localeParam, type } = await params;
  const locale = resolveLocale(localeParam);
  const personality = getPersonalityProfile(type, locale);

  if (!personality) return notFound();

  const relatedArticles = listRelatedArticlesForType(personality.type, locale);
  const relatedCareers = listRelatedCareerItemsForType(personality.type, locale);
  const canonicalPath =
    locale === "zh"
      ? `/zh/personality/${personality.slug}`
      : `/en/personality/${personality.slug}`;
  const personJsonLd = buildPersonJsonLd({
    path: canonicalPath,
    name: `${personality.type} personality`,
    description: personality.summary,
    locale,
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: locale === "zh" ? "首页" : "Home", path: locale === "zh" ? "/zh" : "/en" },
    { name: locale === "zh" ? "人格" : "Personality", path: locale === "zh" ? "/zh/personality" : "/en/personality" },
    { name: personality.type, path: canonicalPath },
  ]);

  return (
    <Container as="main" className="space-y-6 py-10">
      <JsonLd id={`personality-jsonld-${personality.slug}`} data={personJsonLd} />
      <JsonLd id={`personality-breadcrumb-${personality.slug}`} data={breadcrumbJsonLd} />
      <Breadcrumb
        items={[
          { label: locale === "zh" ? "首页" : "Home", href: localizedPath("/", locale) },
          { label: locale === "zh" ? "人格" : "Personality", href: localizedPath("/personality", locale) },
          { label: personality.type },
        ]}
      />

      <section className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
          {personality.type}
        </p>
        <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">
          {personality.type} · {personality.name}
        </h1>
        <p className="m-0 text-[var(--fm-text-muted)]">{personality.summary}</p>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{locale === "zh" ? "Overview" : "Overview"}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[var(--fm-text-muted)]">
            <p className="m-0">{personality.overview}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{locale === "zh" ? "Relationships" : "Relationships"}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[var(--fm-text-muted)]">
            <p className="m-0">{personality.relationships}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{locale === "zh" ? "Strengths" : "Strengths"}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[var(--fm-text-muted)]">
            <ul className="m-0 space-y-1 pl-5">
              {personality.strengths.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{locale === "zh" ? "Weaknesses" : "Weaknesses"}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[var(--fm-text-muted)]">
            <ul className="m-0 space-y-1 pl-5">
              {personality.weaknesses.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{locale === "zh" ? "Career match" : "Career match"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-[var(--fm-text-muted)]">
          <p className="m-0">{personality.careerMatch}</p>
          <p className="m-0">
            {locale === "zh" ? "推荐方向" : "Suggested roles"}:{" "}
            {personality.recommendation.recommended_jobs.slice(0, 4).join(", ")}
          </p>
          <Link
            href={localizedPath(`/career/recommendations/mbti/${personality.type}`, locale)}
            className="font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]"
          >
            {locale === "zh" ? "查看职业推荐" : "Open career recommendation"}
          </Link>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <RelatedContent
          title={locale === "zh" ? "相关职业路径" : "Related career paths"}
          items={relatedCareers}
        />
        <RelatedContent
          title={locale === "zh" ? "相关文章" : "Related articles"}
          items={relatedArticles}
        />
      </div>
    </Container>
  );
}
