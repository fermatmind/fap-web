import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DataGlyph } from "@/components/assessment-cards/DataGlyph";
import { CTASticky } from "@/components/business/CTASticky";
import { FAQAccordion, type FAQItem } from "@/components/business/FAQAccordion";
import { Container } from "@/components/layout/Container";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";
import { computeManifestHash } from "@/lib/big5/manifest";
import { getAllTests, getTestBySlug } from "@/lib/content";
import { resolveCardSpec } from "@/lib/design/card-resolver";
import { getDictSync, resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { NOINDEX_ROBOTS } from "@/lib/seo/noindex";

type LookupResponse = {
  seo_title?: string | null;
  seo_description?: string | null;
  og_image_url?: string | null;
  is_indexable?: boolean;
  pack_id?: string | null;
  dir_version?: string | null;
  content_package_version?: string | null;
  manifest_hash?: string | null;
  norms_version?: string | null;
  quality_level?: string | null;
  capabilities?: Record<string, unknown> | null;
  content_i18n_json?: Record<string, unknown> | null;
  report_summary_i18n_json?: Record<string, unknown> | null;
};

function toRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function toStringValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function firstQueryValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}

function parseFaq(value: unknown): FAQItem[] {
  if (!Array.isArray(value)) return [];

  const out: FAQItem[] = [];
  for (const item of value) {
    const node = toRecord(item);
    const q = toStringValue(node.q ?? node.question);
    const a = toStringValue(node.a ?? node.answer);
    if (q && a) {
      out.push({ q, a });
    }
  }
  return out;
}

function resolveRolloutState(capabilities: Record<string, unknown> | null | undefined): {
  enabledInProd: boolean;
  paywallMode: "off" | "free_only" | "full";
} {
  const node = toRecord(capabilities);
  const rollout = toRecord(node.rollout);

  const enabledRaw = node.enabled_in_prod ?? rollout.enabled_in_prod ?? true;
  const paywallRaw = String(node.paywall_mode ?? rollout.paywall_mode ?? "full")
    .trim()
    .toLowerCase();

  const enabledInProd =
    enabledRaw === false || String(enabledRaw).toLowerCase() === "false" || String(enabledRaw) === "0"
      ? false
      : true;

  if (paywallRaw === "off" || paywallRaw === "free_only" || paywallRaw === "full") {
    return {
      enabledInProd,
      paywallMode: paywallRaw,
    };
  }

  return {
    enabledInProd,
    paywallMode: "full",
  };
}

