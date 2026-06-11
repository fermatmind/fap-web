import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { Container } from "@/components/layout/Container";
import { listCareerGuidesFromCms, type CareerGuideListItem } from "@/lib/cms/career-guides";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const revalidate = 300;

type GuideGroup = {
  key: string;
  title: { en: string; zh: string };
  summary: { en: string; zh: string };
  slugs: string[];
  fallbackCategories: string[];
};

const GUIDE_GROUPS: GuideGroup[] = [
  {
    key: "career-choice",
    title: { en: "Career choice", zh: "职业选择" },
    summary: {
      en: "Build a shortlist, compare paths, and avoid one-dimensional salary decisions.",
      zh: "建立候选职业、比较路径，避免只用薪资做决定。",
    },
    slugs: [
      "how-to-find-right-career-direction",
      "how-to-choose-college-major",
      "annual-career-review-system",
      "build-five-year-career-roadmap",
      "leader-track-vs-expert-track",
    ],
    fallbackCategories: ["career-planning", "education-decision"],
  },
  {
    key: "career-transition",
    title: { en: "Career transition", zh: "职业转型" },
    summary: {
      en: "Validate a move, reduce switching cost, and turn adjacent experience into evidence.",
      zh: "验证转型方向、降低切换成本，把相邻经验转成证据。",
    },
    slugs: [
      "career-transition-playbook",
      "cross-industry-move-strategy",
      "build-portfolio-for-career-switch",
      "first-90-days-in-new-role",
    ],
    fallbackCategories: ["career-transition", "onboarding"],
  },
  {
    key: "capability-building",
    title: { en: "Capability building", zh: "能力建设" },
    summary: {
      en: "Turn vague growth goals into role-specific skills, projects, and negotiation leverage.",
      zh: "把模糊成长目标拆成岗位能力、项目证据和谈判筹码。",
    },
    slugs: [
      "improve-workplace-competitiveness",
      "interview-strategy-by-role",
      "salary-negotiation-framework",
      "networking-that-actually-works",
      "personal-brand-for-professionals",
      "career-growth-with-manager",
    ],
    fallbackCategories: ["skill-growth", "job-search", "workplace-communication"],
  },
  {
    key: "personality-fit",
    title: { en: "Personality and fit", zh: "人格与职业" },
    summary: {
      en: "Use MBTI, Big Five, IQ, and EQ as decision inputs without turning them into labels.",
      zh: "把 MBTI、大五、IQ 与 EQ 当作决策输入，而不是职业标签。",
    },
    slugs: [
      "from-mbti-to-job-fit",
      "big5-for-career-decisions",
      "iq-eq-balance-at-work",
      "prevent-burnout-while-growing",
    ],
    fallbackCategories: ["assessment-usage", "wellbeing"],
  },
  {
    key: "market-risk",
    title: { en: "AI and market risk", zh: "AI 与行业趋势" },
    summary: {
      en: "Read AI exposure, industry shifts, and career resilience without overreacting.",
      zh: "理解 AI 暴露度、行业变化和职业韧性，避免过度反应。",
    },
    slugs: ["career-risk-management"],
    fallbackCategories: ["career-planning"],
  },
];

const FEATURED_GUIDE_SLUGS = [
  "how-to-find-right-career-direction",
  "career-risk-management",
  "from-mbti-to-job-fit",
  "career-transition-playbook",
  "improve-workplace-competitiveness",
];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);

  return buildPageMetadata({
    locale,
    pathname: locale === "zh" ? "/zh/career/guides" : "/en/career/guides",
    title: locale === "zh" ? "职业发展" : "Career Guides",
    description:
      locale === "zh"
        ? "围绕职业规划、转型与成长的 20 篇结构化实战指南。"
        : "20 structured guides for career planning, transition, and professional growth.",
    alternatesByLocale: {
      en: "/en/career/guides",
      zh: "/zh/career/guides",
      xDefault: "/",
    },
  });
}

function pickLocale<T>(locale: Locale, value: { en: T; zh: T }): T {
  return locale === "zh" ? value.zh : value.en;
}

function orderBySlugs(guides: CareerGuideListItem[], slugs: string[]): CareerGuideListItem[] {
  const bySlug = new Map(guides.map((guide) => [guide.slug, guide]));
  return slugs.map((slug) => bySlug.get(slug)).filter((guide): guide is CareerGuideListItem => Boolean(guide));
}

function groupGuides(guides: CareerGuideListItem[]) {
  const used = new Set<string>();
  const explicitlyGroupedSlugs = new Set(GUIDE_GROUPS.flatMap((group) => group.slugs));

  return GUIDE_GROUPS.map((group) => {
    const bySlug = orderBySlugs(guides, group.slugs);
    for (const guide of bySlug) {
      used.add(guide.slug);
    }

    const fallback = guides.filter(
      (guide) =>
        !used.has(guide.slug) &&
        (!explicitlyGroupedSlugs.has(guide.slug) || group.slugs.includes(guide.slug)) &&
        group.fallbackCategories.includes(guide.categorySlug || guide.category)
    );
    for (const guide of fallback) {
      used.add(guide.slug);
    }

    return {
      ...group,
      guides: [...bySlug, ...fallback],
    };
  });
}

