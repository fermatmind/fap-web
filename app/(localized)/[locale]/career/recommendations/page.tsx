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

const PAGE_UPDATED_AT = "2026-09-04";

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
    title: locale === "zh" ? "职业匹配：适合我的职业方向" : "Career Fit: Find Careers That Suit You",
    description:
      locale === "zh"
        ? "结合职业兴趣、人格倾向、工作偏好与现实条件，查看可解释的职业匹配线索和候选方向。"
        : "Use career interests, personality tendencies, work preferences, and practical constraints to explore explainable career-fit signals.",
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
  const pageTitle = isZh ? "找到更适合你的职业" : "Find careers that fit you better";
  const pageDescription = isZh
    ? "综合职业兴趣、人格倾向、工作偏好与现实条件，给出可解释、可比较的职业探索线索。"
    : "Combine career interests, personality tendencies, work preferences, and practical constraints into explainable career exploration signals.";
  const riasecTestPath = withLocale("/tests/holland-career-interest-test-riasec");
  const mbtiTestPath = withLocale("/tests/mbti-personality-test-16-personality-types");
  const jobsPath = withLocale("/career");
  const guidesPath = withLocale("/career/guides");

  const payload = await fetchCareerRecommendationIndex({ locale });
  const recommendationItems = adaptCareerRecommendationIndex({ locale, payload });
  const featuredRecommendations = recommendationItems.slice(0, 3);
  const faqItems = isZh
    ? [
        {
          question: "职业匹配和职业测试有什么区别？",
          answer: "职业测试提供兴趣或人格信号；职业匹配把这些信号与工作任务、环境偏好和现实条件放在一起比较，用于缩小探索范围。",
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
          question: "How is career fit different from a career test?",
          answer: "A career test provides interest or personality signals. Career fit compares those signals with work tasks, environments, and practical constraints to narrow exploration.",
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
    title: isZh ? "可用职业匹配类型" : "Available career-fit types",
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
      title: isZh ? "兴趣吻合" : "Interest alignment",
      description: isZh ? "比较你愿意持续投入的活动，而不是只匹配职位名称。" : "Compare activities you would sustain, not job titles alone.",
    },
    {
      icon: Sparkles,
      title: isZh ? "能力迁移" : "Transferable strengths",
      description: isZh ? "识别可以带入新岗位的经验、方法和协作能力。" : "Identify experience, methods, and collaboration skills that transfer.",
    },
    {
      icon: BriefcaseBusiness,
      title: isZh ? "工作环境" : "Work environment",
      description: isZh ? "核对自主性、节奏、协作方式与现实机会。" : "Check autonomy, pace, collaboration, and real opportunities.",
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
                {isZh ? "开始职业匹配" : "Start career matching"}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <Link href="#recommendations" className={styles.secondaryAction}>
                {isZh ? "已有结果？查看类型建议" : "Have results? View type guidance"}
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
                <p className={styles.sectionKicker}>{isZh ? "三个输入" : "Three inputs"}</p>
                <h2 id="career-profile-title">{isZh ? "建立你的职业画像" : "Build your career profile"}</h2>
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
              {isZh ? "完成的信号越完整，越容易缩小值得验证的职业范围。" : "More complete inputs make it easier to narrow the careers worth validating."}
            </p>
          </article>

          <article className={styles.previewCard}>
            <div className={styles.sectionHeadingRow}>
              <span className={styles.iconBadge}><Sparkles aria-hidden="true" /></span>
              <div>
                <p className={styles.sectionKicker}>{isZh ? "公开匹配入口" : "Public fit entry points"}</p>
                <h2>{isZh ? "从真实结果继续" : "Continue from a real result"}</h2>
              </div>
            </div>
            {featuredRecommendations.length > 0 ? (
              <div className={styles.previewRows}>
                {featuredRecommendations.map((item, index) => {
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
                      <span className={styles.previewRank}>{String(index + 1).padStart(2, "0")}</span>
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
                  <strong>{isZh ? "职业匹配暂时无法加载" : "Career fit is temporarily unavailable"}</strong>
                  <p>{isZh ? "这不是空结果，请稍后重试或先浏览职业库。" : "This is not an empty result. Try again later or browse occupations."}</p>
                </div>
              </div>
            )}
          </article>
        </section>

        <section className={styles.evidenceSection} aria-labelledby="career-fit-evidence-title">
          <div className={styles.centeredHeading}>
            <p className={styles.sectionKicker}>{isZh ? "可解释，而不是黑盒" : "Explainable, not a black box"}</p>
            <h2 id="career-fit-evidence-title">{isZh ? "为什么推荐这些方向" : "Why these directions are recommended"}</h2>
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
            <h2 id="career-fit-faq-title">{isZh ? "职业匹配常见问题" : "Career-fit questions"}</h2>
            <p>
              {isZh ? "页面更新于" : "Updated"} <time dateTime={PAGE_UPDATED_AT}>{PAGE_UPDATED_AT}</time>{isZh ? "。" : "."}
              {isZh ? "匹配入口由公开职业推荐 API 提供，方法说明用于帮助你正确理解结果。" : " Entry points are supplied by the public career recommendation API; method notes help you interpret them correctly."}
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
