import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  CircleCheck,
  Compass,
  Fingerprint,
  Search,
  SlidersHorizontal,
  Sparkles,
  Target,
} from "lucide-react";
import { TrackedCareerLink } from "@/components/analytics/TrackedCareerLink";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";
import { adaptCareerRecommendationIndex } from "@/lib/career/adapters/adaptCareerRecommendationIndex";
import { fetchCareerRecommendationIndex } from "@/lib/career/api/fetchCareerRecommendationIndex";
import { CAREER_TRACKING_EVENTS, buildCareerAttributionPayload } from "@/lib/career/attribution";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import {
  buildBreadcrumbJsonLd,
  buildFAQPageJsonLd,
  buildItemListJsonLd,
  buildWebPageJsonLd,
} from "@/lib/seo/generateSchema";
import { buildPageMetadata } from "@/lib/seo/metadata";
import styles from "./recommendations.module.css";

const PAGE_UPDATED_AT = "2026-10-23";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);

  return buildPageMetadata({
    locale,
    pathname: locale === "zh" ? "/zh/career/recommendations" : "/en/career/recommendations",
    title: locale === "zh" ? "按 MBTI 类型探索职业方向" : "Explore careers by MBTI-style type",
    description:
      locale === "zh"
        ? "浏览按 MBTI 类型组织的公开职业探索建议，再结合兴趣、能力和入行要求核对真实工作任务。"
        : "Browse career exploration suggestions organized by MBTI-style type. Compare the suggested tasks with your interests, skills and entry requirements.",
    alternatesByLocale: {
      en: "/en/career/recommendations",
      zh: "/zh/career/recommendations",
      xDefault: "/",
    },
  });
}