async function fetchLookup(slug: string, locale: "en" | "zh"): Promise<LookupResponse | null> {
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
  if (!apiBase) return null;

  try {
    const response = await fetch(
      `${apiBase}/api/v0.3/scales/lookup?slug=${encodeURIComponent(slug)}&locale=${locale}`,
      {
        headers: {
          Accept: "application/json",
          "X-FAP-Locale": locale === "zh" ? "zh-CN" : "en",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) return null;
    const payload = (await response.json()) as Record<string, unknown>;
    if (payload.ok === false) return null;

    return {
      seo_title: payload.seo_title as string | null | undefined,
      seo_description: payload.seo_description as string | null | undefined,
      og_image_url: payload.og_image_url as string | null | undefined,
      is_indexable: typeof payload.is_indexable === "boolean" ? payload.is_indexable : undefined,
      pack_id: (payload.pack_id as string | null | undefined) ?? null,
      dir_version: (payload.dir_version as string | null | undefined) ?? null,
      content_package_version: (payload.content_package_version as string | null | undefined) ?? null,
      manifest_hash: (payload.manifest_hash as string | null | undefined) ?? null,
      norms_version: (payload.norms_version as string | null | undefined) ?? null,
      quality_level: (payload.quality_level as string | null | undefined) ?? null,
      capabilities: (payload.capabilities as Record<string, unknown> | null | undefined) ?? null,
      content_i18n_json: (payload.content_i18n_json as Record<string, unknown> | null | undefined) ?? null,
      report_summary_i18n_json:
        (payload.report_summary_i18n_json as Record<string, unknown> | null | undefined) ?? null,
    };
  } catch {
    return null;
  }
}

function buildFallbackFaq(testTitle: string, minutes: number, questions: number, locale: "en" | "zh"): FAQItem[] {
  if (locale === "zh") {
    return [
      { q: `${testTitle} 需要多久？`, a: `大多数用户会在 ${minutes} 分钟左右完成。` },
      { q: "每道题都要回答吗？", a: `是的，完整结果依赖全部 ${questions} 题。` },
      { q: "可以重复测试吗？", a: "可以，你可以对比不同时间的结果变化。" },
      { q: "这是医疗诊断吗？", a: "不是。本测评仅用于自我认知，不替代专业医疗意见。" },
    ];
  }

  return [
    { q: `How long does ${testTitle} take?`, a: `Most people finish this test in about ${minutes} minutes.` },
    { q: "Do I need to answer every question?", a: `Yes. This assessment uses all ${questions} items for a complete profile.` },
    { q: "Can I retake the test?", a: "Yes. You can retake the test to compare results over time." },
    { q: "Is this a medical diagnosis?", a: "No. This is for self-discovery and does not replace medical advice." },
  ];
}

function alternatesForSlug(slug: string) {
  const en = `/en/tests/${slug}`;
  const zh = `/zh/tests/${slug}`;
  return {
    en,
    zh,
    "x-default": en,
  } as const;
}

export function generateStaticParams() {
  return getAllTests().flatMap((test) => [{ locale: "en", slug: test.slug }, { locale: "zh", slug: test.slug }]);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  const test = getTestBySlug(slug);

  if (!test) {
    return {
      title: "Not Found",
      robots: { index: false, follow: false },
    };
  }

  const locale = resolveLocale(localeParam);
  const lookup = await fetchLookup(slug, locale);
  const alternates = alternatesForSlug(test.slug);
  const canonical = localizedPath(`/tests/${test.slug}`, locale);

  const title = toStringValue(lookup?.seo_title) || test.title;
  const description = toStringValue(lookup?.seo_description) || test.description;
  const ogImage = toStringValue(lookup?.og_image_url) || test.cover_image;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: alternates,
    },
    robots: lookup?.is_indexable === false ? NOINDEX_ROBOTS : undefined,
    openGraph: {
      title,
      description,
      url: canonical,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function TestLandingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ maintenance?: string | string[] }>;
}) {
  const { locale: localeParam, slug } = await params;
  const query = await searchParams;
  const test = getTestBySlug(slug);
  if (!test) return notFound();

  const locale = resolveLocale(localeParam);
  const dict = getDictSync(locale);
  const lookup = await fetchLookup(slug, locale);

  const withLocale = (path: string) => localizedPath(path, locale);
  const langNode = toRecord(toRecord(lookup?.content_i18n_json)[locale]);
  const reportNode = toRecord(toRecord(lookup?.report_summary_i18n_json)[locale]);

  const landingCopy = toStringValue(langNode.landing_copy);
  const disclaimer = toStringValue(langNode.disclaimer);
  const reportSummary = toStringValue(reportNode.summary);
  const faqItems = parseFaq(langNode.faq);
  const mergedFaq = faqItems.length > 0 ? faqItems : buildFallbackFaq(test.title, test.time_minutes, test.questions_count, locale);
  const rollout = resolveRolloutState(lookup?.capabilities);
  const testDisabled = !rollout.enabledInProd || rollout.paywallMode === "off";
  const maintenanceRequested = ["1", "true", "yes"].includes(firstQueryValue(query.maintenance).toLowerCase());

  const packId = toStringValue(lookup?.pack_id) || test.scale_code || "BIG5_OCEAN";
  const dirVersion = toStringValue(lookup?.dir_version);
  const contentPackageVersion = toStringValue(lookup?.content_package_version);
  const manifestHash = await computeManifestHash({
    manifestHash: toStringValue(lookup?.manifest_hash) || null,
    packId,
    dirVersion: dirVersion || null,
    contentPackageVersion: contentPackageVersion || null,
  });

  const landingTrackingProps = {
    slug: test.slug,
    locale,
    scale_code: test.scale_code || "BIG5_OCEAN",
    pack_version: contentPackageVersion || dirVersion || packId,
    manifest_hash: manifestHash,
    norms_version: toStringValue(lookup?.norms_version) || "unavailable",
    quality_level: toStringValue(lookup?.quality_level) || "unrated",
    locked: true,
    variant: "free",
    sku_id: "",
  };

  const cardSpec = resolveCardSpec({
    slug: test.slug,
    scale_code: test.scale_code,
    card_visual: test.card_visual,
    card_tone: test.card_tone,
    card_seed: test.card_seed,
    card_density: test.card_density,
  });
  const cardTagline = (() => {
    const source = test.card_tagline_i18n;
    if (!source || typeof source !== "object") return test.scale_code || cardSpec.visual;
    const localized = locale === "zh" ? source.zh ?? source["zh-CN"] : source.en;
    if (typeof localized === "string" && localized.trim().length > 0) return localized.trim();
    return test.scale_code || cardSpec.visual;
  })();

  return (
    <Container as="main" className="pb-28 pt-10 lg:pb-10">
      <AnalyticsPageViewTracker eventName="landing_view" properties={landingTrackingProps} />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section className="space-y-4 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
              {locale === "zh" ? "人格测评" : "Personality Assessment"}
            </p>
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px] md:items-start">
              <div className="space-y-3">
                <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--fm-text-muted)]">
                  {cardTagline}
                </p>
                <h1 className="font-serif text-3xl font-semibold tracking-tight text-[var(--fm-text)] md:text-4xl">{test.title}</h1>
                <p className="max-w-3xl text-[var(--fm-text-muted)]">{landingCopy || test.description}</p>
                <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--fm-text-muted)]">
                  <span>{test.questions_count} {locale === "zh" ? "题" : "questions"}</span>
                  <span>•</span>
                  <span>{test.time_minutes} {locale === "zh" ? "分钟" : "minutes"}</span>
                  {test.scale_code ? (
                    <>
                      <span>•</span>
                      <span>{test.scale_code}</span>
                    </>
                  ) : null}
                </div>
              </div>
              <DataGlyph
                kind={cardSpec.visual}
                tone={cardSpec.tone}
                compact={cardSpec.density === "compact"}
                ariaLabel={dict.card.a11yVisualDescriptions[cardSpec.visual]}
                fallbackAriaLabel={dict.card.a11yVisualFallback}
                className="h-24 md:h-28"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {testDisabled ? (
                <span className={buttonVariants({ size: "lg", variant: "secondary" })}>
                  {locale === "zh" ? "维护中" : "Temporarily unavailable"}
                </span>
              ) : (
                <Link href={withLocale(`/tests/${test.slug}/take`)} prefetch className={buttonVariants({ size: "lg" })}>
                  {locale === "zh" ? "开始测试" : "Start test"}
                </Link>
              )}
              <Link href={withLocale("/tests")} className={buttonVariants({ variant: "outline", size: "lg" })}>
                {locale === "zh" ? "返回测试列表" : "Back to tests"}
              </Link>
            </div>
          </section>

          {rollout.paywallMode === "free_only" ? (
            <Card>
              <CardHeader>
                <CardTitle>{locale === "zh" ? "当前开放模式" : "Current availability"}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-700">
                {locale === "zh"
                  ? "当前仅开放免费报告预览，付费解锁暂未开放。"
                  : "Only the free report preview is available right now. Paid unlock is temporarily disabled."}
              </CardContent>
            </Card>
          ) : null}

          {maintenanceRequested ? (
            <Card>
              <CardHeader>
                <CardTitle>{locale === "zh" ? "当前维护中" : "Maintenance mode"}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-700">
                {locale === "zh"
                  ? "该测评当前暂停开放，请稍后再试。"
                  : "This assessment is temporarily unavailable. Please try again later."}
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>{locale === "zh" ? "你将获得什么" : "What to expect"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <p>{locale === "zh" ? "1. 在一次完整会话中完成问卷。" : "1. Complete the questionnaire in one focused sitting."}</p>
              <p>{locale === "zh" ? "2. 提交后立即查看结果摘要。" : "2. Submit answers and review the generated summary."}</p>
              <p>{locale === "zh" ? "3. 可按需解锁完整报告。" : "3. Optionally unlock the full report for deeper interpretation."}</p>
              <p>
                {locale === "zh"
                  ? "4. 免费版包含摘要与核心维度；完整版解锁刻面表、深度解读与行动建议。"
                  : "4. Free includes summary + core domains; full unlocks facet table, deep dive, and action plan."}
              </p>
            </CardContent>
          </Card>

          {reportSummary ? (
            <Card>
              <CardHeader>
                <CardTitle>{locale === "zh" ? "报告摘要" : "Report summary"}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-700">{reportSummary}</CardContent>
            </Card>
          ) : null}

          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">FAQ</h2>
            <FAQAccordion items={mergedFaq} />
          </section>

          {disclaimer ? (
            <Card>
              <CardHeader>
                <CardTitle>{locale === "zh" ? "免责声明" : "Disclaimer"}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-700">{disclaimer}</CardContent>
            </Card>
          ) : null}
        </div>

        <aside>
          <CTASticky
            slug={test.slug}
            title={test.title}
            questions={test.questions_count}
            minutes={test.time_minutes}
            locale={locale}
          />
        </aside>
      </div>
    </Container>
  );
}
