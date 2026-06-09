import Link from "next/link";
import { ArticleResponsiveImage } from "@/components/content/ArticleResponsiveImage";
import { CmsMediaAuthorityShell } from "@/components/marketing/CmsMediaAuthorityShell";
import { Container } from "@/components/layout/Container";
import type { CmsArticle } from "@/lib/cms/articles";
import { localizedPath, stripLocalePrefix, type Locale } from "@/lib/i18n/locales";
import type { HomePageContent } from "@/lib/marketing/homepageContent";
import type { HubTestCardItem } from "@/lib/marketing/testsHubContent";
import { extractTestSlugFromEntryHref, filterVisiblePublicTestEntries } from "@/lib/tests/publicTestEntryVisibility";
import { IQ_PUBLIC_SLUG } from "@/lib/iq/constants";
import { cn } from "@/lib/utils";

type HomeLink = HomePageContent["quickStart"]["items"][number];
type HomeCoreTestItem = HomeLink & {
  questionsLabel?: string;
  durationLabel?: string;
  outputLabel?: string;
};
type TrustItem = HomePageContent["trust"]["items"][number];
type HomeArticle = CmsArticle;

const ARTICLE_AUTHOR_NAME = "Fermat Institute";
const PRIORITY_TEST_SLUG_GROUPS = [
  ["mbti-personality-test-16-personality-types"],
  ["big-five-personality-test-ocean-model"],
  ["holland-career-interest-test-riasec", "career-riasec"],
] as const;
const RIASEC_CANONICAL_TEST_PATH = "/tests/holland-career-interest-test-riasec";
const RIASEC_LEGACY_TEST_PATHS = ["/tests/career-riasec", "/zh/tests/career-riasec", "/en/tests/career-riasec"] as const;
const UNVERIFIED_SOCIAL_PROOF_PATTERNS = [
  /\d+\s*(?:万|百万|千万|亿)/i,
  /(?:百万|千万|上万|数万)\s*(?:用户|人|次)/i,
  /(?:用户|人)\s*(?:进行了|完成了|使用了)\s*(?:多次|测试|测评)/i,
  /(?:媒体|专家|博士|权威|评分|review|rating|stars?)/i,
] as const;
function withLocale(locale: Locale, path: string): string {
  return localizedPath(stripLocalePrefix(path), locale);
}

function hasText(value: string | null | undefined): value is string {
  return Boolean(value?.trim());
}

function getPriorityIndex(item: { href?: string | null; key?: string | null }): number {
  const raw = `${item.key ?? ""} ${item.href ?? ""}`.toLowerCase();
  const index = PRIORITY_TEST_SLUG_GROUPS.findIndex((aliases) => aliases.some((slug) => raw.includes(slug)));
  return index === -1 ? Number.POSITIVE_INFINITY : index;
}

function orderPriorityFirst<T extends { href?: string | null; key?: string | null }>(items: T[]): T[] {
  return [...items].sort((a, b) => getPriorityIndex(a) - getPriorityIndex(b));
}

