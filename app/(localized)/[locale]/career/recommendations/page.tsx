import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowDownRight, ArrowRight, Compass, ListChecks, Search } from "lucide-react";
import { TrackedCareerLink } from "@/components/analytics/TrackedCareerLink";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { buttonVariants } from "@/components/ui/button";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";
import { adaptCareerRecommendationIndex } from "@/lib/career/adapters/adaptCareerRecommendationIndex";
import { fetchCareerRecommendationIndex } from "@/lib/career/api/fetchCareerRecommendationIndex";
import { CAREER_TRACKING_EVENTS, buildCareerAttributionPayload } from "@/lib/career/attribution";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { buildPageMetadata } from "@/lib/seo/metadata";
import styles from "./recommendations.module.css";

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
    title: locale === "zh" ? "职业推荐" : "Career Recommendations",
    description:
      locale === "zh"
        ? "从测评结果进入职业方向建议，再下钻到候选职业。"
        : "Start from an assessment result, choose a direction, then drill into candidate roles.",
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

  const payload = await fetchCareerRecommendationIndex({ locale });
  const recommendationItems = adaptCareerRecommendationIndex({ locale, payload });
  const canonicalPath = isZh ? "/zh/career/recommendations" : "/en/career/recommendations";
  const riasecTestPath = withLocale("/tests/holland-career-interest-test-riasec");
  const jobsPath = withLocale("/career");
  const industriesPath = withLocale("/career/industries");
  const guidesPath = withLocale("/career/guides");
  const webPageJsonLd = buildWebPageJsonLd({
    path: canonicalPath,
    title: isZh ? "职业推荐" : "Career Recommendations",
    description: isZh
      ? "从测评结果进入职业方向建议，再下钻到候选职业。"
      : "Start from an assessment result, choose a direction, then drill into candidate roles.",
    locale,
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: isZh ? "首页" : "Home", path: isZh ? "/zh" : "/en" },
    { name: isZh ? "职业" : "Career", path: isZh ? "/zh/career" : "/en/career" },
    { name: isZh ? "职业推荐" : "Recommendations", path: canonicalPath },
  ]);

  const journeySteps = isZh
    ? [
        {
          number: "01",
          title: "先读懂自己",
          description: "从兴趣、工作偏好与行为倾向中，找到值得继续观察的信号。",
        },
        {
          number: "02",
          title: "再对照职业",
          description: "核对真实工作任务、协作环境与技能要求，而不是只看职位名称。",
        },
        {
          number: "03",
          title: "最后用行动验证",
          description: "通过小项目、信息访谈或学习计划，验证方向并补齐技能差距。",
        },
      ]
    : [
        {
          number: "01",
          title: "Read your signals",
          description: "Use interests, work preferences, and behavioral tendencies to identify directions worth testing.",
        },
        {
          number: "02",
          title: "Compare real roles",
          description: "Check actual tasks, work environments, and skill requirements—not just job titles.",
        },
        {
          number: "03",
          title: "Validate through action",
          description: "Use a small project, an informational interview, or a learning plan to test the direction and close gaps.",
        },
      ];

  return (
    <main className="min-h-screen bg-[var(--fm-bg-page)]">
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

      <section className={styles.hero} data-testid="career-recommendations-hero">
        <Container as="div" className={styles.heroInner}>
          <div className={styles.heroBreadcrumb}>
            <Breadcrumb
              items={[
                { label: isZh ? "首页" : "Home", href: localizedPath("/", locale) },
                { label: isZh ? "职业" : "Career", href: localizedPath("/career", locale) },
                { label: isZh ? "职业推荐" : "Recommendations" },
              ]}
            />
          </div>

          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>{isZh ? "职业适配 · CAREER FIT" : "CAREER FIT · A PRACTICAL PATH"}</p>
              <h1 className="m-0 max-w-3xl font-serif text-[clamp(2.45rem,6vw,5.4rem)] font-semibold leading-[0.98] tracking-[-0.035em] text-white">
                {isZh ? (
                  <>
                    职业推荐不是一个答案，
                    <span className={styles.heroAccent}>而是一条验证路径。</span>
                  </>
                ) : (
                  <>
                    Find your fit.
                    <span className={styles.heroAccent}>Then test it.</span>
                  </>
                )}
              </h1>
              <p className="m-0 max-w-xl text-base leading-8 text-white/70 md:text-lg">
                {isZh
                  ? "先看兴趣和工作偏好，再对照岗位任务与技能要求，最后用真实行动验证方向。"
                  : "Career guidance is a starting hypothesis: compare your interests with role requirements, then validate the direction through real action."}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href={riasecTestPath} className={buttonVariants({ size: "lg" })}>
                  {isZh ? "从职业兴趣开始" : "Start with career interests"}
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
                <Link href={jobsPath} className={styles.heroSecondaryAction}>
                  {isZh ? "浏览职业库" : "Browse occupations"}
                </Link>
              </div>
              <Link href="#recommendations" className={styles.heroTextLink}>
                {isZh ? "已有 MBTI 结果？直接查看对应建议" : "Already know your MBTI result? Open your guidance"}
                <ArrowDownRight aria-hidden="true" className="size-4" />
              </Link>
            </div>

            <CareerPathVisual isZh={isZh} />
          </div>
        </Container>
      </section>

      <Container
        as="div"
        className="space-y-24 py-20 md:space-y-[var(--fm-space-30)] md:py-[var(--fm-space-24)]"
      >
        <section data-testid="career-recommendations-source-entry" aria-labelledby="career-start-title">
          <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
            <div>
              <p className="m-0 text-xs font-bold uppercase tracking-[0.18em] text-[var(--fm-cta-orange)]">
                {isZh ? "从当前位置开始" : "Start where you are"}
              </p>
              <h2 id="career-start-title" className="m-0 mt-4 max-w-md font-serif text-3xl font-semibold leading-tight tracking-tight text-[var(--fm-text)] md:text-4xl">
                {isZh ? "你不需要先想清楚所有问题" : "You do not need every answer before you begin"}
              </h2>
              <p className="m-0 mt-5 max-w-md text-base leading-7 text-[var(--fm-text-secondary)]">
                {isZh
                  ? "选择最接近你当前状态的入口。每条路径都会带你回到同一件事：用证据缩小选择。"
                  : "Choose the entry that matches your current situation. Each path helps you narrow choices with evidence."}
              </p>
            </div>

            <div className="border-t border-[var(--fm-border-strong)]">
              <SourceRow
                icon={<Compass aria-hidden="true" className="size-5" />}
                title={isZh ? "还没有明确方向" : "I am not sure yet"}
                description={isZh ? "用职业兴趣测评，先找到愿意长期投入的活动与环境。" : "Use a career-interest assessment to identify activities and environments worth exploring."}
                action={isZh ? "识别兴趣" : "Map my interests"}
                href={riasecTestPath}
              />
              <SourceRow
                icon={<ListChecks aria-hidden="true" className="size-5" />}
                title={isZh ? "已经知道 MBTI 类型" : "I know my MBTI type"}
                description={isZh ? "把人格偏好当作职业线索，查看对应方向与取舍。" : "Use personality preferences as career signals and review the relevant trade-offs."}
                action={isZh ? "查看建议" : "View guidance"}
                href="#recommendations"
              />
              <SourceRow
                icon={<Search aria-hidden="true" className="size-5" />}
                title={isZh ? "已经有目标职业" : "I have a role in mind"}
                description={isZh ? "直接核对工作内容、任职要求与发展路径。" : "Go straight to the work, requirements, and development path."}
                action={isZh ? "检索职业" : "Search occupations"}
                href={jobsPath}
              />
            </div>
          </div>
        </section>

        <section className={styles.methodSection} aria-labelledby="career-method-title">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <p className="m-0 text-xs font-bold uppercase tracking-[0.18em] text-[var(--fm-cta-orange)]">
                {isZh ? "一条可靠的判断路径" : "A better decision path"}
              </p>
              <h2 id="career-method-title" className="m-0 mt-4 max-w-md font-serif text-3xl font-semibold leading-tight tracking-tight text-[var(--fm-text)] md:text-4xl">
                {isZh ? "推荐要经过三次判断" : "Good guidance passes three checks"}
              </h2>
              <p className="m-0 mt-5 max-w-md text-base leading-7 text-[var(--fm-text-secondary)]">
                {isZh
                  ? "人格或兴趣不能直接等同于某个职业。它们负责提出假设，岗位信息与真实行动负责验证。"
                  : "Personality and interests do not equal a job. They form a hypothesis; role evidence and real action test it."}
              </p>
            </div>

            <ol className="m-0 list-none border-t border-[var(--fm-border-strong)] p-0">
              {journeySteps.map((step) => (
                <li key={step.number} className={styles.methodStep}>
                  <span className="font-mono text-xs font-semibold tracking-[0.12em] text-[var(--fm-cta-orange)]">{step.number}</span>
                  <div>
                    <h3 className="m-0 font-serif text-2xl font-semibold text-[var(--fm-text)]">{step.title}</h3>
                    <p className="m-0 mt-3 max-w-xl text-sm leading-7 text-[var(--fm-text-secondary)] md:text-base">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          id="recommendations"
          className="scroll-mt-24"
          data-testid="career-recommendation-source-mbti"
          aria-labelledby="career-recommendation-list-title"
        >
          <div className="flex flex-col justify-between gap-5 border-b border-[var(--fm-border-strong)] pb-8 md:flex-row md:items-end">
            <div>
              <p className="m-0 text-xs font-bold uppercase tracking-[0.18em] text-[var(--fm-cta-orange)]">MBTI</p>
              <h2 id="career-recommendation-list-title" className="m-0 mt-4 font-serif text-3xl font-semibold tracking-tight text-[var(--fm-text)] md:text-4xl">
                {isZh ? "已有结果？从你的类型继续" : "Have a result? Continue from your type"}
              </h2>
            </div>
            <p className="m-0 max-w-md text-sm leading-6 text-[var(--fm-text-secondary)]">
              {isZh
                ? "这里提供的是职业探索线索，不是“某种人格只能做某种工作”的结论。"
                : "These are exploration signals, not claims that one personality type belongs in one kind of job."}
            </p>
          </div>

          {recommendationItems.length === 0 ? (
            <div
              className="border-b border-[var(--fm-border)] px-4 py-14 text-center"
              data-testid="career-recommendations-unavailable"
              role="status"
            >
              <p className="m-0 text-lg font-semibold text-[var(--fm-text)]">
                {isZh ? "职业推荐暂不可用" : "Career recommendations are temporarily unavailable"}
              </p>
              <p className="mx-auto m-0 mt-2 max-w-xl text-sm leading-6 text-[var(--fm-text-muted)]">
                {isZh ? "请稍后再试，或先浏览职业库。" : "Please try again later, or browse the occupation library for now."}
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4">
              {recommendationItems.map((item) => {
                const typeLabel =
                  item.recommendationSubjectMeta.canonicalTypeCode ??
                  item.recommendationSubjectMeta.typeCode ??
                  item.recommendationSubjectMeta.displayTitle;

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
                      <span className="block font-serif text-2xl font-semibold tracking-tight">{typeLabel}</span>
                      <span className="mt-1 block text-xs text-[var(--fm-text-muted)] transition-colors group-hover:text-white/65">
                        {isZh ? "查看职业适配线索" : "View career-fit signals"}
                      </span>
                    </span>
                    <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1" />
                  </TrackedCareerLink>
                );
              })}
            </div>
          )}
        </section>

        <section className={styles.finalSection} aria-labelledby="career-next-title">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-end lg:gap-20">
            <div>
              <p className="m-0 text-xs font-bold uppercase tracking-[0.18em] text-orange-200">
                {isZh ? "把方向变成下一步" : "Turn direction into action"}
              </p>
              <h2 id="career-next-title" className="m-0 mt-4 max-w-xl font-serif text-3xl font-semibold leading-tight tracking-tight text-white md:text-5xl">
                {isZh ? "方向只有落到行动，才会越来越清晰。" : "A direction becomes clearer only when you act on it."}
              </h2>
            </div>
            <p className="m-0 max-w-xl text-base leading-7 text-white/70">
              {isZh
                ? "进入职业库核对真实工作内容，按行业横向比较，再用职业指南把技能差距拆成可执行的小步骤。"
                : "Review real work in the occupation library, compare roles by industry, then use career guides to turn skill gaps into practical steps."}
            </p>
          </div>
          <nav className="mt-12 grid border-t border-white/20 md:grid-cols-3" aria-label={isZh ? "职业探索下一步" : "Career exploration next steps"}>
            <FooterLink href={jobsPath} label={isZh ? "浏览全部职业" : "Browse all occupations"} />
            <FooterLink href={industriesPath} label={isZh ? "按行业比较" : "Compare by industry"} />
            <FooterLink href={guidesPath} label={isZh ? "阅读职业指南" : "Read career guides"} />
          </nav>
        </section>
      </Container>
    </main>
  );
}

function CareerPathVisual({ isZh }: { isZh: boolean }) {
  return (
    <div className={styles.pathVisual} aria-hidden="true">
      <div className={styles.pathGrid} />
      <svg className={styles.pathLine} viewBox="0 0 560 480" fill="none">
        <path d="M58 358C128 196 212 394 287 228C356 76 444 124 506 58" pathLength="1" />
        <circle cx="63" cy="348" r="7" />
        <circle cx="287" cy="228" r="7" />
        <circle cx="503" cy="61" r="7" />
      </svg>
      <div className={`${styles.pathNode} ${styles.pathNodeOne}`}>
        <span>01</span>
        <strong>{isZh ? "兴趣与偏好" : "Interests"}</strong>
      </div>
      <div className={`${styles.pathNode} ${styles.pathNodeTwo}`}>
        <span>02</span>
        <strong>{isZh ? "岗位与环境" : "Role context"}</strong>
      </div>
      <div className={`${styles.pathNode} ${styles.pathNodeThree}`}>
        <span>03</span>
        <strong>{isZh ? "技能与行动" : "Skills + action"}</strong>
      </div>
      <p className={styles.pathCaption}>{isZh ? "适配，是一个等待验证的假设" : "FIT IS A HYPOTHESIS TO TEST"}</p>
    </div>
  );
}

function SourceRow({
  icon,
  title,
  description,
  action,
  href,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action: string;
  href: string;
}) {
  return (
    <Link href={href} className={styles.sourceRow}>
      <span className={styles.sourceIcon}>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-lg font-semibold tracking-tight text-[var(--fm-text)]">{title}</span>
        <span className="mt-1 block text-sm leading-6 text-[var(--fm-text-secondary)]">{description}</span>
      </span>
      <span className="flex shrink-0 items-center gap-2 text-sm font-semibold text-[var(--fm-cta-orange)]">
        <span className="hidden sm:inline">{action}</span>
        <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className={styles.footerLink}>
      <span>{label}</span>
      <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1" />
    </Link>
  );
}
