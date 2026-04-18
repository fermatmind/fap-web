import type { Metadata } from "next";
import Link from "next/link";
import { TrackedEntryCtaLink } from "@/components/analytics/TrackedEntryCtaLink";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { buttonVariants } from "@/components/ui/button";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";
import { listPersonalityProfiles } from "@/lib/cms/personality";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { DEFAULT_MBTI_FORM_CODE } from "@/lib/mbti/forms";
import { buildMbtiEntryHref, buildMbtiEntryTrackingPayload } from "@/lib/mbti/entryTracking";
import { buildPersonalityHubPayload } from "@/lib/mbti/personalityHub.adapter";
import type { PersonalityHubFamilyGroup } from "@/lib/mbti/personalityHub.types";
import { buildBreadcrumbJsonLd, buildItemListJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

type Locale = "en" | "zh";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);

  return buildPageMetadata({
    locale,
    pathname: locale === "zh" ? "/zh/personality" : "/en/personality",
    title: locale === "zh" ? "人格类型" : "Personality Types",
    description:
      locale === "zh"
        ? "先做 MBTI 测试，或直接浏览 16 型人格内容。"
        : "Start the MBTI test or browse the 16 personality type profiles directly.",
    alternatesByLocale: {
      en: "/en/personality",
      zh: "/zh/personality",
      xDefault: "/",
    },
  });
}

function localizeDoorCopy(locale: Locale) {
  return {
    heroTitle: locale === "zh" ? "看懂你的人格类型" : "Understand your personality type",
    heroSubtitle:
      locale === "zh"
        ? "先找到自己的类型，再进入更适合你的内容方向。"
        : "Find your type first, then move into the content path that fits you.",
    doorOneEyebrow: locale === "zh" ? "我还不知道自己的类型" : "I do not know my type yet",
    doorOneTitle: locale === "zh" ? "先做一次 MBTI 测试" : "Take the MBTI test first",
    doorOneBody:
      locale === "zh"
        ? "适合第一次进入，想快速知道自己更偏向哪一类人格的人。"
        : "Best for a first visit when you want a quick read on which personality type you lean toward.",
    doorOneCta: locale === "zh" ? "开始 MBTI 测试" : "Start MBTI test",
    doorTwoEyebrow: locale === "zh" ? "我已经知道自己的类型" : "I already know my type",
    doorTwoTitle: locale === "zh" ? "直接查看人格类型内容" : "Go straight to type content",
    doorTwoBody:
      locale === "zh"
        ? "适合已经知道自己是 INFJ / INTJ / ENFP 等类型，想直接看画像、差异与延伸内容的人。"
        : "Best if you already know you are INFJ, INTJ, ENFP, or another type and want the profile, differences, and next reading.",
    doorTwoCta: locale === "zh" ? "浏览 16 型人格" : "Browse 16 types",
    groupHeading: locale === "zh" ? "按类型组浏览" : "Browse by type group",
    groupSubtitle:
      locale === "zh"
        ? "先选一个类型组，再进入具体人格内容页。"
        : "Choose a group first, then open a specific personality profile.",
    viewGroup: locale === "zh" ? "查看该组类型" : "View this group",
  };
}

function MainDoor({
  eyebrow,
  title,
  body,
  cta,
  href,
  primary = false,
  trackingProps,
}: {
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  href: string;
  primary?: boolean;
  trackingProps?: ReturnType<typeof buildMbtiEntryTrackingPayload>;
}) {
  const className = buttonVariants({ variant: primary ? "default" : "outline", size: "lg" });

  return (
    <article
      className="flex min-h-[260px] flex-col justify-between rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-6 shadow-[var(--fm-shadow-sm)]"
      data-testid={primary ? "personality-main-door-test" : "personality-main-door-browse"}
    >
      <div className="space-y-4">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">{eyebrow}</p>
        <div className="space-y-3">
          <h2 className="m-0 font-serif text-2xl font-semibold text-[var(--fm-text)]">{title}</h2>
          <p className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">{body}</p>
        </div>
      </div>
      {trackingProps ? (
        <TrackedEntryCtaLink
          href={href}
          className={className}
          data-testid="personality-start-mbti-cta"
          eventProperties={trackingProps}
        >
          {cta}
        </TrackedEntryCtaLink>
      ) : (
        <Link href={href} className={className} data-testid="personality-browse-types-cta">
          {cta}
        </Link>
      )}
    </article>
  );
}