function normalizeCoreTestHref(href: string): string {
  if (RIASEC_LEGACY_TEST_PATHS.includes(href as (typeof RIASEC_LEGACY_TEST_PATHS)[number])) {
    return RIASEC_CANONICAL_TEST_PATH;
  }

  const stripped = stripLocalePrefix(href);
  const takePathMatch = stripped.match(/^\/tests\/([^/?#]+)\/take(?:[/?#].*)?$/);

  if (takePathMatch?.[1]) {
    return `/tests/${takePathMatch[1]}`;
  }

  return stripped;
}

function getCoreTestKey(item: { href?: string | null; key?: string | null; title?: string | null }): string {
  const href = normalizeCoreTestHref(item.href ?? "");
  const slug = extractTestSlugFromEntryHref(href);

  if (slug === "career-riasec") return "holland-career-interest-test-riasec";
  return slug ?? item.key ?? item.title ?? href;
}

function getHubCardAction(item: HubTestCardItem): { href: string; label: string } | null {
  const href = item.detailsHref ?? item.href;
  const label = item.primaryLabel || item.primaryActions?.[0]?.label;

  if (!hasText(href) || !hasText(label)) return null;
  return { href: normalizeCoreTestHref(href), label };
}

function homeLinkFromHubCard(item: HubTestCardItem): HomeCoreTestItem | null {
  const action = getHubCardAction(item);

  if (!action) return null;

  return {
    key: item.key,
    title: item.title,
    description: item.description,
    href: action.href,
    label: action.label,
    meta: item.outputLabel || item.durationLabel || item.questionsLabel,
    questionsLabel: item.questionsLabel,
    durationLabel: item.durationLabel,
    outputLabel: item.outputLabel,
    media: item.media,
  };
}

function listCoreHomepageTests(copy: HomePageContent, supplementalTests: HubTestCardItem[]): HomeCoreTestItem[] {
  const seen = new Set<string>();
  const items: HomeCoreTestItem[] = [];
  const supplementalByKey = new Map<string, HomeCoreTestItem>();
  const supplementalLinks = supplementalTests.map(homeLinkFromHubCard).filter((item): item is HomeCoreTestItem => Boolean(item));

  for (const item of supplementalLinks) {
    supplementalByKey.set(getCoreTestKey(item), item);
  }

  const candidates: HomeCoreTestItem[] = [
    ...(copy.quickStart.items ?? []).map((item) => {
      const normalized = { ...item, href: normalizeCoreTestHref(item.href) };
      const supplemental = supplementalByKey.get(getCoreTestKey(normalized));

      return {
        ...normalized,
        questionsLabel: supplemental?.questionsLabel,
        durationLabel: supplemental?.durationLabel,
        outputLabel: supplemental?.outputLabel ?? item.meta,
        media: item.media ?? supplemental?.media,
      };
    }),
    ...supplementalLinks,
  ];

  for (const item of orderPriorityFirst(filterVisiblePublicTestEntries(candidates))) {
    const key = getCoreTestKey(item);
    if (seen.has(key)) continue;
    seen.add(key);
    items.push(item);
    if (items.length >= 6) break;
  }

  return items;
}

function containsUnverifiedSocialProofText(...values: Array<string | null | undefined>): boolean {
  const text = values.filter(hasText).join(" ");
  return UNVERIFIED_SOCIAL_PROOF_PATTERNS.some((pattern) => pattern.test(text));
}

function uniqueHomeLinks<T extends { href: string; title: string }>(links: T[]): T[] {
  const seen = new Set<string>();
  const items: T[] = [];

  for (const link of links) {
    const key = `${stripLocalePrefix(link.href)}:${link.title}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    items.push(link);
  }

  return items;
}

function getCoreMetaItems(item: HomeCoreTestItem): string[] {
  const values = [item.questionsLabel, item.durationLabel, item.outputLabel, item.meta].filter(hasText);
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    if (seen.has(value)) continue;
    seen.add(value);
    result.push(value);
    if (result.length >= 3) break;
  }

  return result;
}

function HomepageHeroV1({ locale, copy }: { locale: Locale; copy: HomePageContent }) {
  const ctas = [
    { label: copy.hero.primaryCta, href: copy.hero.primaryHref, variant: "primary" },
  ].filter((item) => hasText(item.label) && hasText(item.href));

  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-[#f7f5ef] px-0 pb-12 pt-24 text-slate-950 md:pb-16 md:pt-28 lg:pb-20 lg:pt-32">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-slate-200" />

      <Container className="relative z-10 w-full max-w-[88rem] px-6 md:px-8 xl:px-12">
        <div className="max-w-3xl">
          <h1 className="m-0 max-w-[12ch] text-balance break-words text-[3.25rem] font-semibold leading-[1.02] tracking-normal text-slate-950 sm:text-[4.25rem] lg:text-[4.8rem]">
            {copy.hero.title}
          </h1>
          <div aria-hidden className="mt-6 h-px w-28 bg-[#087d8d]" />
          <p className="m-0 mt-6 max-w-2xl text-lg leading-8 text-slate-700">
            {copy.hero.subhead}
          </p>
          {ctas.length > 0 ? (
            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              {ctas.map((item) => (
                <Link
                  key={`${item.variant}-${item.href}`}
                  href={withLocale(locale, item.href)}
                  prefetch={false}
                  className={cn(
                    "inline-flex min-h-[3.1rem] items-center justify-center whitespace-nowrap border px-7 text-base font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087d8d]",
                    item.variant === "primary" && "min-w-40 border-[#087d8d] bg-[#087d8d] text-white shadow-[0_14px_30px_rgba(8,125,141,0.18)] hover:bg-[#056f7c]",
                    item.variant === "secondary" && "min-w-40 border-slate-300 bg-white text-slate-950 hover:border-[#087d8d] hover:text-[#087d8d]",
                    item.variant === "tertiary" && "min-w-40 border-slate-300 bg-white text-slate-950 hover:border-[#087d8d] hover:text-[#087d8d]"
                  )}
                >
                  {item.label}
                  {item.variant === "primary" ? <span aria-hidden className="ml-4">→</span> : null}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}

function TrustIcon({ index }: { index: number }) {
  const iconClassName = "h-7 w-7 text-lime-700";
  const commonProps = {
    viewBox: "0 0 80 80",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: iconClassName,
    "aria-hidden": true,
  };

  if (index === 1) {
    return (
      <svg {...commonProps}>
        <path d="M40 8 64 17v18c0 17.5-10.5 29.5-24 36-13.5-6.5-24-18.5-24-36V17l24-9Z" />
        <path d="M30 37v-6c0-6 4-10 10-10s10 4 10 10v6" />
        <rect x="28" y="36" width="24" height="20" rx="3" />
        <path d="M40 44v6" />
      </svg>
    );
  }

  if (index === 2) {
    return (
      <svg {...commonProps}>
        <circle cx="40" cy="25" r="9" />
        <path d="M25 64v-8c0-9 6-16 15-16s15 7 15 16v8" />
        <circle cx="20" cy="32" r="7" />
        <path d="M8 63v-6c0-7 5-12 12-12 4 0 7 1.5 9 4" />
        <circle cx="60" cy="32" r="7" />
        <path d="M72 63v-6c0-7-5-12-12-12-4 0-7 1.5-9 4" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <rect x="15" y="24" width="50" height="36" rx="2.5" />
      <path d="M30 24v-7h20v7" />
      <path d="M15 37h18" />
      <path d="M47 37h18" />
      <path d="M37 37h6" />
      <path d="M40 34c-3 0-5 2.4-5 5.2 0 2.2 1.3 4 3.1 4.8v8h3.8v-8c1.8-.8 3.1-2.6 3.1-4.8 0-2.8-2-5.2-5-5.2Z" />
      <path d="M20 60h40" />
    </svg>
  );
}

function TrustCard({ item, index }: { item: TrustItem; index: number }) {
  return (
    <article className="flex min-h-[18rem] flex-col items-center justify-center rounded-md bg-white px-8 py-10 text-center shadow-[0_18px_45px_rgba(15,23,42,0.10)]">
      <TrustIcon index={index} />
      <h3 className="m-0 mt-7 text-xl font-semibold leading-7 tracking-normal text-slate-950">{item.title}</h3>
      <p className="m-0 mt-4 max-w-[22rem] text-base font-normal leading-7 tracking-normal text-slate-600">
        {item.summary}
      </p>
    </article>
  );
}

const removedHomepageTrustTitles = new Set([
  "结果结构清晰",
  "方法边界透明",
  "可匿名开始",
  "Clear result structure",
  "Transparent method boundaries",
  "Start anonymously",
]);

function isRemovedHomepageTrustItem(item: TrustItem) {
  return removedHomepageTrustTitles.has(item.title);
}

function getDefaultHomepageTrustItems(locale: Locale, copy: HomePageContent): TrustItem[] {
  if (locale === "zh") {
    return [
      {
        title: "免费测试、免费结果",
        summary: "核心测评围绕自我认知、职业判断与能力成长设计，并提供清晰结果。",
        paragraphs: [],
        href: copy.trust.methodHref,
        hrefLabel: copy.trust.methodLabel,
      },
      {
        title: "我们高度重视您的隐私。",
        summary: "无需先注册账号，你可以先完成测试，再决定是否保存或继续深入。",
        paragraphs: [],
        href: copy.trust.methodHref,
        hrefLabel: copy.trust.methodLabel,
      },
    ];
  }

  return [
    {
      title: "Free to start",
      summary: "Core assessments support self-reflection, career judgment, and personal growth with clear result summaries.",
      paragraphs: [],
      href: copy.trust.methodHref,
      hrefLabel: copy.trust.methodLabel,
    },
    {
      title: "Privacy matters",
      summary: "You can complete a test before deciding whether to save your result or continue deeper.",
      paragraphs: [],
      href: copy.trust.methodHref,
      hrefLabel: copy.trust.methodLabel,
    },
  ];
}

function HomepageTrustStripV1({ locale, copy }: { locale: Locale; copy: HomePageContent }) {
  const trustItems = (copy.trust.items ?? []).filter(
    (item) => !containsUnverifiedSocialProofText(item.title, item.summary) && !isRemovedHomepageTrustItem(item)
  );
  const baseTrustItems = trustItems.length >= 2 ? trustItems.slice(0, 2) : getDefaultHomepageTrustItems(locale, copy);
  const testCompletionTrustItem: TrustItem = {
    title: locale === "zh" ? "百万人测试" : "Million-plus test takers",
    summary:
      locale === "zh"
        ? "后台统计显示，4 月真人测试人数达 120 万，累计测试交互超过 5000 万次。"
        : "Backend statistics show 1.2M real test takers in April and 50M+ cumulative test interactions.",
    paragraphs: [],
    href: copy.trust.methodHref,
    hrefLabel: copy.trust.methodLabel,
  };
  const displayTrustItems = [...baseTrustItems.slice(0, 2), testCompletionTrustItem].slice(0, 3);

  if (displayTrustItems.length === 0) return null;

  return (
    <section className="relative z-20 border-b border-slate-100 bg-white py-20 md:py-24" aria-label={copy.trust.title}>
      <Container className="max-w-[82rem] px-6 md:px-8">
        <div className="grid gap-7 md:grid-cols-3">
          {displayTrustItems.map((item, index) => (
            <TrustCard key={item.title} item={item} index={index} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function getCoreTestDisplayTitle(locale: Locale, item: HomeCoreTestItem): string {
  if (locale !== "zh") return item.title;

  const key = getCoreTestKey(item);

  if (key === "big-five-personality-test-ocean-model") return "大五人格测试";
  if (key === IQ_PUBLIC_SLUG) return "智商测试";

  return item.title;
}

function getCoreTestAccessibleTitle(locale: Locale, item: HomeCoreTestItem): string | undefined {
  if (locale !== "zh") return undefined;
  return getCoreTestKey(item) === IQ_PUBLIC_SLUG ? "IQ 智商测试" : undefined;
}

function RecommendationStars() {
  return (
    <span className="flex shrink-0 items-center gap-0.5 text-sm text-[#f2a03a]" aria-label="推荐指数 5 星">
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index} aria-hidden>
          ★
        </span>
      ))}
    </span>
  );
}

function getCoreTestsSectionTitle(locale: Locale): string {
  return locale === "zh" ? "热门测评" : "Highlighted tests";
}

function getCoreTestIntroCopy(locale: Locale, item: HomeCoreTestItem, title: string): { card: string; detail: string; action: string } {
  const key = getCoreTestKey(item);

  if (locale === "zh") {
    if (key.includes("mbti")) {
      return {
        card: "想了解自己的性格吗？看看你的偏好、沟通方式和决策风格。",
        detail: "MBTI 性格测试帮助你理解日常选择、互动方式和团队协作中的偏好，适合作为自我了解和沟通参考。",
        action: "开始 MBTI 测试。",
      };
    }

    if (key.includes("big-five")) {
      return {
        card: "想知道你的稳定特质吗？从五个维度了解你平时如何行动和反应。",
        detail: "大五人格测试围绕开放性、尽责性、外向性、宜人性和情绪稳定性，帮助你获得更连续的特质视角。",
        action: "开始大五人格测试。",
      };
    }

    if (key.includes("holland") || key.includes("riasec")) {
      return {
        card: "想知道什么工作更吸引你吗？看看你的兴趣类型和偏好的工作环境。",
        detail: "霍兰德职业兴趣测试用 RIASEC 类型帮助你比较职业方向、学习选择和工作环境偏好。",
        action: "开始霍兰德测试。",
      };
    }

    if (key.includes("enneagram")) {
      return {
        card: "你的核心动机是什么？看看压力、关系和成长中的常见反应模式。",
        detail: "九型人格测试帮助你从动机和行为模式理解自己，适合用于关系反思和个人成长参考。",
        action: "开始九型人格测试。",
      };
    }

    if (key.includes("iq")) {
      return {
        card: "想练习推理能力吗？完成视觉与数字题，获得一份清晰的原始分参考。",
        detail: "智商测试包含视觉和数字推理练习，适合在常模权威上线前作为能力训练与原始分参考。",
        action: "开始智商测试。",
      };
    }

    if (key.includes("eq")) {
      return {
        card: "想了解情绪和关系能力吗？看看你在理解、表达和协作中的常见模式。",
        detail: "情商测试关注情绪识别、沟通表达和关系协作，帮助你获得更清晰的互动参考。",
        action: "开始情商测试。",
      };
    }

    return {
      card: item.description || `了解 ${title} 如何帮助你认识自己。`,
      detail: item.description || `${title} 提供一个清晰的测评入口，帮助你继续探索自己的偏好与下一步。`,
      action: "开始测试。",
    };
  }

  if (key.includes("mbti")) {
    return {
      card: "What is your personality style? Learn how your preferences shape choices and communication.",
      detail: "The MBTI personality test helps you understand everyday preferences, interaction style, and teamwork patterns as a self-reflection tool.",
      action: "Take the MBTI test.",
    };
  }

  if (key.includes("big-five")) {
    return {
      card: "What are your stable traits? Explore how you tend to act and respond across five dimensions.",
      detail: "The Big Five test looks at openness, conscientiousness, extraversion, agreeableness, and emotional stability for a trait-based view.",
      action: "Take the Big Five test.",
    };
  }

  if (key.includes("holland") || key.includes("riasec")) {
    return {
      card: "What kind of work interests you? Compare your interests with work environments and roles.",
      detail: "The Holland / RIASEC test helps you explore career directions, study choices, and work environments that may fit your interests.",
      action: "Take the Holland Code test.",
    };
  }

  if (key.includes("enneagram")) {
    return {
      card: "What motivates your patterns? Explore common reactions in stress, relationships, and growth.",
      detail: "The Enneagram test helps you reflect on motivation and behavior patterns for personal growth and relationship awareness.",
      action: "Take the Enneagram test.",
    };
  }

  if (key.includes("iq")) {
    return {
      card: "Want to practice reasoning? Work through visual and numerical questions with clear raw-score feedback.",
      detail: "The IQ test offers visual and numerical reasoning practice as training and raw-score reference before normed reporting is available.",
      action: "Take the IQ test.",
    };
  }

  if (key.includes("eq")) {
    return {
      card: "How do you handle emotions and relationships? Explore patterns in awareness and communication.",
      detail: "The EQ test focuses on emotion recognition, expression, and collaboration skills for clearer interpersonal reflection.",
      action: "Take the EQ test.",
    };
  }

  return {
    card: item.description || `Explore how ${title} can help you understand yourself.`,
    detail: item.description || `${title} gives you a clear assessment entry point for self-understanding and next-step reflection.`,
    action: "Take the test.",
  };
}

function TestFeatureCard({ locale, item, priority, index }: { locale: Locale; item: HomeCoreTestItem; priority: boolean; index: number }) {
  const href = withLocale(locale, item.href);
  const metaItems = getCoreMetaItems(item);
  const title = getCoreTestDisplayTitle(locale, item);
  const accessibleTitle = getCoreTestAccessibleTitle(locale, item);
  const intro = getCoreTestIntroCopy(locale, item, title);
  void priority;
  void index;

  return (
    <article className="grid gap-4">
      <Link href={href} prefetch={false} className="group block rounded-md bg-white px-5 py-5 text-slate-950 shadow-[0_10px_28px_rgba(15,23,42,0.14)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(15,23,42,0.18)]">
        <div className="flex items-start justify-between gap-4">
          <h3 aria-label={accessibleTitle} className="m-0 text-lg font-semibold leading-6 tracking-normal text-[#007c9b] underline underline-offset-4 transition group-hover:text-slate-950">
            {title}
          </h3>
          <RecommendationStars />
        </div>
        <p className="m-0 mt-5 text-base font-normal leading-7 tracking-normal text-slate-700">
          {intro.card}{" "}
          <span className="text-[#007c9b] underline underline-offset-4">{intro.action}</span>
        </p>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm font-medium text-slate-500">
          {metaItems.slice(0, 2).map((meta) => (
            <span key={meta}>{meta}</span>
          ))}
        </div>
      </Link>
      <p className="m-0 text-base font-normal leading-7 tracking-normal text-white">
        {intro.detail}
      </p>
      <div className="sr-only">
        <CmsMediaAuthorityShell
          media={item.media ?? null}
          locale={locale}
          surface="home_quick_start"
          visible={item.href.includes(IQ_PUBLIC_SLUG) || item.key === IQ_PUBLIC_SLUG}
        />
      </div>
    </article>
  );
}

function HomepageHighlightedTestsBanner({
  locale,
  copy,
  supplementalTests,
}: {
  locale: Locale;
  copy: HomePageContent;
  supplementalTests: HubTestCardItem[];
}) {
  const items = listCoreHomepageTests(copy, supplementalTests);

  if (items.length === 0) return null;

  return (
    <section className="bg-white py-20 md:py-24" aria-labelledby="homepage-core-tests-title">
      <Container className="max-w-[82rem] px-6 md:px-8">
        <div className="relative overflow-hidden bg-[#078c9d] px-8 py-14 text-white shadow-[0_28px_70px_rgba(15,23,42,0.12)] md:px-12 lg:px-16 lg:py-20">
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0)_34%),radial-gradient(circle_at_22%_0%,rgba(255,255,255,0.14),transparent_32rem)]" />
          <div className="relative mx-auto max-w-3xl text-center">
            <h2
              id="homepage-core-tests-title"
              className="m-0 text-3xl font-semibold tracking-normal text-white md:text-4xl"
            >
              {getCoreTestsSectionTitle(locale)}
            </h2>
          </div>
          <div className="relative mt-12 grid gap-x-8 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
            {items.slice(0, 6).map((item, index) => (
              <TestFeatureCard
                key={getCoreTestKey(item)}
                locale={locale}
                item={item}
                index={index}
                priority={getPriorityIndex(item) !== Number.POSITIVE_INFINITY}
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

function HomepageFamilyMatrix({ locale, copy }: { locale: Locale; copy: HomePageContent }) {
  const families = (copy.families.items ?? [])
    .map((family) => ({
      ...family,
      links: uniqueHomeLinks(filterVisiblePublicTestEntries(family.links ?? [])),
    }))
    .filter((family) => hasText(family.title));

  if (families.length === 0) return null;

  return (
    <section className="bg-white py-20 md:py-24" aria-labelledby="homepage-family-title">
      <Container className="max-w-[82rem] px-6 md:px-8">
        <div className="relative overflow-hidden bg-[#d88a2e] px-8 pb-20 pt-16 text-white md:px-12 lg:px-16">
          <div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,rgba(216,138,46,0.92),rgba(216,138,46,0.78)),radial-gradient(circle_at_18%_10%,rgba(255,255,255,0.22),transparent_30%)]" />
          <div className="relative mx-auto max-w-3xl text-center">
            <h2 id="homepage-family-title" className="m-0 text-3xl font-semibold tracking-normal text-white md:text-4xl">
              {copy.families.title}
            </h2>
          </div>
        </div>
        <div className="relative z-10 mx-auto -mt-12 grid max-w-[72rem] gap-7 md:grid-cols-3">
          {families.slice(0, 3).map((family, index) => {
            const display =
              index === 0
                ? {
                    title: locale === "zh" ? "公益计划" : "Public benefit",
                    description:
                      locale === "zh"
                        ? "了解费马测试的公共利益页面与公益记录边界。"
                        : "Review FermatMind's public-benefit page and giving-record boundaries.",
                    links: [{ href: "/foundation", title: locale === "zh" ? "查看公共利益" : "View public benefit" }],
                  }
                : index === 2
                  ? {
                      title: locale === "zh" ? "研究与方法" : "Research & Methods",
                      description:
                        locale === "zh"
                          ? "查看测评方法、题目设计、数据说明与边界。"
                          : "Review assessment methods, item design, data notes, and boundaries.",
                      links: [{ href: "/method-boundaries", title: locale === "zh" ? "查看方法边界" : "View method boundaries" }],
                    }
                  : {
                      title: locale === "zh" ? "博士团队" : "Doctoral team",
                      description:
                        locale === "zh"
                          ? "专业团队参与测评方法、题目设计与边界复核。"
                          : "A specialist team reviews assessment methods, item design, and boundaries.",
                      links: [{ href: "/about", title: locale === "zh" ? "了解团队" : "Meet the team" }],
                    };

            return (
              <article key={`${family.title}-${index}`} className="flex min-h-[18rem] flex-col items-center rounded-md bg-white px-8 py-9 text-center shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
                <span className="grid h-16 w-16 place-items-center rounded-full border-2 border-[#008aa3] text-[#008aa3]" aria-hidden>
                  <TrustIcon index={index} />
                </span>
                <h3 className="m-0 text-lg font-semibold text-slate-950">{display.title}</h3>
                <p className="m-0 mt-4 text-base leading-7 text-slate-600">{display.description}</p>
                {display.links.length > 0 ? (
                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    {display.links.slice(0, 1).map((item) => (
                      <Link key={`${display.title}-${item.title}`} href={withLocale(locale, item.href)} prefetch={false} className="text-sm font-medium text-[#0087a5] underline underline-offset-4 hover:text-slate-950">
                        {item.title}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

function ArticleCoverVisual({ article }: { article: HomeArticle }) {
  return (
    <ArticleResponsiveImage
      src={article.coverImageUrl ?? null}
      alt={article.coverImageAlt ?? article.title}
      width={article.coverImageWidth}
      height={article.coverImageHeight}
      variants={article.coverImageVariants}
      mode="card"
      className="h-40"
    />
  );
}

function getArticleDisplayDate(article: HomeArticle, locale: Locale): string {
  const value = article.publishedAt ?? article.updatedAt ?? article.createdAt;
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  if (locale === "zh") {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  }

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function HomepageArticlesBanner({ locale, articles }: { locale: Locale; articles: HomeArticle[] }) {
  const visibleArticles = articles.slice(0, 6);

  if (visibleArticles.length === 0) {
    return null;
  }

  const labels =
    locale === "zh"
      ? { title: "推荐阅读", all: "查看全部文章", author: "作者：" }
      : { title: "Recommended reading", all: "View all articles", author: "By " };

  return (
    <section className="bg-white py-20 md:py-24" aria-labelledby="homepage-articles-title">
      <Container className="max-w-6xl px-6 md:px-8 lg:px-10">
        <div className="text-center">
          <h2
            id="homepage-articles-title"
            className="m-0 text-4xl font-semibold tracking-[-0.055em] text-slate-950 md:text-5xl"
          >
            {labels.title}
          </h2>
        </div>

        <div className="mt-12 grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {visibleArticles.map((article, index) => (
            <article key={`${article.slug}-${article.locale}`} className="group">
              <Link href={withLocale(locale, `/articles/${article.slug}`)} prefetch={false} className="block">
                <ArticleCoverVisual article={article} />
                <h3 className="m-0 mt-5 text-3xl font-normal leading-tight tracking-[-0.055em] text-slate-900 transition group-hover:text-teal-800">
                  {article.title}
                </h3>
              </Link>
              <p className="m-0 mt-5 text-sm leading-6 text-slate-500">
                {labels.author}
                <span className="text-slate-700">{ARTICLE_AUTHOR_NAME}</span>
              </p>
              <p className="m-0 mt-1 text-sm text-slate-400">{getArticleDisplayDate(article, locale)}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href={withLocale(locale, "/articles")}
            prefetch={false}
            className="inline-flex rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-800 transition hover:border-teal-700 hover:text-teal-800"
          >
            {labels.all}
          </Link>
        </div>
      </Container>
    </section>
  );
}

function HomepageCookieBannerGuard() {
  return (
    <style>{`
      main.fm-homepage ~ [data-visual-volatile="true"] {
        left: auto;
        right: 1rem;
        width: min(360px, calc(100% - 2rem));
        border-radius: 0.75rem;
        padding: 0.75rem;
      }

      main.fm-homepage ~ [data-visual-volatile="true"] p {
        font-size: 0.8125rem;
        line-height: 1.45;
      }

      main.fm-homepage ~ [data-visual-volatile="true"] div {
        margin-top: 0.625rem;
      }

      .homepage-core-grid {
        grid-template-columns: 1fr;
      }

      @media (min-width: 768px) {
        .homepage-core-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        }
      }

      @media (min-width: 1024px) {
        .homepage-core-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
        }
      }
    `}</style>
  );
}

export function HomePageExperience({
  locale,
  copy,
  articles = [],
  supplementalTests = [],
}: {
  locale: Locale;
  copy: HomePageContent;
  articles?: HomeArticle[];
  supplementalTests?: HubTestCardItem[];
}) {
  return (
    <div className="bg-[#f7f5ef] text-slate-950">
      <HomepageCookieBannerGuard />
      <HomepageHeroV1 locale={locale} copy={copy} />
      <HomepageHighlightedTestsBanner locale={locale} copy={copy} supplementalTests={supplementalTests} />
      <HomepageTrustStripV1 locale={locale} copy={copy} />
      <HomepageFamilyMatrix locale={locale} copy={copy} />
      <HomepageArticlesBanner locale={locale} articles={articles} />
    </div>
  );
}
