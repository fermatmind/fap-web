import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  ClipboardList,
  Compass,
  Route,
  SearchCheck,
  Target,
} from "lucide-react";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { listCareerGuidesFromCms, type CareerGuideListItem } from "@/lib/cms/career-guides";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import {
  buildBreadcrumbJsonLd,
  buildFAQPageJsonLd,
  buildItemListJsonLd,
  buildWebPageJsonLd,
} from "@/lib/seo/generateSchema";
import { buildPageMetadata } from "@/lib/seo/metadata";
import styles from "./career-paths.module.css";

export const revalidate = 300;

const PAGE_UPDATED_AT = "2026-09-04";

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
    title: { en: "Choose a direction", zh: "确定目标方向" },
    summary: {
      en: "Build a shortlist, compare paths, and avoid one-dimensional salary decisions.",
      zh: "建立候选方向、比较路径，避免只用薪资做决定。",
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
    title: { en: "Validate a transition", zh: "验证职业转型" },
    summary: {
      en: "Test a move, reduce switching cost, and turn adjacent experience into evidence.",
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
    title: { en: "Close skill gaps", zh: "补齐技能差距" },
    summary: {
      en: "Turn vague growth goals into role-specific skills, projects, and job-search evidence.",
      zh: "把模糊成长目标拆成岗位技能、实战项目和求职证据。",
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
    title: { en: "Use assessment signals", zh: "使用测评线索" },
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
    title: { en: "Read market change", zh: "判断市场变化" },
    summary: {
      en: "Read AI exposure, industry shifts, and career resilience without overreacting.",
      zh: "理解 AI 暴露度、行业变化和职业韧性，避免过度反应。",
    },
    slugs: ["career-risk-management"],
    fallbackCategories: ["career-planning"],
  },
];

const FEATURED_GUIDE_SLUGS = [
  "career-transition-playbook",
  "improve-workplace-competitiveness",
  "build-portfolio-for-career-switch",
  "interview-strategy-by-role",
  "how-to-find-right-career-direction",
];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);

  return buildPageMetadata({
    locale,
    pathname: locale === "zh" ? "/zh/career/guides" : "/en/career/guides",
    title: locale === "zh" ? "职业路径：转行、技能差距与行动计划" : "Career Paths: Skills, Transitions, and Action Plans",
    description:
      locale === "zh"
        ? "从当前状态走向目标职业：盘点可迁移能力、识别技能差距，并用项目、学习与求职行动验证路径。"
        : "Move from your current position toward a target career by mapping transferable strengths, skill gaps, projects, learning, and job-search actions.",
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
  const isZh = locale === "zh";
  const canonicalPath = isZh ? "/zh/career/guides" : "/en/career/guides";
  const pageTitle = isZh ? "从现在，走向你的目标职业" : "Move from where you are to your target career";
  const pageDescription = isZh
    ? "看清可迁移能力、技能差距与阶段任务，把职业方向变成一条可执行、可验证的路径。"
    : "Map transferable strengths, skill gaps, and staged actions to turn a career direction into a testable path.";
  const jobsPath = localizedPath("/career", locale);
  const recommendationsPath = localizedPath("/career/recommendations", locale);
  const guides = await listCareerGuidesFromCms(locale);
  const groupedGuides = groupGuides(guides);
  const featuredGuides = orderBySlugs(guides, FEATURED_GUIDE_SLUGS);
  const faqItems = isZh
    ? [
        {
          question: "如何判断一个转行方向是否值得尝试？",
          answer: "先核对目标岗位的真实任务和门槛，再盘点可迁移能力，通过小项目、访谈或短期协作验证，而不是先做不可逆的决定。",
        },
        {
          question: "技能差距应该一次全部补齐吗？",
          answer: "不需要。优先补齐影响入门和作品证明的核心技能，再根据目标岗位反馈迭代学习计划。",
        },
        {
          question: "职业路径会替我保证转型成功吗？",
          answer: "不会。职业路径用于组织信息和行动，结果仍受个人能力、市场机会、教育经验和执行质量影响。",
        },
      ]
    : [
        {
          question: "How do I decide whether a career transition is worth testing?",
          answer: "Check the target role's real tasks and entry requirements, map transferable strengths, and validate the direction through a small project, conversation, or short collaboration before making an irreversible move.",
        },
        {
          question: "Should I close every skill gap at once?",
          answer: "No. Prioritize the skills needed for entry and credible work samples, then update the learning plan using feedback from target roles.",
        },
        {
          question: "Does a career path guarantee a successful transition?",
          answer: "No. A path organizes evidence and action, while outcomes still depend on capability, opportunity, education, experience, and execution.",
        },
      ];
  const webPageJsonLd = buildWebPageJsonLd({
    path: canonicalPath,
    title: pageTitle,
    description: pageDescription,
    locale,
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: isZh ? "首页" : "Home", path: isZh ? "/zh" : "/en" },
    { name: isZh ? "职业" : "Career", path: isZh ? "/zh/career" : "/en/career" },
    { name: isZh ? "职业路径" : "Career paths", path: canonicalPath },
  ]);
  const faqJsonLd = buildFAQPageJsonLd(faqItems);
  const itemListJsonLd = buildItemListJsonLd({
    path: canonicalPath,
    title: isZh ? "职业路径指南" : "Career path guides",
    description: isZh ? "来自 CMS 的公开职业路径指南。" : "Public career path guides supplied by the CMS.",
    locale,
    items: guides.map((guide) => ({
      name: guide.title,
      path: guide.href,
      description: guide.summary,
    })),
  });

  const pathSteps = [
    {
      number: "01",
      icon: Target,
      title: isZh ? "确定目标方向" : "Choose a target",
      description: isZh ? "先核对真实工作内容，再建立少量候选方向。" : "Check real work first, then build a small shortlist.",
      href: recommendationsPath,
    },
    {
      number: "02",
      icon: ClipboardList,
      title: isZh ? "盘点技能差距" : "Map skill gaps",
      description: isZh ? "区分可迁移能力、入门技能与长期能力。" : "Separate transferable strengths, entry skills, and long-term capabilities.",
      href: "#capability-building",
    },
    {
      number: "03",
      icon: SearchCheck,
      title: isZh ? "完成低成本验证" : "Run a low-cost test",
      description: isZh ? "用项目、访谈或短期协作验证日常工作。" : "Use a project, conversation, or short collaboration to test the work.",
      href: "#career-transition",
    },
    {
      number: "04",
      icon: BookOpenCheck,
      title: isZh ? "准备求职证据" : "Prepare job-search evidence",
      description: isZh ? "整理作品、案例和目标岗位清单，再开始投递。" : "Prepare work samples, cases, and a target-role list before applying.",
      href: "#guides",
    },
  ];

  return (
    <main className={styles.page}>
      <JsonLd id="career-path-webpage" data={webPageJsonLd} />
      <JsonLd id="career-path-breadcrumb" data={breadcrumbJsonLd} />
      <JsonLd id="career-path-faq" data={faqJsonLd} />
      {guides.length > 0 ? <JsonLd id="career-path-item-list" data={itemListJsonLd} /> : null}

      <section className={styles.hero}>
        <div className={styles.heroArtwork} aria-hidden="true">
          <Image
            src="/images/career/career-compass.webp"
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 58vw, 100vw"
            className={styles.heroArtworkImage}
          />
        </div>
        <Container as="div" className={styles.heroInner}>
          <Breadcrumb
            items={[
              { label: isZh ? "首页" : "Home", href: localizedPath("/", locale) },
              { label: isZh ? "职业" : "Career", href: jobsPath },
              { label: isZh ? "职业路径" : "Career paths" },
            ]}
          />
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>{isZh ? "职业路径 · CAREER PATH" : "CAREER PATH"}</p>
            <h1>{pageTitle}</h1>
            <p>{pageDescription}</p>
          </div>
        </Container>
      </section>

      <Container as="div" className={styles.content}>
        <section className={styles.startCard} aria-labelledby="career-path-start-title">
          <div className={styles.startIntro}>
            <span className={styles.iconBadge}><Route aria-hidden="true" /></span>
            <div>
              <p className={styles.sectionKicker}>{isZh ? "选择你的起点" : "Choose your starting point"}</p>
              <h2 id="career-path-start-title">{isZh ? "先确认方向，再拆解路径" : "Confirm the direction, then map the path"}</h2>
            </div>
          </div>
          <div className={styles.startActions}>
            <Link href={recommendationsPath} className={styles.startOption}>
              <span><small>{isZh ? "还没有明确方向" : "No clear direction yet"}</small><strong>{isZh ? "先做职业匹配" : "Start with career fit"}</strong></span>
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href={jobsPath} className={styles.startOption}>
              <span><small>{isZh ? "已经有目标职业" : "Already have a target role"}</small><strong>{isZh ? "核对职业要求" : "Check role requirements"}</strong></span>
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
          <p className={styles.sourceNote}>{isZh ? "职业要求来自现有公开职业库；路径指南来自 CMS，页面不生成未经来源支持的个性化结论。" : "Role requirements come from the public occupation library; path guides come from the CMS. This page does not generate unsupported personalized conclusions."}</p>
        </section>

        <section className={styles.pathWorkspace} aria-labelledby="career-path-map-title">
          <article className={styles.timelineCard}>
            <div className={styles.cardHeading}>
              <p className={styles.sectionKicker}>{isZh ? "通用行动框架" : "General action framework"}</p>
              <h2 id="career-path-map-title">{isZh ? "四步职业路径" : "A four-step career path"}</h2>
              <p>{isZh ? "每一步都连接到现有工具或 CMS 指南，先验证，再投入。" : "Each step links to an existing tool or CMS guide so you can validate before investing."}</p>
            </div>
            <ol className={styles.timeline}>
              {pathSteps.map((step) => {
                const Icon = step.icon;
                return (
                  <li key={step.number}>
                    <Link href={step.href} className={styles.timelineLink}>
                      <span className={styles.stepNumber}>{step.number}</span>
                      <span className={styles.stepIcon}><Icon aria-hidden="true" /></span>
                      <strong>{step.title}</strong>
                      <small>{step.description}</small>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </article>

          <aside className={styles.gapCard} aria-labelledby="career-gap-title">
            <p className={styles.sectionKicker}>{isZh ? "技能差距工作单" : "Skill-gap worksheet"}</p>
            <h2 id="career-gap-title">{isZh ? "先分三类，不急着报课" : "Sort the gap before choosing a course"}</h2>
            <ul>
              <li><CheckCircle2 aria-hidden="true" /><span><strong>{isZh ? "可以迁移" : "Transferable"}</strong><small>{isZh ? "已有经验、方法和协作能力" : "Existing experience, methods, and collaboration"}</small></span></li>
              <li><Compass aria-hidden="true" /><span><strong>{isZh ? "优先补齐" : "Priority gaps"}</strong><small>{isZh ? "进入岗位必须掌握的核心技能" : "Core skills required to enter the role"}</small></span></li>
              <li><BookOpenCheck aria-hidden="true" /><span><strong>{isZh ? "用项目证明" : "Prove through a project"}</strong><small>{isZh ? "可以被作品或案例验证的能力" : "Capabilities visible in work samples or cases"}</small></span></li>
            </ul>
            <Link href="#capability-building" className={styles.outlineAction}>{isZh ? "查看技能差距指南" : "View skill-gap guides"}<ArrowRight aria-hidden="true" /></Link>
          </aside>
        </section>

        {featuredGuides.length > 0 ? (
          <section className={styles.featuredSection} aria-labelledby="featured-career-paths-title">
            <div className={styles.listHeading}>
              <div>
                <p className={styles.sectionKicker}>{isZh ? "优先阅读" : "Start here"}</p>
                <h2 id="featured-career-paths-title">{isZh ? "把方向变成下一步" : "Turn direction into a next step"}</h2>
              </div>
              <p>{isZh ? "精选内容完全来自已发布 CMS 指南。" : "Featured content comes entirely from published CMS guides."}</p>
            </div>
            <div className={styles.featuredGrid}>
              {featuredGuides.slice(0, 3).map((guide, index) => (
                <GuideLinkCard key={guide.slug} guide={guide} locale={locale} index={index + 1} prominent />
              ))}
            </div>
          </section>
        ) : null}

        <section id="guides" className={styles.guideDirectory} aria-labelledby="career-path-guides-title">
          <div className={styles.listHeading}>
            <div>
              <p className={styles.sectionKicker}>{isZh ? "按任务查找" : "Browse by task"}</p>
              <h2 id="career-path-guides-title">{isZh ? "职业路径指南" : "Career path guides"}</h2>
            </div>
            <p>{isZh ? "职业库负责解释“这个职业是什么”；这里专注“怎样走到那里”。" : "The occupation library explains the role; this page focuses on how to move toward it."}</p>
          </div>
          <div className={styles.groupList}>
            {groupedGuides
              .filter((group) => group.guides.length > 0)
              .map((group, groupIndex) => (
                <section key={group.key} id={group.key} className={styles.guideGroup}>
                  <div className={styles.groupHeading}>
                    <span>{String(groupIndex + 1).padStart(2, "0")}</span>
                    <div>
                      <h3>{pickLocale(locale, group.title)}</h3>
                      <p>{pickLocale(locale, group.summary)}</p>
                    </div>
                  </div>
                  <div className={styles.guideGrid}>
                    {group.guides.map((guide, index) => (
                      <GuideLinkCard key={guide.slug} guide={guide} locale={locale} index={index + 1} />
                    ))}
                  </div>
                </section>
              ))}
          </div>
        </section>

        <section className={styles.faqSection} id="faq" aria-labelledby="career-path-faq-title">
          <div className={styles.faqIntro}>
            <p className={styles.sectionKicker}>{isZh ? "答案与边界" : "Answers and boundaries"}</p>
            <h2 id="career-path-faq-title">{isZh ? "职业路径常见问题" : "Career path questions"}</h2>
            <p>
              {isZh ? "页面更新于" : "Updated"} <time dateTime={PAGE_UPDATED_AT}>{PAGE_UPDATED_AT}</time>{isZh ? "。" : "."}
              {isZh ? "内容索引来自公开 CMS，目标职业事实以职业库为准。" : " Guide indexing comes from the public CMS; role facts remain authoritative in the occupation library."}
            </p>
          </div>
          <div className={styles.faqList}>
            {faqItems.map((item) => (
              <details key={item.question} className={styles.faqItem}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </Container>
    </main>
  );
}

function GuideLinkCard({
  guide,
  locale,
  index,
  prominent = false,
}: {
  guide: CareerGuideListItem;
  locale: Locale;
  index: number;
  prominent?: boolean;
}) {
  return (
    <Link href={guide.href} className={prominent ? styles.featuredCard : styles.guideCard}>
      <span className={styles.guideIndex}>{String(index).padStart(2, "0")}</span>
      <p>{formatGuideCategory(guide.categorySlug || guide.category, locale)}</p>
      <h3>{guide.title}</h3>
      <small>{guide.summary}</small>
      <strong>{locale === "zh" ? "阅读指南" : "Read guide"}<ArrowRight aria-hidden="true" /></strong>
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
