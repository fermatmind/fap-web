import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";
import { listPersonalityProfiles } from "@/lib/cms/personality";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { DEFAULT_MBTI_FORM_CODE } from "@/lib/mbti/forms";
import { buildMbtiEntryTrackingPayload } from "@/lib/mbti/entryTracking";
import { buildPersonalityHubPayload } from "@/lib/mbti/personalityHub.adapter";
import type { PersonalityHubFamilyGroup } from "@/lib/mbti/personalityHub.types";
import { buildBreadcrumbJsonLd, buildItemListJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

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

function TypeGroupBrowse({
  groups,
}: {
  groups: PersonalityHubFamilyGroup[];
}) {
  const formatTypeLabel = (type: PersonalityHubFamilyGroup["cards"][number]) => {
    return type.title.startsWith(type.typeCode) ? type.title : `${type.typeCode} - ${type.title}`;
  };

  return (
    <section id="type-groups" className="space-y-6" data-testid="personality-type-group-browse">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4" data-testid="personality-type-directory">
        {groups.map((group) => (
          <section
            key={`${group.groupKey}-types`}
            id={group.groupKey.toLowerCase()}
            className="grid gap-2"
          >
            {group.cards.map((type) => (
              <Link
                key={type.typeCode}
                href={type.href}
                className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface)] px-4 py-3 text-sm font-semibold text-[var(--fm-text)] transition hover:border-[var(--fm-accent)] hover:text-[var(--fm-accent)]"
              >
                {formatTypeLabel(type)}
              </Link>
            ))}
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
              ? "16 型人格内容页目录。"
              : "Published 16 personality profile directory.",
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

      <TypeGroupBrowse groups={hubPayload.familyGroups} />
    </Container>
  );
}
