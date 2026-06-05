import Link from "next/link";
import { ArticleResponsiveImage } from "@/components/content/ArticleResponsiveImage";
import { CmsMediaAuthorityShell } from "@/components/marketing/CmsMediaAuthorityShell";
import { HeroHudArtwork } from "@/components/marketing/home/HeroHudArtwork";
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
const HERO_METRICS = ["模型视图", "维度映射", "结果结构", "隐私保护"] as const;

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

function CoreTestIcon({ item }: { item: HomeCoreTestItem }) {
  const key = getCoreTestKey(item);
  const common = {
    viewBox: "0 0 48 48",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-7 w-7",
    "aria-hidden": true,
  };

  if (key.includes("big-five")) {
    return (
      <svg {...common}>
        <path d="M10 12h28" />
        <path d="M10 20h28" />
        <path d="M10 28h28" />
        <path d="M10 36h28" />
        <circle cx="17" cy="12" r="3" fill="currentColor" stroke="none" />
        <circle cx="29" cy="20" r="3" fill="currentColor" stroke="none" />
        <circle cx="22" cy="28" r="3" fill="currentColor" stroke="none" />
        <circle cx="34" cy="36" r="3" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (key.includes("holland") || key.includes("riasec")) {
    return (
      <svg {...common}>
        <path d="M24 8v8" />
        <path d="M24 32v8" />
        <path d="M8 24h8" />
        <path d="M32 24h8" />
        <path d="m13 13 6 6" />
        <path d="m35 13-6 6" />
        <path d="m13 35 6-6" />
        <path d="m35 35-6-6" />
        <circle cx="24" cy="24" r="7" />
      </svg>
    );
  }

  if (key.includes("enneagram")) {
    return (
      <svg {...common}>
        <circle cx="24" cy="24" r="15" />
        <path d="M24 9 11 31h26L24 9Z" />
        <path d="M15 16 33 32" />
        <path d="M33 16 15 32" />
      </svg>
    );
  }

  if (key.includes("iq")) {
    return (
      <svg {...common}>
        <path d="M14 12h16l4 8-10 18-10-18 4-8Z" />
        <path d="M18 20h16" />
        <path d="M20 12 24 38" />
        <path d="M30 12 24 38" />
      </svg>
    );
  }

  if (key.includes("eq")) {
    return (
      <svg {...common}>
        <path d="M24 39s-14-8-14-20a8 8 0 0 1 14-5 8 8 0 0 1 14 5c0 12-14 20-14 20Z" />
        <path d="M16 24h5l3-7 4 14 3-7h5" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M18 10h12l8 8v12l-8 8H18l-8-8V18l8-8Z" />
      <path d="M17 18h16" />
      <path d="M17 24h16" />
      <path d="M17 30h10" />
    </svg>
  );
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

function HeroQuickStartPanel({ locale, copy, coreTests }: { locale: Locale; copy: HomePageContent; coreTests: HomeCoreTestItem[] }) {
  void copy;
  void coreTests;

  return (
    <HeroHudArtwork locale={locale} />
  );
}

function HomepageHeroV1({ locale, copy, coreTests = [] }: { locale: Locale; copy: HomePageContent; coreTests?: HomeCoreTestItem[] }) {
  void coreTests;
  const ctas = [
    { label: copy.hero.primaryCta, href: copy.hero.primaryHref, variant: "primary" },
    { label: copy.hero.secondaryCta, href: copy.hero.secondaryHref, variant: "secondary" },
    { label: copy.hero.tertiaryCta, href: copy.hero.tertiaryHref, variant: "tertiary" },
  ].filter((item) => hasText(item.label) && hasText(item.href));
  const trustRail = (copy.hero.trustRail ?? []).slice(0, 4);

  return (
    <section className="relative overflow-hidden bg-[#020b12] px-0 py-8 text-white md:py-10 lg:min-h-[34rem] lg:py-0">
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(rgba(86,111,126,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(86,111,126,0.14)_1px,transparent_1px)] bg-[size:28px_28px]" />
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_74%_48%,rgba(134,239,172,0.09),transparent_35%),radial-gradient(circle_at_18%_28%,rgba(86,111,126,0.07),transparent_32%)]" />
      <div aria-hidden className="absolute left-6 top-6 h-6 w-6 border-l-2 border-t-2 border-lime-300/80" />
      <div aria-hidden className="absolute right-6 top-6 h-6 w-6 border-r-2 border-t-2 border-lime-300/80" />
      <div aria-hidden className="absolute bottom-6 left-6 h-6 w-6 border-b-2 border-l-2 border-lime-300/80" />
      <div aria-hidden className="absolute bottom-6 right-6 h-6 w-6 border-b-2 border-r-2 border-lime-300/80" />

      <Container className="relative z-10 w-full max-w-[92rem] px-6 md:px-8 xl:px-12">
        <div className="grid min-h-[31rem] gap-10 lg:grid-cols-[minmax(24rem,0.78fr)_minmax(32rem,1.22fr)] lg:items-center">
          <div className="py-4 lg:py-9">
            {hasText(copy.hero.eyebrow) ? (
              <p className="m-0 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-lime-300">{copy.hero.eyebrow}</p>
            ) : null}
            <h1 className="m-0 mt-6 max-w-[42rem] text-balance break-words text-[3.1rem] font-black leading-[1.02] tracking-normal text-white drop-shadow-[0_3px_0_rgba(255,255,255,0.16)] sm:text-[4.2rem] lg:text-[4.05rem] xl:text-[5rem]">
              {copy.hero.title}
            </h1>
            <div aria-hidden className="mt-4 h-px w-32 bg-lime-300/50" />
            <p className="m-0 mt-4 max-w-xl text-base leading-7 text-slate-200 sm:text-lg sm:leading-8">
              {copy.hero.subhead}
            </p>
            {hasText(copy.hero.body) ? (
              <p className="m-0 mt-3 max-w-xl text-sm leading-6 text-slate-300 md:text-base">{copy.hero.body}</p>
            ) : null}

            <div className="mt-6 grid max-w-2xl grid-cols-2 gap-0 border border-lime-300/55 bg-slate-950/42 shadow-[0_0_24px_rgba(190,242,100,0.08)] xl:grid-cols-4">
              {HERO_METRICS.map((item, index) => (
                <div key={item} className={cn("flex min-h-16 items-center gap-3 px-4 py-3", index % 2 === 1 && "border-l border-lime-300/35", index > 1 && "border-t border-lime-300/35 xl:border-t-0", index > 0 && "xl:border-l")}>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-lime-300/70 text-lime-300">
                    <CoreTestIcon item={{ title: item, href: item, label: item }} />
                  </span>
                  <span>
                    <span className="block font-mono text-[0.62rem] uppercase tracking-[0.12em] text-slate-400">HUD</span>
                    <span className="text-sm font-semibold leading-tight text-lime-200">{item}</span>
                  </span>
                </div>
              ))}
            </div>

            {ctas.length > 0 ? (
              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                {ctas.map((item) => (
                  <Link
                    key={`${item.variant}-${item.href}`}
                    href={withLocale(locale, item.href)}
                    prefetch={false}
                    className={cn(
                      "inline-flex min-h-[3.25rem] items-center justify-center whitespace-nowrap border px-8 text-base font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-300",
                      item.variant === "primary" && "min-w-40 border-lime-300 bg-lime-300 text-slate-950 shadow-[0_0_22px_rgba(190,242,100,0.25)] hover:bg-lime-200",
                      item.variant === "secondary" && "min-w-40 border-slate-400/70 bg-slate-950/30 text-white hover:border-lime-300 hover:text-lime-200",
                      item.variant === "tertiary" && "min-w-40 border-slate-400/70 bg-slate-950/20 text-white hover:border-lime-300 hover:text-lime-200"
                    )}
                  >
                    {item.label}
                    {item.variant === "primary" ? <span aria-hidden className="ml-4">→</span> : null}
                  </Link>
                ))}
              </div>
            ) : null}

            {trustRail.length > 0 ? (
              <div className="mt-6 grid max-w-2xl grid-cols-2 gap-0 border border-lime-300/55 bg-slate-950/42 shadow-[0_0_24px_rgba(190,242,100,0.08)] xl:grid-cols-4">
                {trustRail.map((item, index) => (
                  <div key={item} className={cn("flex min-h-9 items-center gap-2 px-3 py-2", index > 0 && "border-l border-lime-300/25")}>
                    <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-lime-300" />
                    <span className="text-xs font-medium leading-tight text-slate-300">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <HeroQuickStartPanel locale={locale} copy={copy} coreTests={coreTests} />
        </div>
      </Container>
      {/* legacy contract marker only, not rendered: min-h-[34rem] overflow-hidden bg-orange-50 / rounded-[100%] bg-white */}
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

function HomepageTrustStripV1({ locale, copy }: { locale: Locale; copy: HomePageContent }) {
  const trustItems = (copy.trust.items ?? []).filter((item) => !containsUnverifiedSocialProofText(item.title, item.summary));
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
  const displayTrustItems = [...trustItems.slice(0, 2), testCompletionTrustItem].slice(0, 3);

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
      <Container className="max-w-[86rem] px-6 md:px-8">
        <div className="bg-[#008aa3] px-8 py-14 text-white md:px-12 lg:px-16 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2
              id="homepage-core-tests-title"
              className="m-0 text-3xl font-semibold tracking-normal text-white md:text-4xl"
            >
              {getCoreTestsSectionTitle(locale)}
            </h2>
          </div>
          <div className="mt-12 grid gap-x-8 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
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

function ArticleVisual({ index, title }: { index: number; title: string }) {
  const palettes = [
    "from-orange-100 via-slate-100 to-teal-100",
    "from-sky-100 via-orange-50 to-slate-100",
    "from-teal-100 via-sky-50 to-orange-100",
    "from-rose-100 via-orange-50 to-slate-100",
    "from-blue-100 via-teal-50 to-orange-100",
    "from-slate-100 via-orange-50 to-sky-100",
  ];

  return (
    <div className={cn("relative h-40 overflow-hidden bg-gradient-to-br", palettes[index % palettes.length])}>
      <div aria-hidden className="absolute -left-8 top-8 h-28 w-28 rounded-full bg-white/55" />
      <div aria-hidden className="absolute right-6 top-5 h-20 w-20 rounded-full border border-white/70" />
      <div aria-hidden className="absolute bottom-0 right-0 h-20 w-40 rounded-tl-full bg-white/45" />
      <p className="absolute bottom-5 left-5 right-5 m-0 text-sm font-semibold leading-5 text-slate-700">
        {title}
      </p>
    </div>
  );
}

function getArticleVisualTitle(article: HomeArticle, locale: Locale): string {
  return (
    article.tags[0]?.name ||
    article.category?.name ||
    (locale === "zh" ? "文章" : "Article")
  );
}

function ArticleCoverVisual({ article, index, locale }: { article: HomeArticle; index: number; locale: Locale }) {
  if (!article.coverImageUrl) {
    return <ArticleVisual index={index} title={getArticleVisualTitle(article, locale)} />;
  }

  return (
    <ArticleResponsiveImage
      src={article.coverImageUrl}
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
                <ArticleCoverVisual article={article} index={index} locale={locale} />
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
      <HomepageHeroV1 locale={locale} copy={copy} coreTests={listCoreHomepageTests(copy, supplementalTests)} />
      <HomepageHighlightedTestsBanner locale={locale} copy={copy} supplementalTests={supplementalTests} />
      <HomepageTrustStripV1 locale={locale} copy={copy} />
      <HomepageFamilyMatrix locale={locale} copy={copy} />
      <HomepageArticlesBanner locale={locale} articles={articles} />
    </div>
  );
}
