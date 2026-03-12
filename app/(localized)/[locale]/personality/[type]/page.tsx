import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildPersonalityFrontendUrl,
  getPersonalityProfileBySlugOrType,
  getPersonalitySeoBySlugOrType,
  normalizePersonalitySeoPayload,
} from "@/lib/cms/personality";
import { getMbtiRecommendation } from "@/lib/content";
import { extractPersonalityFaqItems, renderPersonalitySections } from "@/lib/cms/personality-sections";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { buildBreadcrumbJsonLd, buildFAQPageJsonLd, buildWebPageJsonLd, type FAQItem } from "@/lib/seo/generateSchema";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { canonicalUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

type FallbackRecommendation = NonNullable<ReturnType<typeof getMbtiRecommendation>>;

function shouldNoindex(robotsValue: string | null | undefined): boolean {
  return String(robotsValue ?? "")
    .toLowerCase()
    .split(",")
    .map((part) => part.trim())
    .includes("noindex");
}

function resolveTwitterCard(value: string | null | undefined): "summary" | "summary_large_image" | "player" | "app" {
  if (value === "summary" || value === "player" || value === "app") {
    return value;
  }

  return "summary_large_image";
}

function buildCanonicalPath(slug: string, locale: Locale): string {
  return buildPersonalityFrontendUrl(locale, slug);
}

async function loadPersonalityData(type: string, locale: Locale) {
  const [profileResult, seoResult] = await Promise.allSettled([
    getPersonalityProfileBySlugOrType(type, locale),
    getPersonalitySeoBySlugOrType(type, locale),
  ]);

  return {
    profile: profileResult.status === "fulfilled" ? profileResult.value : null,
    seo: seoResult.status === "fulfilled" ? seoResult.value : null,
  };
}

function buildFallbackFaqItems(type: string, recommendation: FallbackRecommendation, locale: Locale): FAQItem[] {
  if (locale === "zh") {
    return [
      {
        question: `${type} 最适合关注什么样的成长方向？`,
        answer: `${type} 可以优先关注 ${recommendation.strengths.slice(0, 2).join("、")} 这些优势如何落到稳定的工作与沟通结果上。`,
      },
      {
        question: `${type} 更适合什么工作环境？`,
        answer: `${type} 往往更适合 ${recommendation.work_env} 的工作环境。`,
      },
      {
        question: `${type} 在职业判断上要避免什么误区？`,
        answer: `不要把人格标签当成唯一答案。还需要同时校验 ${recommendation.risks.slice(0, 2).join("、")} 这些风险以及真实技能积累。`,
      },
    ];
  }

  return [
    {
      question: `What growth direction should ${type} prioritize?`,
      answer: `${type} should first turn strengths like ${recommendation.strengths.slice(0, 2).join(" and ")} into repeatable work and communication outcomes.`,
    },
    {
      question: `What work environment tends to fit ${type} best?`,
      answer: `${type} usually performs better in ${recommendation.work_env.toLowerCase()}.`,
    },
    {
      question: `What should ${type} avoid when using personality advice?`,
      answer: `Do not use a personality label as the only answer. Check real skill evidence and risks like ${recommendation.risks.slice(0, 2).join(" and ")} before making a career or relationship decision.`,
    },
  ];
}

function buildFallbackAnswerFirst(type: string, recommendation: FallbackRecommendation, locale: Locale): string {
  if (locale === "zh") {
    return `${type} 的公开主页优先回答三个问题：你通常靠什么优势发挥、什么环境更容易让你稳定输出，以及在做职业或关系判断时要额外防范哪些风险。`;
  }

  return `${type} public guidance starts with three practical answers: which strengths you lean on, which environments help you stay effective, and which risks deserve extra attention before making career or relationship decisions.`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; type: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, type } = await params;
  const locale = resolveLocale(localeParam);
  const { profile, seo } = await loadPersonalityData(type, locale);

  if (!profile) {
    const recommendation = getMbtiRecommendation(type.toUpperCase(), locale);
    if (!recommendation) {
      return { title: "Not Found", robots: { index: false, follow: false } };
    }

    const slug = type.toLowerCase();
    return buildPageMetadata({
      locale,
      pathname: buildCanonicalPath(slug, locale),
      title: recommendation.title,
      description: recommendation.summary,
      alternatesByLocale: {
        en: buildCanonicalPath(slug, "en"),
        zh: buildCanonicalPath(slug, "zh"),
        xDefault: "/",
      },
    });
  }

  const canonicalPath = buildCanonicalPath(profile.slug, locale);
  const normalizedSeo = normalizePersonalitySeoPayload(seo, profile, locale);
  const noindex = !profile.isIndexable || shouldNoindex(normalizedSeo.meta.robots);
  const metadata = buildPageMetadata({
    locale,
    pathname: canonicalPath,
    title: normalizedSeo.meta.title,
    description: normalizedSeo.meta.description,
    imagePath: normalizedSeo.meta.og.image ?? undefined,
    noindex,
    alternatesByLocale: {
      en: buildPersonalityFrontendUrl("en", profile.slug),
      zh: buildPersonalityFrontendUrl("zh", profile.slug),
      xDefault: "/",
    },
  });

  return {
    ...metadata,
    alternates: {
      ...metadata.alternates,
      canonical: canonicalUrl(canonicalPath),
    },
    openGraph: {
      type: "article",
      url: canonicalUrl(canonicalPath),
      title: normalizedSeo.meta.og.title,
      description: normalizedSeo.meta.og.description,
      images: normalizedSeo.meta.og.image ? [normalizedSeo.meta.og.image] : undefined,
      locale: locale === "zh" ? "zh_CN" : "en_US",
    },
    twitter: {
      card: resolveTwitterCard(normalizedSeo.meta.twitter.card),
      title: normalizedSeo.meta.twitter.title,
      description: normalizedSeo.meta.twitter.description,
      images: normalizedSeo.meta.twitter.image ? [normalizedSeo.meta.twitter.image] : undefined,
    },
  };
}