function TypeGroupBrowse({
  locale,
  groups,
}: {
  locale: Locale;
  groups: PersonalityHubFamilyGroup[];
}) {
  const copy = localizeDoorCopy(locale);
  const formatGroupTitle = (group: PersonalityHubFamilyGroup) =>
    group.title.includes(group.groupKey) ? group.title : `${group.groupKey} · ${group.title}`;
  const formatTypeLabel = (type: PersonalityHubFamilyGroup["cards"][number]) => {
    const duplicatedPrefix = `${type.typeCode} · `;

    return type.title.startsWith(duplicatedPrefix)
      ? `${type.typeCode} · ${type.title.slice(duplicatedPrefix.length)}`
      : `${type.typeCode} · ${type.title}`;
  };

  return (
    <section id="type-groups" className="space-y-6" data-testid="personality-type-group-browse">
      <div className="space-y-2">
        <h2 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">{copy.groupHeading}</h2>
        <p className="m-0 text-sm text-[var(--fm-text-muted)]">{copy.groupSubtitle}</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-4">
        {groups.map((group) => (
          <article
            key={group.groupKey}
            id={group.groupKey.toLowerCase()}
            className="space-y-4 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
          >
            <div className="space-y-2">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
                {group.groupKey}
              </p>
              <h3 className="m-0 font-serif text-xl font-semibold text-[var(--fm-text)]">
                {formatGroupTitle(group)}
              </h3>
              <p className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">{group.summary}</p>
            </div>
            <a href={`#${group.groupKey.toLowerCase()}-types`} className="fm-help-chip-link">
              {copy.viewGroup}
            </a>
          </article>
        ))}
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4" data-testid="personality-type-directory">
        {groups.map((group) => (
          <section
            key={`${group.groupKey}-types`}
            id={`${group.groupKey.toLowerCase()}-types`}
            className="space-y-3"
          >
            <p className="m-0 text-sm font-semibold text-[var(--fm-text)]">
              {formatGroupTitle(group)}
            </p>
            <div className="grid gap-2">
              {group.cards.map((type) => (
                <Link
                  key={type.typeCode}
                  href={type.href}
                  className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface)] px-4 py-3 text-sm font-semibold text-[var(--fm-text)] transition hover:border-[var(--fm-accent)] hover:text-[var(--fm-accent)]"
                >
                  {formatTypeLabel(type)}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}

export default async function PersonalityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const withLocale = (path: string) => localizedPath(path, locale);
  const { items: personalities, landingSurface } = await listPersonalityProfiles({ locale }).catch(() => ({
    items: [],
    landingSurface: null,
    pagination: {
      currentPage: 1,
      perPage: 20,
      total: 0,
      lastPage: 1,
    },
  }));
  const canonicalPath = locale === "zh" ? "/zh/personality" : "/en/personality";
  const copy = localizeDoorCopy(locale);
  const hubPayload = buildPersonalityHubPayload({
    locale,
    canonicalPath,
    personalities,
    landingSurface,
  });
  const mbtiEntryViewTrackingProps = buildMbtiEntryTrackingPayload({
    locale,
    formCode: DEFAULT_MBTI_FORM_CODE,
    entrySurface: "mbti_personality_index",
    sourcePageType: "personality_index",
    targetAction: "entry_view",
    sourcePath: canonicalPath,
  });
  const mbtiPrimaryCtaTrackingProps = buildMbtiEntryTrackingPayload({
    locale,
    formCode: DEFAULT_MBTI_FORM_CODE,
    entrySurface: "mbti_personality_index",
    sourcePageType: "personality_index",
    targetAction: "start_mbti_test_primary",
    sourcePath: canonicalPath,
  });
  const mbtiPrimaryCtaHref = buildMbtiEntryHref({
    locale,
    formCode: DEFAULT_MBTI_FORM_CODE,
    entrySurface: "mbti_personality_index",
    sourcePageType: "personality_index",
    targetAction: "start_mbti_test_primary",
    sourcePath: canonicalPath,
  });
  const typeItemList = hubPayload.jsonLdInputs?.typeItemList ?? [];
  const webPageJsonLd = buildWebPageJsonLd({
    path: canonicalPath,
    title: locale === "zh" ? "人格类型" : "Personality Types",
    description:
      locale === "zh"
        ? "先做 MBTI 测试，或直接浏览 16 型人格内容。"
        : "Start the MBTI test or browse the 16 personality type profiles directly.",
    locale,
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: locale === "zh" ? "首页" : "Home", path: locale === "zh" ? "/zh" : "/en" },
    { name: locale === "zh" ? "人格" : "Personality", path: canonicalPath },
  ]);
  const itemListJsonLd =
    typeItemList.length
      ? buildItemListJsonLd({
          path: canonicalPath,
          title: locale === "zh" ? "16 型人格目录" : "16 personality type inventory",
          description:
            locale === "zh"
              ? "按类型组浏览 16 型人格内容页。"
              : "Browse the published 16 personality profiles by type group.",
          locale,
          idSuffix: "personality-inventory",
          items: typeItemList.map((item) => ({
            name: item.name,
            path: item.url,
            description: item.description,
          })),
        })
      : null;
  return (
    <Container as="main" className="space-y-10 py-10 pb-24">
      <AnalyticsPageViewTracker eventName="landing_view" properties={mbtiEntryViewTrackingProps} />
      <JsonLd id="personality-webpage" data={webPageJsonLd} />
      <JsonLd id="personality-breadcrumb" data={breadcrumbJsonLd} />
      {itemListJsonLd ? <JsonLd id="personality-itemlist-jsonld" data={itemListJsonLd} /> : null}
      <Breadcrumb
        items={[
          { label: locale === "zh" ? "首页" : "Home", href: withLocale("/") },
          { label: locale === "zh" ? "人格" : "Personality" },
        ]}
      />

      <section className="max-w-4xl space-y-4" data-testid="personality-ia-hero">
        <h1 className="m-0 font-serif text-5xl font-semibold tracking-tight text-[var(--fm-text)] md:text-6xl">
          {copy.heroTitle}
        </h1>
        <p className="m-0 max-w-2xl text-lg leading-8 text-[var(--fm-text-muted)]">{copy.heroSubtitle}</p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2" data-testid="personality-two-main-doors">
        <MainDoor
          eyebrow={copy.doorOneEyebrow}
          title={copy.doorOneTitle}
          body={copy.doorOneBody}
          cta={copy.doorOneCta}
          href={mbtiPrimaryCtaHref}
          primary
          trackingProps={mbtiPrimaryCtaTrackingProps}
        />
        <MainDoor
          eyebrow={copy.doorTwoEyebrow}
          title={copy.doorTwoTitle}
          body={copy.doorTwoBody}
          cta={copy.doorTwoCta}
          href="#type-groups"
        />
      </section>

      <TypeGroupBrowse locale={locale} groups={hubPayload.familyGroups} />
    </Container>
  );
}
