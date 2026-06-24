import { GraduationCap, HeartHandshake, Microscope } from "lucide-react";
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

const HOMEPAGE_HERO_ASSETS = {
  brain: "https://static.lingcecdn.com/www/myfunquizcom/assets/img/home/top.png",
  users: [
    "https://static.lingcecdn.com/www/myfunquizcom/_nuxt/user-group-1.DxbeeUB9.png",
    "https://static.lingcecdn.com/www/myfunquizcom/_nuxt/user-group-2.BTUn3P5c.png",
    "https://static.lingcecdn.com/www/myfunquizcom/_nuxt/user-group-3.B4iLBcTY.png",
  ],
} as const;

const HOMEPAGE_HERO_COPY = {
  zh: {
    title: "看清自己，走好每一步",
    subhead: "费马测试把自我认知、职业探索与能力成长，做成可测量、可训练、可复盘的成长系统。",
    primaryCta: "免费测试",
    socialProofCount: "1200000+",
    socialProof: "累计测试人数",
  },
  en: {
    title: "Know yourself, move with clarity",
    subhead: "FermatMind turns self-understanding, career exploration, and ability growth into a measurable, trainable, reviewable system.",
    primaryCta: "Take a free test",
    socialProofCount: "1200000+",
    socialProof: "people tested",
  },
} as const;

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
  const heroCopy = HOMEPAGE_HERO_COPY[locale];
  const titleSegments =
    locale === "zh" && heroCopy.title.includes("，")
      ? heroCopy.title.split("，").map((segment, index, segments) => (index < segments.length - 1 ? `${segment}，` : segment))
      : null;
  const ctas = [
    { label: heroCopy.primaryCta || copy.hero.primaryCta, href: copy.hero.primaryHref, variant: "primary" },
  ].filter((item) => hasText(item.label) && hasText(item.href));

  return (
    <section
      className="relative overflow-hidden border-b border-[var(--fm-border-soft)] text-[#333]"
      style={{
        background:
          "radial-gradient(circle at 76% 34%, rgba(180,151,255,0.16) 0%, rgba(180,151,255,0.08) 30%, rgba(247,248,245,0) 56%), linear-gradient(112deg, #f7f8f5 0%, #faf8f1 54%, #f7f3fb 100%)",
      }}
    >
      <Container className="relative z-10 grid min-h-[41rem] w-full max-w-[82rem] items-center gap-10 px-6 py-14 md:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(24rem,34rem)] lg:py-20">
        <div className="mx-auto w-full max-w-[43rem] text-center lg:mx-0 lg:text-left">
          <h1
            aria-label={heroCopy.title}
            className="m-0 text-balance break-words text-[2.55rem] font-black leading-tight tracking-normal text-[#333] sm:text-[2.8rem] lg:text-[3rem] xl:text-[3.2rem]"
          >
            {titleSegments
              ? titleSegments.map((segment) => (
                  <span key={segment} aria-hidden="true" className="inline-block whitespace-nowrap">
                    {segment}
                  </span>
                ))
              : heroCopy.title}
          </h1>
          <p className="m-0 mt-7 max-w-2xl text-[1.1rem] font-medium leading-9 text-[#5f6066] lg:text-[1.18rem]">
            {heroCopy.subhead || copy.hero.subhead}
          </p>

          <div className="mt-9 flex items-center justify-center gap-3 lg:justify-start">
            <div className="flex -space-x-3">
              {HOMEPAGE_HERO_ASSETS.users.map((src, index) => (
                <img
                  key={src}
                  src={src}
                  alt=""
                  aria-hidden="true"
                  className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-sm"
                  style={{ zIndex: HOMEPAGE_HERO_ASSETS.users.length - index }}
                  loading="eager"
                />
              ))}
            </div>
            <div className="text-left">
              <p className="m-0 text-base font-bold leading-none text-[#5b5c62]">
                {heroCopy.socialProofCount} <span className="text-[#ff9c2f]">★</span>
              </p>
              <p className="m-0 mt-1 text-xs text-[#9a9aa3]">{heroCopy.socialProof}</p>
            </div>
          </div>

          {ctas.length > 0 ? (
            <div className="mt-9 grid gap-4 sm:grid-cols-2">
              {ctas.map((item) => (
                <Link
                  key={`${item.variant}-${item.href}`}
                  href={withLocale(locale, item.href)}
                  prefetch={false}
                  className={cn(
                    "inline-flex min-h-[3.4rem] items-center justify-center whitespace-nowrap rounded-full px-8 text-base font-bold tracking-normal transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8c77e4]",
                    item.variant === "primary" && "bg-[#8c77e4] text-white shadow-[0_14px_26px_rgba(140,119,228,0.35)] hover:bg-[#7a63df]",
                    item.variant === "secondary" && "bg-white text-[#333] shadow-[0_10px_22px_rgba(59,45,105,0.14)] hover:text-[#8c77e4]"
                  )}
                >
                  {item.label}
                  <span aria-hidden className="ml-4 text-[1.35rem] leading-none">→</span>
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        <div className="relative mx-auto hidden w-full max-w-[34rem] lg:block">
          <div aria-hidden className="absolute inset-8 rounded-full bg-white/45 blur-3xl" />
          <img
            src={HOMEPAGE_HERO_ASSETS.brain}
            alt=""
            aria-hidden="true"
            className="relative mx-auto h-[31rem] w-auto max-w-full object-contain drop-shadow-[0_25px_55px_rgba(133,113,218,0.20)]"
            loading="eager"
          />
        </div>
      </Container>
    </section>
  );
}

function TrustIcon({ index }: { index: number }) {
  const iconClassName = "h-8 w-8";
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
      <span className="grid h-14 w-14 place-items-center rounded-full border border-[#008aa3] bg-white text-[#008aa3]" aria-hidden>
        <svg {...commonProps}>
          <path d="M40 8 64 17v18c0 17.5-10.5 29.5-24 36-13.5-6.5-24-18.5-24-36V17l24-9Z" />
          <path d="M30 37v-6c0-6 4-10 10-10s10 4 10 10v6" />
          <rect x="28" y="36" width="24" height="20" rx="3" />
          <path d="M40 44v6" />
        </svg>
      </span>
    );
  }

  if (index === 2) {
    return (
      <span className="grid h-14 w-14 place-items-center rounded-full border border-[#008aa3] bg-white text-[#008aa3]" aria-hidden>
        <svg {...commonProps}>
          <circle cx="40" cy="25" r="9" />
          <path d="M25 64v-8c0-9 6-16 15-16s15 7 15 16v8" />
          <circle cx="20" cy="32" r="7" />
          <path d="M8 63v-6c0-7 5-12 12-12 4 0 7 1.5 9 4" />
          <circle cx="60" cy="32" r="7" />
          <path d="M72 63v-6c0-7-5-12-12-12-4 0-7 1.5-9 4" />
        </svg>
      </span>
    );
  }

  return (
    <span className="grid h-14 w-14 place-items-center rounded-full border border-[#008aa3] bg-white text-[#008aa3]" aria-hidden>
      <svg {...commonProps}>
        <rect x="15" y="24" width="50" height="36" rx="2.5" />
        <path d="M30 24v-7h20v7" />
        <path d="M15 37h18" />
        <path d="M47 37h18" />
        <path d="M37 37h6" />
        <path d="M40 34c-3 0-5 2.4-5 5.2 0 2.2 1.3 4 3.1 4.8v8h3.8v-8c1.8-.8 3.1-2.6 3.1-4.8 0-2.8-2-5.2-5-5.2Z" />
        <path d="M20 60h40" />
      </svg>
    </span>
  );
}

function TrustCard({ item, index }: { item: TrustItem; index: number }) {
  return (
    <article className="flex min-h-[18rem] flex-col items-center justify-center rounded-md bg-white px-8 py-10 text-center shadow-[0_18px_45px_rgba(15,23,42,0.10)]">
      <TrustIcon index={index} />
      <h3 className="m-0 mt-8 text-xl font-semibold leading-7 tracking-normal text-slate-950">{item.title}</h3>
      <p className="m-0 mt-4 max-w-[22rem] text-base font-normal leading-7 tracking-normal text-slate-600">
        {item.summary}
      </p>
    </article>
  );
}

function AboutIcon({ index }: { index: number }) {
  const icons = [HeartHandshake, GraduationCap, Microscope] as const;
  const Icon = icons[index] ?? HeartHandshake;

  return (
    <span className="grid h-16 w-16 place-items-center rounded-full border border-[#008aa3] bg-white text-[#008aa3] shadow-[0_12px_28px_rgba(0,138,163,0.10)]" aria-hidden>
      <Icon className="h-8 w-8" strokeWidth={1.8} />
    </span>
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
      title: "Free tests, free results",
      summary: "Core assessments are designed around self-understanding, career judgment, and ability growth, with clear result summaries.",
      paragraphs: [],
      href: copy.trust.methodHref,
      hrefLabel: copy.trust.methodLabel,
    },
    {
      title: "We take your privacy seriously.",
      summary: "You do not need to create an account first. Complete the test, then decide whether to save your result or go deeper.",
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
    title: locale === "zh" ? "百万人测试" : "Million-plus testers",
    summary:
      locale === "zh"
        ? "单月真人测试人数达 120 万，累计测试交互超过 5000 万次。"
        : "In a single month, 1.2M real people completed tests, with more than 50M cumulative test interactions.",
    paragraphs: [],
    href: copy.trust.methodHref,
    hrefLabel: copy.trust.methodLabel,
  };
  const displayTrustItems = [...baseTrustItems.slice(0, 2), testCompletionTrustItem].slice(0, 3);

  if (displayTrustItems.length === 0) return null;

  return (
    <section className="fm-section-clean relative z-20 border-b border-[var(--fm-border-soft)] py-20 md:py-24" aria-label={copy.trust.title}>
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
  return locale === "zh" ? "热门测评" : "Popular assessments";
}

function getCoreTestIntroCopy(locale: Locale, item: HomeCoreTestItem, title: string): { card: string; detail: string; action: string } {
  const key = getCoreTestKey(item);

  if (locale === "zh") {
    if (key.includes("mbti")) {
      return {
        card: "想了解自己的性格吗？看看你的偏好、沟通方式和决策风格。",
        detail: "MBTI 性格测试帮助你理解日常选择、互动方式和团队协作中的偏好，适合作为自我了解和沟通参考。",
        action: "开始 MBTI 免费测试。",
      };
    }

    if (key.includes("big-five")) {
      return {
        card: "想知道你的稳定特质吗？从五个维度了解你平时如何行动和反应。",
        detail: "大五人格测试围绕开放性、尽责性、外向性、宜人性和情绪稳定性，帮助你获得更连续的特质视角。",
        action: "开始大五人格免费测试。",
      };
    }

    if (key.includes("holland") || key.includes("riasec")) {
      return {
        card: "想知道什么工作更吸引你吗？看看你的兴趣类型和偏好的工作环境。",
        detail: "霍兰德职业兴趣测试用 RIASEC 类型帮助你比较职业方向、学习选择和工作环境偏好。",
        action: "开始霍兰德职业兴趣免费测试。",
      };
    }

    if (key.includes("enneagram")) {
      return {
        card: "你的核心动机是什么？看看压力、关系和成长中的常见反应模式。",
        detail: "九型人格测试帮助你从动机和行为模式理解自己，适合用于关系反思和个人成长参考。",
        action: "开始九型人格免费测试。",
      };
    }

    if (key.includes("iq")) {
      return {
        card: "想练习推理能力吗？完成视觉与数字题，获得一份清晰的原始分参考。",
        detail: "智商测试包含视觉和数字推理练习，适合在常模权威上线前作为能力训练与原始分参考。",
        action: "开始智商免费测试。",
      };
    }

    if (key.includes("eq")) {
      return {
        card: "想了解情绪和关系能力吗？看看你在理解、表达和协作中的常见模式。",
        detail: "情商测试关注情绪识别、沟通表达和关系协作，帮助你获得更清晰的互动参考。",
        action: "开始情商免费测试。",
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
      card: "Want to understand your personality? See your preferences, communication style, and decision-making patterns.",
      detail: "The MBTI personality test helps you understand everyday choices, interaction style, and teamwork preferences as a self-reflection and communication reference.",
      action: "Start the free MBTI test.",
    };
  }

  if (key.includes("big-five")) {
    return {
      card: "Want to understand your more stable traits? See how you tend to act and respond across five dimensions.",
      detail: "The Big Five personality test looks at openness, conscientiousness, extraversion, agreeableness, and emotional stability, giving you a more continuous trait-based view.",
      action: "Start the free Big Five test.",
    };
  }

  if (key.includes("holland") || key.includes("riasec")) {
    return {
      card: "Wonder what kind of work draws you in? Explore your interest type and preferred work environments.",
      detail: "The Holland career interest test uses RIASEC types to help you compare career directions, study choices, and work-environment preferences.",
      action: "Start the free Holland career interest test.",
    };
  }

  if (key.includes("enneagram")) {
    return {
      card: "What is your core motivation? See common response patterns in stress, relationships, and growth.",
      detail: "The Enneagram test helps you understand yourself through motivation and behavior patterns, as a reference for relationship reflection and personal growth.",
      action: "Start the free Enneagram test.",
    };
  }

  if (key.includes("iq")) {
    return {
      card: "Want to practice reasoning? Complete visual and numerical questions and get a clear raw-score reference.",
      detail: "The IQ test includes visual and numerical reasoning exercises, suitable for ability practice and raw-score reference before normed authority is available.",
      action: "Start the free IQ test.",
    };
  }

  if (key.includes("eq")) {
    return {
      card: "Want to understand emotional and relationship skills? See your patterns in understanding, expression, and collaboration.",
      detail: "The EQ test focuses on emotion recognition, communication, and relationship collaboration, helping you gain clearer interaction references.",
      action: "Start the free EQ test.",
    };
  }

  return {
    card: item.description || `Explore how ${title} can help you understand yourself.`,
    detail: item.description || `${title} gives you a clear assessment entry point for self-understanding and next-step reflection.`,
    action: "Start the free test.",
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
      <p className="m-0 text-base font-normal leading-7 tracking-normal text-slate-700">
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
    <section className="fm-page-background py-20 md:py-24" aria-labelledby="homepage-core-tests-title">
      <Container className="max-w-[82rem] px-6 md:px-8">
        <div className="relative overflow-hidden bg-[var(--fm-bg-page)] py-14 text-slate-950 lg:py-20">
          <div className="relative mx-auto max-w-3xl text-center">
            <h2
              id="homepage-core-tests-title"
              className="m-0 text-3xl font-semibold tracking-normal text-slate-950 md:text-4xl"
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
    <section className="fm-section-soft py-20 md:py-24" aria-labelledby="homepage-family-title">
      <Container className="max-w-[82rem] px-6 md:px-8">
        <div className="relative overflow-hidden bg-[var(--fm-bg-soft)] pb-20 pt-16 text-slate-950">
          <div className="relative mx-auto max-w-3xl text-center">
            <h2 id="homepage-family-title" className="m-0 text-3xl font-semibold tracking-normal text-slate-950 md:text-4xl">
              {locale === "zh" ? "关于 费马团队" : "About the Fermat team"}
            </h2>
          </div>
        </div>
        <div className="relative z-10 -mt-12 grid gap-7 md:grid-cols-3">
          {families.slice(0, 3).map((family, index) => {
            const display =
              index === 0
                ? {
                    title: locale === "zh" ? "公益计划" : "Public benefit",
                    description:
                      locale === "zh"
                        ? "了解费马测试的公共利益页面与公益记录边界。"
                        : "Learn about FermatMind's public-interest page and the boundaries for giving records.",
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
                          : "A specialist team takes part in assessment methods, item design, and boundary review.",
                      links: [{ href: "/about", title: locale === "zh" ? "了解团队" : "Meet the team" }],
                    };

            return (
              <article key={`${family.title}-${index}`} className="flex min-h-[18rem] flex-col items-center rounded-md bg-white px-8 py-9 text-center shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
                <AboutIcon index={index} />
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
    <section className="fm-section-clean py-20 md:py-24" aria-labelledby="homepage-articles-title">
      <Container className="max-w-[82rem] px-6 md:px-8">
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
    <div className="fm-page-background text-[var(--fm-text-main)]">
      <HomepageCookieBannerGuard />
      <HomepageHeroV1 locale={locale} copy={copy} />
      <HomepageHighlightedTestsBanner locale={locale} copy={copy} supplementalTests={supplementalTests} />
      <HomepageTrustStripV1 locale={locale} copy={copy} />
      <HomepageFamilyMatrix locale={locale} copy={copy} />
      <HomepageArticlesBanner locale={locale} articles={articles} />
    </div>
  );
}