export default async function CareerRecommendationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const isZh = locale === "zh";
  const withLocale = (pathname: string) => localizedPath(pathname, locale);
  const canonicalPath = isZh ? "/zh/career/recommendations" : "/en/career/recommendations";
  const pageTitle = isZh ? "按 MBTI 类型探索职业方向" : "Explore careers by MBTI-style type";
  const pageDescription = isZh
    ? "选择一个类型，查看已发布的职业探索建议。本索引不会合并你的测评结果，也不评估你的能力和现实条件。"
    : "Choose a type to browse its published career suggestions. This index does not combine your test results or assess your skills and circumstances.";
  const riasecTestPath = withLocale("/tests/holland-career-interest-test-riasec");
  const mbtiTestPath = withLocale("/tests/mbti-personality-test-16-personality-types");
  const jobsPath = withLocale("/career");
  const guidesPath = withLocale("/career/guides");

  const payload = await fetchCareerRecommendationIndex({ locale });
  const recommendationItems = adaptCareerRecommendationIndex({ locale, payload });
  const featuredRecommendations = recommendationItems.slice(0, 3);
  const isEmptyPublishedIndex = payload !== null && Array.isArray(payload.items) && payload.items.length === 0;
  const faqItems = isZh
    ? [
        {
          question: "本页建议是否根据我的测评结果生成？",
          answer: "不是。本页展示公开的 MBTI 类型职业索引，没有读取或合并你的测评结果。请自行选择类型，并用实际任务、入行要求和个人条件核对候选方向。",
        },
        {
          question: "MBTI 能直接决定适合的职业吗？",
          answer: "不能。MBTI 只能作为工作偏好线索，不能替代能力、教育、经验、机会和个人目标等判断。",
        },
        {
          question: "没有测评结果也可以开始吗？",
          answer: "可以。先从霍兰德职业兴趣测试或职业库开始，再通过真实任务、小项目和访谈验证方向。",
        },
      ]
    : [
        {
          question: "Are these suggestions based on my test results?",
          answer: "No. This is a public career index organized by MBTI-style type. It does not read or combine your test results. Choose a type, then check actual tasks, entry requirements and your circumstances.",
        },
        {
          question: "Can MBTI determine the right career?",
          answer: "No. MBTI can suggest work-preference signals, but it cannot replace evidence about skills, education, experience, opportunities, and personal goals.",
        },
        {
          question: "Can I start without an assessment result?",
          answer: "Yes. Start with the RIASEC career-interest assessment or the occupation library, then validate the direction through real tasks, small projects, and conversations.",
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
    { name: isZh ? "职业匹配" : "Career fit", path: canonicalPath },
  ]);
  const faqJsonLd = buildFAQPageJsonLd(faqItems);
  const itemListJsonLd = buildItemListJsonLd({
    path: canonicalPath,
    title: isZh ? "公开 MBTI 职业类型入口" : "Public MBTI-style career starting points",
    description: isZh ? "由公开职业推荐索引提供的类型入口。" : "Type entry points supplied by the public career recommendation index.",
    locale,
    items: recommendationItems.map((item) => ({
      name: item.recommendationSubjectMeta.displayTitle,
      path: item.href,
    })),
  });

  const profileInputs = [
    {
      icon: Compass,
      title: isZh ? "职业兴趣" : "Career interests",
      description: isZh ? "识别你愿意长期投入的活动与环境" : "Identify activities and environments worth sustained effort",
      action: isZh ? "完成 RIASEC" : "Take RIASEC",
      href: riasecTestPath,
    },
    {
      icon: Fingerprint,
      title: isZh ? "人格倾向" : "Personality tendencies",
      description: isZh ? "理解信息处理、协作与决策偏好" : "Understand how you process information, collaborate, and decide",
      action: isZh ? "完成 MBTI" : "Take MBTI",
      href: mbtiTestPath,
    },
    {
      icon: SlidersHorizontal,
      title: isZh ? "现实条件" : "Practical constraints",
      description: isZh ? "用学历、经验与工作方式校准选择" : "Calibrate choices with education, experience, and work mode",
      action: isZh ? "浏览职业库" : "Browse occupations",
      href: jobsPath,
    },
  ];

  const evidenceItems = [
    {
      icon: Compass,
      title: isZh ? "从类型建议起步" : "Type-based starting points",
      description: isZh ? "先读某个类型已发布的职业建议，把它们当作待核对的候选。" : "Read the published career suggestions for a type as starting points to investigate.",
    },
    {
      icon: Sparkles,
      title: isZh ? "核对真实工作" : "Check actual work",
      description: isZh ? "打开职业资料，核对日常任务、工作条件和入行要求。" : "Check everyday tasks, working conditions and entry requirements in occupation profiles.",
    },
    {
      icon: BriefcaseBusiness,
      title: isZh ? "积累自己的证据" : "Build your own evidence",
      description: isZh ? "用小项目、访谈和实际要求检验兴趣与能力，再决定是否继续。" : "Use projects, conversations and real requirements to check interests and skills before committing.",
    },
  ];

  return (
    <main className={styles.page}>
      <AnalyticsPageViewTracker
        eventName={CAREER_TRACKING_EVENTS.recommendationIndexView}
        properties={buildCareerAttributionPayload({
          locale,
          entrySurface: "career_recommendation_index",
          sourcePageType: "career_recommendation_index",
          targetAction: "view_surface",
          landingPath: canonicalPath,
          routeFamily: "recommendations",
        })}
      />
      <JsonLd id="career-recommendation-webpage" data={webPageJsonLd} />
      <JsonLd id="career-recommendation-breadcrumb" data={breadcrumbJsonLd} />
      <JsonLd id="career-recommendation-faq" data={faqJsonLd} />
      {recommendationItems.length > 0 ? (
        <JsonLd id="career-recommendation-item-list" data={itemListJsonLd} />
      ) : null}

      <section className={styles.hero} data-testid="career-recommendations-hero">
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
              { label: isZh ? "职业" : "Career", href: localizedPath("/career", locale) },
              { label: isZh ? "职业匹配" : "Career fit" },
            ]}
          />
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>{isZh ? "职业匹配 · CAREER FIT" : "CAREER FIT"}</p>
            <h1>{pageTitle}</h1>
            <p className={styles.heroDescription}>{pageDescription}</p>
            <div className={styles.heroActions}>
              <Link href={riasecTestPath} className={styles.primaryAction}>
                {isZh ? "独立探索职业兴趣" : "Explore career interests separately"}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <Link href="#recommendations" className={styles.secondaryAction}>
                {isZh ? "选择 MBTI 类型" : "Choose an MBTI-style type"}
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <Container as="div" className={styles.content}>
        <section className={styles.matchWorkspace} aria-labelledby="career-profile-title">
          <article className={styles.profileCard}>
            <div className={styles.sectionHeadingRow}>
              <span className={styles.iconBadge}><Target aria-hidden="true" /></span>
              <div>
                <p className={styles.sectionKicker}>{isZh ? "独立探索工具" : "Separate exploration tools"}</p>
                <h2 id="career-profile-title">{isZh ? "选择你需要的探索方式" : "Choose your next exploration step"}</h2>
              </div>
            </div>
            <div className={styles.profileRows}>
              {profileInputs.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.title} href={item.href} className={styles.profileRow}>
                    <span className={styles.profileRowIcon}><Icon aria-hidden="true" /></span>
                    <span className={styles.profileRowCopy}>
                      <strong>{item.title}</strong>
                      <small>{item.description}</small>
                    </span>
                    <span className={styles.profileRowAction}>{item.action}<ArrowRight aria-hidden="true" /></span>
                  </Link>
                );
              })}
            </div>
            <p className={styles.boundaryNote}>
              {isZh ? "这些入口分别提供兴趣、偏好或职业资料，不会在本页合并为个人画像。" : "These tools offer interests, preferences or occupation information separately; this page does not combine them into a personal profile."}
            </p>
          </article>

          <article className={styles.previewCard}>
            <div className={styles.sectionHeadingRow}>
              <span className={styles.iconBadge}><Sparkles aria-hidden="true" /></span>
              <div>
                <p className={styles.sectionKicker}>{isZh ? "公开索引示例" : "Public index examples"}</p>
                <h2>{isZh ? "类型入口示例" : "Example type entry points"}</h2>
              </div>
            </div>
            {featuredRecommendations.length > 0 ? (
              <div className={styles.previewRows}>
                {featuredRecommendations.map((item) => {
                  const typeLabel = item.recommendationSubjectMeta.canonicalTypeCode
                    ?? item.recommendationSubjectMeta.typeCode
                    ?? item.recommendationSubjectMeta.displayTitle;
                  return (
                    <TrackedCareerLink
                      key={item.recommendationSubjectMeta.publicRouteSlug}
                      href={item.href}
                      eventName={CAREER_TRACKING_EVENTS.recommendationResultClick}
                      eventPayload={{
                        locale,
                        entrySurface: "career_recommendation_index",
                        sourcePageType: "career_recommendation_index",
                        targetAction: "open_recommendation_detail",
                        landingPath: canonicalPath,
                        routeFamily: "recommendations",
                        subjectKind: "recommendation_type",
                        subjectKey: item.recommendationSubjectMeta.publicRouteSlug,
                      }}
                      className={styles.previewRow}
                    >
                      <span className={styles.previewRank}><Fingerprint aria-hidden="true" className="size-4" /></span>
                      <span className={styles.previewCopy}>
                        <strong>{typeLabel}</strong>
                        <small>{isZh ? "查看职业适配线索与取舍" : "Review career-fit signals and trade-offs"}</small>
                      </span>
                      <span className={styles.previewAction}>{isZh ? "查看建议" : "View guidance"}<ArrowRight aria-hidden="true" /></span>
                    </TrackedCareerLink>
                  );
                })}
              </div>
            ) : (
              <div className={styles.unavailable} role="status" data-testid="career-recommendations-unavailable">
                <Search aria-hidden="true" />
                <div>
                  <strong>{isEmptyPublishedIndex
                    ? (isZh ? "暂无公开类型建议" : "No public type suggestions are available yet")
                    : (isZh ? "公开职业索引暂时无法加载" : "The public career index is temporarily unavailable")}</strong>
                  <p>{isZh ? "可以先浏览职业库，稍后再查看类型索引。" : "Browse occupations now, or return to the type index later."}</p>
                </div>
              </div>
            )}
          </article>
        </section>

        <section className={styles.evidenceSection} aria-labelledby="career-fit-evidence-title">
          <div className={styles.centeredHeading}>
            <p className={styles.sectionKicker}>{isZh ? "用证据核对候选方向" : "Check candidates against evidence"}</p>
            <h2 id="career-fit-evidence-title">{isZh ? "从类型建议到实际验证" : "From type suggestions to practical checks"}</h2>
          </div>
          <div className={styles.evidenceGrid}>
            {evidenceItems.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className={styles.evidenceCard}>
                  <span className={styles.iconBadge}><Icon aria-hidden="true" /></span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              );
            })}
          </div>
          <p className={styles.disclosure}>
            <CircleCheck aria-hidden="true" />
            {isZh
              ? "职业建议用于缩小探索范围，不替代教育、能力、薪资与机会条件判断。"
              : "Career guidance narrows exploration; it does not replace judgments about education, capability, pay, or opportunity."}
          </p>
        </section>

        <section id="recommendations" className={styles.recommendationsSection} aria-labelledby="career-recommendation-list-title">
          <div className={styles.listHeading}>
            <div>
              <p className={styles.sectionKicker}>MBTI</p>
              <h2 id="career-recommendation-list-title">{isZh ? "按人格类型继续探索" : "Continue by personality type"}</h2>
            </div>
            <p>{isZh ? "类型入口来自公开职业推荐索引；页面不会把人格类型等同于职业结论。" : "These entry points come from the public recommendation index; personality type is never treated as a career verdict."}</p>
          </div>
          {recommendationItems.length > 0 ? (
            <div className={styles.recommendationGrid}>
              {recommendationItems.map((item) => {
                const typeLabel = item.recommendationSubjectMeta.canonicalTypeCode
                  ?? item.recommendationSubjectMeta.typeCode
                  ?? item.recommendationSubjectMeta.displayTitle;
                return (
                  <TrackedCareerLink
                    key={item.recommendationSubjectMeta.publicRouteSlug}
                    href={item.href}
                    eventName={CAREER_TRACKING_EVENTS.recommendationResultClick}
                    eventPayload={{
                      locale,
                      entrySurface: "career_recommendation_index",
                      sourcePageType: "career_recommendation_index",
                      targetAction: "open_recommendation_detail",
                      landingPath: canonicalPath,
                      routeFamily: "recommendations",
                      subjectKind: "recommendation_type",
                      subjectKey: item.recommendationSubjectMeta.publicRouteSlug,
                    }}
                    aria-label={item.recommendationSubjectMeta.displayTitle}
                    className={styles.recommendationLink}
                    data-testid="career-recommendation-index-card"
                    data-career-data-status={item.dataStatus}
                  >
                    <span>
                      <strong>{typeLabel}</strong>
                      <small>{isZh ? "职业适配线索" : "Career-fit signals"}</small>
                    </span>
                    <ArrowRight aria-hidden="true" />
                  </TrackedCareerLink>
                );
              })}
            </div>
          ) : null}
        </section>

        <section className={styles.faqSection} id="faq" aria-labelledby="career-fit-faq-title">
          <div className={styles.faqIntro}>
            <p className={styles.sectionKicker}>{isZh ? "方法边界" : "Method boundaries"}</p>
            <h2 id="career-fit-faq-title">{isZh ? "类型职业索引常见问题" : "Type-based career index questions"}</h2>
            <p>
              {isZh ? "页面更新于" : "Updated"} <time dateTime={PAGE_UPDATED_AT}>{PAGE_UPDATED_AT}</time>{isZh ? "。" : "."}
              {isZh ? "类型入口来自公开 MBTI 职业推荐索引；前三项是索引示例，不是为你排序的职业结果。" : " Entry points come from the public MBTI career recommendation index. The first three entries are examples from that index, not a ranking for you."}
            </p>
            <nav className={styles.faqLinks} aria-label={isZh ? "相关职业页面" : "Related career pages"}>
              <Link href={jobsPath}>{isZh ? "查看职业库" : "Browse occupations"}<ArrowRight aria-hidden="true" /></Link>
              <Link href={guidesPath}>{isZh ? "进入职业路径" : "Open career paths"}<ArrowRight aria-hidden="true" /></Link>
            </nav>
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