export default async function CareerGuidesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);

  const guides = await listCareerGuidesFromCms(locale);
  const groupedGuides = groupGuides(guides);
  const featuredGuides = orderBySlugs(guides, FEATURED_GUIDE_SLUGS);
  const allOccupationsPath = localizedPath("/career/jobs", locale);
  const industriesPath = localizedPath("/career/industries", locale);
  const careerTestsPath = localizedPath("/career/tests", locale);

  return (
    <Container as="main" className="space-y-12 py-10 md:py-16">
      <Breadcrumb
        items={[
          { label: locale === "zh" ? "首页" : "Home", href: localizedPath("/", locale) },
          { label: locale === "zh" ? "职业" : "Career", href: localizedPath("/career", locale) },
          { label: locale === "zh" ? "职业发展" : "Guides" },
        ]}
      />

      <section className="max-w-4xl space-y-5">
        <h1 className="m-0 text-4xl font-semibold tracking-tight text-slate-950 md:text-6xl">
          {locale === "zh" ? "把职业选择变成可验证的判断" : "Turn career choice into a testable decision"}
        </h1>
        <div className="flex flex-wrap gap-3">
          <Link href={allOccupationsPath} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
            {locale === "zh" ? "打开全部职业库" : "Open occupation library"}
          </Link>
          <Link href={industriesPath} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-orange-300 hover:text-orange-600">
            {locale === "zh" ? "按行业浏览" : "Browse by industry"}
          </Link>
          <Link href={careerTestsPath} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-orange-300 hover:text-orange-600">
            {locale === "zh" ? "职业测试" : "Career tests"}
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-5">
        {GUIDE_GROUPS.map((group) => (
          <a key={group.key} href={`#${group.key}`} className="border-t border-slate-200 pt-4 text-sm hover:border-orange-400">
            <span className="block font-semibold text-slate-950">{pickLocale(locale, group.title)}</span>
            <span className="mt-2 block leading-6 text-slate-500">{pickLocale(locale, group.summary)}</span>
          </a>
        ))}
      </section>

      {featuredGuides.length > 0 ? (
        <section className="space-y-5">
          <div>
            <h2 className="m-0 text-2xl font-semibold tracking-tight text-slate-950">
              {locale === "zh" ? "精选指南" : "Featured guides"}
            </h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {featuredGuides.map((guide) => (
              <GuideLinkCard key={guide.slug} guide={guide} locale={locale} prominent />
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-10">
        {groupedGuides
          .filter((group) => group.guides.length > 0)
          .map((group) => (
            <div key={group.key} id={group.key} className="scroll-mt-24 space-y-4">
              <div className="border-t border-slate-200 pt-6">
                <h2 className="m-0 text-2xl font-semibold tracking-tight text-slate-950">
                  {pickLocale(locale, group.title)}
                </h2>
                <p className="m-0 mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  {pickLocale(locale, group.summary)}
                </p>
              </div>
              <div className="grid gap-x-8 gap-y-3 md:grid-cols-2">
                {group.guides.map((guide) => (
                  <GuideLinkCard key={guide.slug} guide={guide} locale={locale} />
                ))}
              </div>
            </div>
          ))}
      </section>
    </Container>
  );
}

function GuideLinkCard({
  guide,
  locale,
  prominent = false,
}: {
  guide: CareerGuideListItem;
  locale: Locale;
  prominent?: boolean;
}) {
  return (
    <Link
      href={guide.href}
      className={[
        "group block border-t border-slate-200 py-5 transition hover:border-orange-300",
        prominent ? "rounded-xl border border-slate-200 bg-white px-5 shadow-sm" : "",
      ].join(" ")}
    >
      <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
        {formatGuideCategory(guide.categorySlug || guide.category, locale)}
      </p>
      <h3 className="m-0 mt-3 text-xl font-semibold tracking-tight text-slate-950 group-hover:text-orange-600">
        {guide.title}
      </h3>
      <p className="m-0 mt-3 text-sm leading-6 text-slate-500">{guide.summary}</p>
      <p className="m-0 mt-4 text-sm font-semibold text-orange-600">
        {locale === "zh" ? "阅读指南" : "Read guide"}
      </p>
    </Link>
  );
}

function formatGuideCategory(category: string, locale: Locale): string {
  const labels: Record<string, { en: string; zh: string }> = {
    "career-planning": { en: "Career planning", zh: "职业规划" },
    "career-transition": { en: "Career transition", zh: "职业转型" },
    "skill-growth": { en: "Capability building", zh: "能力建设" },
    "assessment-usage": { en: "Assessment usage", zh: "测评应用" },
    "workplace-communication": { en: "Workplace communication", zh: "职场沟通" },
    "job-search": { en: "Job search", zh: "求职行动" },
    onboarding: { en: "Onboarding", zh: "新岗位适应" },
    wellbeing: { en: "Wellbeing", zh: "职业健康" },
    "education-decision": { en: "Education decision", zh: "教育选择" },
  };
  return labels[category]?.[locale] ?? category;
}