export default async function PersonalityDetailPage({
  params,
}: {
  params: Promise<{ locale: string; type: string }>;
}) {
  const { locale: localeParam, type } = await params;
  const locale = resolveLocale(localeParam);
  const { profile, seo } = await loadPersonalityData(type, locale);

  if (!profile) {
    const recommendation = getMbtiRecommendation(type.toUpperCase(), locale);
    if (!recommendation) {
      return notFound();
    }

    const slug = type.toLowerCase();
    const canonicalPath = buildCanonicalPath(slug, locale);
    const faqItems = buildFallbackFaqItems(type.toUpperCase(), recommendation, locale);
    const webPageJsonLd = buildWebPageJsonLd({
      path: canonicalPath,
      title: recommendation.title,
      description: recommendation.summary,
      locale,
    });
    const breadcrumbJsonLd = buildBreadcrumbJsonLd([
      { name: locale === "zh" ? "首页" : "Home", path: localizedPath("/", locale) },
      { name: locale === "zh" ? "人格" : "Personality", path: localizedPath("/personality", locale) },
      { name: type.toUpperCase(), path: canonicalPath },
    ]);

    return (
      <Container as="main" className="space-y-6 py-10">
        <JsonLd id={`personality-webpage-${slug}`} data={webPageJsonLd} />
        <JsonLd id={`personality-breadcrumb-${slug}`} data={breadcrumbJsonLd} />
        <JsonLd id={`personality-faq-${slug}`} data={buildFAQPageJsonLd(faqItems)} />
        <Breadcrumb
          items={[
            { label: locale === "zh" ? "首页" : "Home", href: localizedPath("/", locale) },
            { label: locale === "zh" ? "人格" : "Personality", href: localizedPath("/personality", locale) },
            { label: type.toUpperCase() },
          ]}
        />

        <section
          id="answer-first"
          className="space-y-4 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
        >
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
            {type.toUpperCase()}
          </p>
          <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">{recommendation.title}</h1>
          <p className="m-0 text-lg text-[var(--fm-text)]">{recommendation.summary}</p>
          <p className="m-0 text-[var(--fm-text-muted)]">
            {buildFallbackAnswerFirst(type.toUpperCase(), recommendation, locale)}
          </p>
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{locale === "zh" ? "核心优势" : "Core strengths"}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[var(--fm-text-muted)]">
              <ul className="m-0 list-disc space-y-2 pl-5">
                {recommendation.strengths.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{locale === "zh" ? "关键风险" : "Key risks"}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[var(--fm-text-muted)]">
              <ul className="m-0 list-disc space-y-2 pl-5">
                {recommendation.risks.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card id="career_fit">
          <CardHeader>
            <CardTitle>{locale === "zh" ? "环境与职业入口" : "Environment and career entry points"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-[var(--fm-text-muted)]">
            <p className="m-0">{recommendation.work_env}</p>
            <div className="flex flex-wrap gap-2">
              <Link href={localizedPath(`/career/recommendations/mbti/${type.toUpperCase()}`, locale)} className="fm-help-chip-link">
                {locale === "zh" ? `${type.toUpperCase()} 职业推荐` : `${type.toUpperCase()} career guidance`}
              </Link>
              <Link href={localizedPath("/topics/mbti", locale)} className="fm-help-chip-link">
                {locale === "zh" ? "MBTI 主题页" : "MBTI topic page"}
              </Link>
              <Link href={localizedPath("/help/faq", locale)} className="fm-help-chip-link">
                {locale === "zh" ? "帮助与 FAQ" : "Help and FAQ"}
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card id="faq">
          <CardHeader>
            <CardTitle>{locale === "zh" ? "常见问题" : "Frequently asked questions"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <dl className="m-0 space-y-4">
              {faqItems.map((item) => (
                <div key={item.question} className="space-y-1">
                  <dt className="font-medium text-[var(--fm-text)]">{item.question}</dt>
                  <dd className="m-0 text-[var(--fm-text-muted)]">{item.answer}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      </Container>
    );
  }

  const normalizedSeo = normalizePersonalitySeoPayload(seo, profile, locale);
  const canonicalPath = buildCanonicalPath(profile.slug, locale);
  const faqItems = extractPersonalityFaqItems(profile.sections);
  const webPageJsonLd = buildWebPageJsonLd({
    path: canonicalPath,
    title: normalizedSeo.meta.title,
    description: normalizedSeo.meta.description,
    locale,
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: locale === "zh" ? "首页" : "Home", path: localizedPath("/", locale) },
    { name: locale === "zh" ? "人格" : "Personality", path: localizedPath("/personality", locale) },
    { name: profile.typeCode, path: canonicalPath },
  ]);
  const renderedSections = renderPersonalitySections(profile.sections, locale);

  return (
    <Container as="main" className="space-y-6 py-10">
      <JsonLd id={`personality-jsonld-${profile.slug}`} data={normalizedSeo.jsonld} />
      <JsonLd id={`personality-webpage-${profile.slug}`} data={webPageJsonLd} />
      <JsonLd id={`personality-breadcrumb-${profile.slug}`} data={breadcrumbJsonLd} />
      {faqItems.length > 0 ? <JsonLd id={`personality-faq-${profile.slug}`} data={buildFAQPageJsonLd(faqItems)} /> : null}
      <Breadcrumb
        items={[
          { label: locale === "zh" ? "首页" : "Home", href: localizedPath("/", locale) },
          { label: locale === "zh" ? "人格" : "Personality", href: localizedPath("/personality", locale) },
          { label: profile.typeCode },
        ]}
      />

      <section
        id="answer-first"
        className="space-y-4 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      >
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
          {profile.heroKicker || profile.typeCode}
        </p>
        <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">{profile.title}</h1>
        {profile.subtitle ? <p className="m-0 text-lg text-[var(--fm-text)]">{profile.subtitle}</p> : null}
        {profile.excerpt ? <p className="m-0 text-[var(--fm-text-muted)]">{profile.excerpt}</p> : null}
        {profile.heroQuote ? (
          <blockquote className="m-0 rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4 text-sm italic text-[var(--fm-text-muted)]">
            {profile.heroQuote}
          </blockquote>
        ) : null}
      </section>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          {renderedSections.length > 0 ? (
            renderedSections
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>{locale === "zh" ? "内容暂未同步" : "Content not yet available"}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-[var(--fm-text-muted)]">
                <p className="m-0">
                  {locale === "zh"
                    ? "该人格画像已接入 CMS，但当前语言下尚未同步可渲染的 sections。"
                    : "This personality profile is connected to the CMS, but no renderable sections are available for this locale yet."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{locale === "zh" ? "Profile summary" : "Profile summary"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-[var(--fm-text-muted)]">
              <p className="m-0">
                <span className="font-medium text-[var(--fm-text)]">{locale === "zh" ? "Type" : "Type"}:</span>{" "}
                {profile.typeCode}
              </p>
              <p className="m-0">
                <span className="font-medium text-[var(--fm-text)]">{locale === "zh" ? "Locale" : "Locale"}:</span>{" "}
                {profile.locale}
              </p>
              <p className="m-0">
                <span className="font-medium text-[var(--fm-text)]">{locale === "zh" ? "Planned URL" : "Planned URL"}:</span>{" "}
                {canonicalUrl(canonicalPath)}
              </p>
              <p className="m-0">
                <span className="font-medium text-[var(--fm-text)]">{locale === "zh" ? "Indexing" : "Indexing"}:</span>{" "}
                {normalizedSeo.meta.robots}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{locale === "zh" ? "SEO snapshot" : "SEO snapshot"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-[var(--fm-text-muted)]">
              <div>
                <p className="m-0 font-medium text-[var(--fm-text)]">{locale === "zh" ? "Title" : "Title"}</p>
                <p className="mb-0 mt-1">{normalizedSeo.meta.title || "-"}</p>
              </div>
              <div>
                <p className="m-0 font-medium text-[var(--fm-text)]">{locale === "zh" ? "Description" : "Description"}</p>
                <p className="mb-0 mt-1">{normalizedSeo.meta.description || "-"}</p>
              </div>
              <div>
                <p className="m-0 font-medium text-[var(--fm-text)]">Canonical</p>
                <p className="mb-0 mt-1 break-all">{normalizedSeo.meta.canonical || "-"}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  );
}
