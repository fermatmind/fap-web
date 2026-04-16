import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { ClaimGuard } from "@/components/career/ClaimGuard";
import { CareerExplainabilityPanel } from "@/components/career/CareerExplainabilityPanel";
import { StrainRadar } from "@/components/career/StrainRadar";
import { CareerProjectionDeltaPanel } from "@/components/career/timeline/CareerProjectionDeltaPanel";
import { CareerProjectionTimeline } from "@/components/career/timeline/CareerProjectionTimeline";
import { CareerShortlistAction } from "@/components/career/CareerShortlistAction";
import { TrustStrip } from "@/components/career/TrustStrip";
import { WarningBanner } from "@/components/career/WarningBanner";
import { ConfidenceBadge, ConfidenceBoundary } from "@/components/career/v1/ConfidenceBoundary";
import { EvidenceDrawer } from "@/components/career/v1/EvidenceDrawer";
import { NextStepRail, type NextStepRailItem } from "@/components/career/v1/NextStepRail";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { buttonVariants } from "@/components/ui/button";
import { adaptCareerFirstWaveNextStepLinks } from "@/lib/career/adapters/adaptCareerFirstWaveNextStepLinks";
import { adaptCareerJobExplainability } from "@/lib/career/adapters/adaptCareerExplainability";
import { adaptCareerJobBundle } from "@/lib/career/adapters/adaptCareerJobBundle";
import { adaptCareerRuntimeConfig } from "@/lib/career/adapters/adaptCareerRuntimeConfig";
import type {
  CareerExplainabilityAdapter,
  CareerFirstWaveNextStepLinksSummaryAdapter,
  CareerJobBundleAdapter,
  CareerRuntimeConfigAdapter,
} from "@/lib/career/adapters/types";
import { CAREER_TRACKING_EVENTS, buildCareerAttributionPayload } from "@/lib/career/attribution";
import { fetchCareerFirstWaveNextStepLinks } from "@/lib/career/api/fetchCareerFirstWaveNextStepLinks";
import { fetchCareerJobExplainability } from "@/lib/career/api/fetchCareerJobExplainability";
import { fetchCareerJobBundle } from "@/lib/career/api/fetchCareerJobBundle";
import { fetchCareerRuntimeConfig } from "@/lib/career/api/fetchCareerRuntimeConfig";
import {
  buildCareerFamilyFrontendUrl,
  buildCareerJobFrontendUrl,
  normalizeCareerBundleCanonicalPath,
} from "@/lib/career/urls";
import { getCareerV1RendererCopy, getCareerV1StateCopy } from "@/lib/career/ui/stateCopy";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

function buildCanonicalPath(slug: string, locale: Locale): string {
  return buildCareerJobFrontendUrl(locale, slug);
}

function formatUsdAnnual(value: number | null, locale: Locale): string {
  if (value === null) {
    return locale === "zh" ? "暂未提供" : "Not available yet";
  }

  return new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number | null): string {
  if (value === null) {
    return "—";
  }

  return `${value}%`;
}

function renderScoreValue(value: number | null): string {
  return value === null ? "—" : String(value);
}

function shouldNoindex(indexState: string | null | undefined): boolean {
  const normalized = String(indexState ?? "").trim().toLowerCase();
  return normalized === "blocked" || normalized === "noindex" || normalized === "unavailable";
}

async function loadCareerJobBundle(locale: Locale, slug: string): Promise<CareerJobBundleAdapter | null> {
  const payload = await fetchCareerJobBundle({ locale, slug });
  return adaptCareerJobBundle({ locale, requestedSlug: slug, payload });
}

async function loadCareerJobExplainability(locale: Locale, slug: string): Promise<CareerExplainabilityAdapter | null> {
  const payload = await fetchCareerJobExplainability({ locale, slug });
  return adaptCareerJobExplainability(payload);
}

async function loadCareerNextStepLinks(locale: Locale, slug: string): Promise<CareerFirstWaveNextStepLinksSummaryAdapter | null> {
  const payload = await fetchCareerFirstWaveNextStepLinks({ locale, slug });
  return adaptCareerFirstWaveNextStepLinks({ payload });
}

async function loadRuntimeConfig(locale: Locale): Promise<CareerRuntimeConfigAdapter> {
  const payload = await fetchCareerRuntimeConfig({ locale });
  return adaptCareerRuntimeConfig(payload);
}

type CareerRendererContractState = "blocked" | "provisional" | "restricted";

function getJobRendererContractState(job: CareerJobBundleAdapter): CareerRendererContractState | null {
  if (job.renderState.careerDataStatus === "unavailable" || !job.renderState.canIndexPage) {
    return "blocked";
  }

  if (job.renderState.careerDataStatus === "trust_limited") {
    return "provisional";
  }

  if (!job.renderState.canRenderSalarySurface || !job.renderState.canRenderAnswerSurface || !job.renderState.canRenderFitSurface) {
    return "restricted";
  }

  return null;
}

function renderJobBoundary(job: CareerJobBundleAdapter, locale: Locale) {
  const rendererState = getJobRendererContractState(job);
  const stateCopy = rendererState ? getCareerV1RendererCopy(rendererState) : getCareerV1StateCopy(job.renderState.careerDataStatus);

  if (!stateCopy || stateCopy.tone === "complete") {
    return null;
  }

  return (
    <ConfidenceBoundary
      tone={stateCopy.tone}
      title={stateCopy.label}
      description={stateCopy.description}
      actionLabel={locale === "zh" ? "查看依据" : "View evidence"}
    />
  );
}

function renderCareerJobProtocolStatus(job: CareerJobBundleAdapter) {
  return (
    <div
      className="sr-only"
      data-testid="career-job-protocol-status"
      data-career-data-status={job.renderState.careerDataStatus}
      data-renderer-state={getJobRendererContractState(job) ?? "complete"}
      data-index-eligible={job.seoContract.indexEligible ? "true" : "false"}
    >
      Career claim gate
    </div>
  );
}

function buildNextStepRailItems(
  locale: Locale,
  summary: CareerFirstWaveNextStepLinksSummaryAdapter | null,
  landingPath: string
): NextStepRailItem[] {
  const items: NextStepRailItem[] = [];

  if (summary) {
    for (const link of summary.familyHubLinks) {
      items.push({
        title: locale === "zh" ? "进入职业家族" : "Open career family",
        description: link.titleEn ?? link.canonicalSlug,
        href: normalizeCareerBundleCanonicalPath(locale, link.canonicalPath, buildCareerFamilyFrontendUrl(locale, link.canonicalSlug)),
      });
    }

    for (const link of summary.jobDetailLinks) {
      items.push({
        title: link.canonicalTitleEn ?? (locale === "zh" ? "相关职业" : "Related role"),
        description: locale === "zh" ? "查看相邻职业资料。" : "Inspect a related role profile.",
        href: normalizeCareerBundleCanonicalPath(locale, link.canonicalPath, buildCareerJobFrontendUrl(locale, link.canonicalSlug)),
        eventName: CAREER_TRACKING_EVENTS.jobDetailCtaClick,
        eventPayload: {
          locale,
          entrySurface: "career_job_detail",
          sourcePageType: "career_job_detail",
          targetAction: "open_next_step_link",
          landingPath,
          routeFamily: "job_detail",
          subjectKind: "job_slug",
          subjectKey: link.canonicalSlug,
          queryMode: "non_query",
        },
      });
    }
  }

  items.push({
    title: locale === "zh" ? "回到职业库" : "Back to job library",
    description: locale === "zh" ? "继续比较其他职业。" : "Compare this with other roles.",
    href: localizedPath("/career/jobs", locale),
  });

  return items.slice(0, 3);
}

function MetricCard({ title, value, caption }: { title: string; value: string; caption: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="m-0 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">{title}</p>
      <p className="m-0 mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
      <p className="m-0 mt-2 text-sm leading-6 text-slate-500">{caption}</p>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  const locale = resolveLocale(localeParam);
  const job = await loadCareerJobBundle(locale, slug);

  if (!job) {
    return { title: "Not Found", robots: { index: false, follow: false } };
  }

  const canonicalPath = normalizeCareerBundleCanonicalPath(locale, job.seoContract.canonicalPath, buildCanonicalPath(job.slug, locale));
  const title = `${job.title} | FermatMind`;
  const description = job.summary || (locale === "zh" ? `${job.title} 的职业概览、匹配信号与下一步路径。` : `Overview, fit signals, and next steps for ${job.title}.`);

  return buildPageMetadata({
    locale,
    pathname: canonicalPath,
    title,
    description,
    explicitIndexGate: {
      indexEligible: job.seoContract.indexEligible,
      indexState: job.seoContract.indexState,
    },
    noindex: !job.renderState.canIndexPage || shouldNoindex(job.seoContract.indexState),
    alternatesByLocale: {
      en: buildCareerJobFrontendUrl("en", job.slug),
      zh: buildCareerJobFrontendUrl("zh", job.slug),
      xDefault: "/",
    },
  });
}

export default async function CareerJobDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: localeParam, slug } = await params;
  const locale = resolveLocale(localeParam);
  const [job, explainability, nextStepLinks, runtimeConfig] = await Promise.all([
    loadCareerJobBundle(locale, slug),
    loadCareerJobExplainability(locale, slug),
    loadCareerNextStepLinks(locale, slug),
    loadRuntimeConfig(locale),
  ]);

  if (!job) {
    return notFound();
  }

  const renderState = job.renderState;
  const canRenderAiStrategy = job.claimPermissions.allow_ai_strategy && renderState.careerDataStatus !== "unavailable";
  const canRenderAnswerSurface = renderState.canRenderAnswerSurface;
  const jobDetailLandingPath = localizedPath(`/career/jobs/${job.slug}`, locale);
  const salaryClaimBlocked =
    !renderState.canRenderSalarySurface &&
    !job.claimPermissions.allow_salary_comparison &&
    job.truthLayer.medianPayUsdAnnual !== null &&
    renderState.careerDataStatus !== "unavailable";
  const strongClaimBlocked =
    !canRenderAnswerSurface &&
    !job.claimPermissions.allow_strong_claim &&
    (job.truthLayer.outlookPct20242034 !== null ||
      job.truthLayer.entryEducation !== null ||
      job.truthLayer.workExperience !== null ||
      job.truthLayer.onTheJobTraining !== null ||
      job.scoreBundle.fitScore.value !== null);
  const aiStrategyClaimBlocked =
    canRenderAnswerSurface &&
    !job.claimPermissions.allow_ai_strategy &&
    renderState.careerDataStatus !== "unavailable" &&
    job.truthLayer.aiExposure !== null;
  const stateCopy = getCareerV1StateCopy(renderState.careerDataStatus);
  const nextSteps = buildNextStepRailItems(locale, nextStepLinks, jobDetailLandingPath);

  return (
    <main className="min-h-screen bg-slate-50">
      <Container as="div" className="space-y-12 py-12 md:space-y-16 md:py-20">
        <AnalyticsPageViewTracker
          eventName={CAREER_TRACKING_EVENTS.jobDetailView}
          properties={buildCareerAttributionPayload({
            locale,
            entrySurface: "career_job_detail",
            sourcePageType: "career_job_detail",
            targetAction: "view_surface",
            landingPath: jobDetailLandingPath,
            routeFamily: "job_detail",
            subjectKind: "job_slug",
            subjectKey: job.slug,
          })}
        />
        {salaryClaimBlocked ? (
          <AnalyticsPageViewTracker
            eventName={CAREER_TRACKING_EVENTS.claimBlockedSurfaceExposed}
            trackingKey={`claim-blocked:salary:${job.slug}`}
            properties={buildCareerAttributionPayload({
              locale,
              entrySurface: "career_job_detail",
              sourcePageType: "career_job_detail",
              targetAction: "expose_claim_blocked_surface",
              landingPath: jobDetailLandingPath,
              routeFamily: "job_detail",
              subjectKind: "job_slug",
              subjectKey: job.slug,
              blockedClaimKind: "salary",
            })}
          />
        ) : null}
        {strongClaimBlocked ? (
          <AnalyticsPageViewTracker
            eventName={CAREER_TRACKING_EVENTS.claimBlockedSurfaceExposed}
            trackingKey={`claim-blocked:strong-claim:${job.slug}`}
            properties={buildCareerAttributionPayload({
              locale,
              entrySurface: "career_job_detail",
              sourcePageType: "career_job_detail",
              targetAction: "expose_claim_blocked_surface",
              landingPath: jobDetailLandingPath,
              routeFamily: "job_detail",
              subjectKind: "job_slug",
              subjectKey: job.slug,
              blockedClaimKind: "strong_claim",
            })}
          />
        ) : null}
        {aiStrategyClaimBlocked ? (
          <AnalyticsPageViewTracker
            eventName={CAREER_TRACKING_EVENTS.claimBlockedSurfaceExposed}
            trackingKey={`claim-blocked:ai-strategy:${job.slug}`}
            properties={buildCareerAttributionPayload({
              locale,
              entrySurface: "career_job_detail",
              sourcePageType: "career_job_detail",
              targetAction: "expose_claim_blocked_surface",
              landingPath: jobDetailLandingPath,
              routeFamily: "job_detail",
              subjectKind: "job_slug",
              subjectKey: job.slug,
              blockedClaimKind: "ai_strategy",
            })}
          />
        ) : null}
        {job.structuredData.occupation ? <JsonLd id={`career-job-occupation-${job.slug}`} data={job.structuredData.occupation} /> : null}
        {job.structuredData.breadcrumbList ? <JsonLd id={`career-job-breadcrumb-${job.slug}`} data={job.structuredData.breadcrumbList} /> : null}
        <Breadcrumb
          items={[
            { label: locale === "zh" ? "首页" : "Home", href: localizedPath("/", locale) },
            { label: locale === "zh" ? "职业" : "Career", href: localizedPath("/career", locale) },
            { label: locale === "zh" ? "职业库" : "Jobs", href: localizedPath("/career/jobs", locale) },
            { label: job.title },
          ]}
        />

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]" data-testid="career-job-v1-overview">
          <div className="space-y-5">
            <ConfidenceBadge tone={stateCopy.tone}>{stateCopy.label}</ConfidenceBadge>
            <h1 className="m-0 text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">{job.title}</h1>
            {job.summary ? <p className="m-0 max-w-3xl text-base leading-8 text-slate-600">{job.summary}</p> : null}
            {renderJobBoundary(job, locale)}
            <div className="flex flex-wrap gap-3">
              <CareerShortlistAction
                locale={locale}
                subjectSlug={job.slug}
                sourcePageType="career_job_detail"
                entrySurface="career_job_detail"
                routeFamily="job_detail"
                landingPath={jobDetailLandingPath}
                testId="career-job-shortlist-action"
              />
              <Link href={localizedPath("/career/jobs", locale)} className={buttonVariants({ variant: "outline" })}>
                {locale === "zh" ? "回到职业库" : "Back to job library"}
              </Link>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="m-0 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              {locale === "zh" ? "当前判断" : "Current read"}
            </p>
            <p className="m-0 mt-3 text-sm leading-6 text-slate-500">
              {locale === "zh" ? "先看概览，再看匹配边界，最后选择下一步。" : "Start with the overview, check fit boundaries, then pick the next step."}
            </p>
          </div>
        </section>

        <section className="space-y-4" data-testid="career-job-v1-at-a-glance">
          <h2 className="m-0 text-2xl font-semibold tracking-tight text-slate-950">
            {locale === "zh" ? "一眼判断" : "At a glance"}
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              title={locale === "zh" ? "适合度" : "Fit"}
              value={job.renderState.canRenderFitSurface ? renderScoreValue(job.scoreBundle.fitScore.value) : "—"}
              caption={locale === "zh" ? "用于初步判断是否值得继续看。" : "A first signal for whether to keep exploring."}
            />
            <MetricCard
              title={locale === "zh" ? "压力/损耗" : "Strain"}
              value={job.renderState.canRenderFitSurface ? renderScoreValue(job.scoreBundle.strainScore.value) : "—"}
              caption={locale === "zh" ? "越需要谨慎，越应该看边界说明。" : "Higher strain means the boundaries matter more."}
            />
            <MetricCard
              title={locale === "zh" ? "转型难度" : "Transition"}
              value={renderScoreValue(job.scoreBundle.mobilityScore.value)}
              caption={locale === "zh" ? "用于判断从相邻路径切入的难度。" : "A compact signal for moving in from adjacent paths."}
            />
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2" data-testid="career-job-v1-fit-and-facts">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <h2 className="m-0 text-2xl font-semibold tracking-tight text-slate-950">
              {locale === "zh" ? "适不适合继续看？" : "Is this worth exploring?"}
            </h2>
            <div className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
              <p className="m-0">{locale === "zh" ? `适合度：${renderScoreValue(job.scoreBundle.fitScore.value)}` : `Fit signal: ${renderScoreValue(job.scoreBundle.fitScore.value)}`}</p>
              <p className="m-0">{locale === "zh" ? `信心：${renderScoreValue(job.scoreBundle.confidenceScore.value)}` : `Confidence: ${renderScoreValue(job.scoreBundle.confidenceScore.value)}`}</p>
              {canRenderAnswerSurface ? (
                <p className="m-0">{locale === "zh" ? `十年趋势：${formatPercent(job.truthLayer.outlookPct20242034)}` : `Ten-year outlook: ${formatPercent(job.truthLayer.outlookPct20242034)}`}</p>
              ) : null}
            </div>
            <ClaimGuard
              allowed={canRenderAnswerSurface}
              fallback={
                <div className="mt-5">
                  <ConfidenceBoundary
                    tone="limited"
                    title={locale === "zh" ? "暂不做强推荐判断" : "Strong recommendation is not open yet"}
                    description={locale === "zh" ? "当前数据不足以做强匹配判断，但你仍可以查看职业概览和下一步。" : "There is not enough data for a strong fit judgment, but the overview and next steps remain available."}
                  />
                </div>
              }
            >
              <p className="m-0 mt-5 text-sm leading-6 text-slate-500">
                {locale === "zh" ? "这页可以用于继续比较，但建议结合测评推荐页一起判断。" : "Use this page as one comparison point, then validate with a recommendation path."}
              </p>
            </ClaimGuard>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6" data-testid="career-job-v1-claim-safe-facts">
            <h2 className="m-0 text-2xl font-semibold tracking-tight text-slate-950">
              {locale === "zh" ? "你需要知道" : "What you should know"}
            </h2>
            <div className="mt-5 grid gap-3 text-sm leading-6 text-slate-600">
              <ClaimGuard
                allowed={job.renderState.canRenderSalarySurface}
                fallback={
                  <ConfidenceBoundary
                    tone="limited"
                    title={locale === "zh" ? "薪资结论暂不开放" : "Salary claim is not open yet"}
                    description={locale === "zh" ? "这部分还需要更多数据支持。" : "This section needs more supporting data before display."}
                  />
                }
              >
                <p className="m-0">{locale === "zh" ? "薪资" : "Salary"}: {formatUsdAnnual(job.truthLayer.medianPayUsdAnnual, locale)}</p>
              </ClaimGuard>
              {job.truthLayer.entryEducation ? <p className="m-0">{locale === "zh" ? "入门学历" : "Entry education"}: {job.truthLayer.entryEducation}</p> : null}
              {job.truthLayer.workExperience ? <p className="m-0">{locale === "zh" ? "工作经验" : "Work experience"}: {job.truthLayer.workExperience}</p> : null}
              {job.truthLayer.onTheJobTraining ? <p className="m-0">{locale === "zh" ? "在岗训练" : "On-the-job training"}: {job.truthLayer.onTheJobTraining}</p> : null}
              {canRenderAiStrategy && job.truthLayer.aiExposure !== null ? <p className="m-0">AI exposure: {job.truthLayer.aiExposure}</p> : null}
              {aiStrategyClaimBlocked ? (
                <ConfidenceBoundary
                  tone="limited"
                  title={locale === "zh" ? "AI 影响判断暂不开放" : "AI impact claim is not open yet"}
                  description={locale === "zh" ? "这部分还需要更多数据支持。" : "This section needs more supporting data before display."}
                />
              ) : null}
            </div>
          </div>
        </section>

        <section data-testid="career-job-next-step-links">
          <NextStepRail
            title={locale === "zh" ? "下一步" : "Next steps"}
            description={locale === "zh" ? "只保留少量真实可走的路径。" : "A short list of real paths you can take from here."}
            items={nextSteps}
            testId="career-job-v1-next-steps"
          />
        </section>

        <section className="space-y-3" data-testid="career-job-v1-evidence">
          <EvidenceDrawer title={locale === "zh" ? "查看评分依据" : "View scoring basis"} testId="career-job-v1-score-drawer">
            {job.whiteBoxScores.strainScore?.radarDimensions ? (
              <StrainRadar locale={locale} dimensions={job.whiteBoxScores.strainScore.radarDimensions} testId="career-job-strain-radar" />
            ) : null}
            {explainability ? (
              <CareerExplainabilityPanel
                locale={locale}
                explainability={explainability}
                title={locale === "zh" ? "评分说明" : "Scoring explanation"}
                subtitle={locale === "zh" ? "复杂评分依据默认折叠，避免干扰主要决策。" : "Detailed scoring is folded by default so it does not dominate the decision flow."}
                testId="career-job-explainability-panel"
                showStrainRadar={false}
              />
            ) : null}
          </EvidenceDrawer>

          <EvidenceDrawer title={locale === "zh" ? "查看信任边界" : "View trust boundaries"} testId="career-job-v1-boundary-drawer">
            {renderCareerJobProtocolStatus(job)}
            <div className="sr-only" data-testid="career-job-claim-gated-status">
              Salary: {renderState.canRenderSalarySurface ? "open" : "closed"}; fit: {renderState.canRenderFitSurface ? "open" : "closed"}; answer: {renderState.canRenderAnswerSurface ? "open" : "closed"}
            </div>
            <div data-testid="career-job-renderer-status" data-renderer-state={getJobRendererContractState(job) ?? "complete"}>
              {renderJobBoundary(job, locale) ?? <p className="m-0 text-sm text-slate-500">{locale === "zh" ? "当前没有额外展示限制。" : "No additional display boundary is active."}</p>}
            </div>
            <WarningBanner
              locale={locale}
              warnings={job.warnings}
              copyVariant={runtimeConfig.experiments.warningCopy.enabled ? runtimeConfig.experiments.warningCopy.variant : "control"}
              testId="career-job-warning-banner"
            />
          </EvidenceDrawer>

          <EvidenceDrawer title={locale === "zh" ? "查看数据来源" : "View data source"} testId="career-job-v1-data-source-drawer">
            <TrustStrip
              locale={locale}
              reviewerStatus={job.trustManifest?.reviewer.reviewer_status}
              indexState={job.seoContract.indexState}
              reasonCodes={job.claimPermissions.reason_codes}
              contentVersion={job.provenanceMeta.contentVersion}
              dataVersion={job.provenanceMeta.dataVersion}
              logicVersion={job.provenanceMeta.logicVersion}
              compilerVersion={job.provenanceMeta.compilerVersion}
              compiledAt={job.provenanceMeta.compiledAt}
              compileRunId={job.provenanceMeta.compileRunId}
              truthMetricId={job.provenanceMeta.truthMetricId}
              trustManifestId={job.provenanceMeta.trustManifestId}
              indexStateId={job.provenanceMeta.indexStateId}
              testId="career-job-trust-strip"
            />
          </EvidenceDrawer>

          <EvidenceDrawer title={locale === "zh" ? "查看推荐变化记录" : "View recommendation change history"} testId="career-job-v1-lifecycle-drawer">
            {job.lifecycleCompanion.timeline ? (
              <CareerProjectionTimeline locale={locale} timeline={job.lifecycleCompanion.timeline} testId="career-job-lifecycle-companion-timeline" />
            ) : null}
            {job.lifecycleCompanion.deltaSummary ? (
              <CareerProjectionDeltaPanel locale={locale} delta={job.lifecycleCompanion.deltaSummary} testId="career-job-lifecycle-companion-delta" />
            ) : null}
            {!job.lifecycleCompanion.timeline && !job.lifecycleCompanion.deltaSummary ? (
              <p className="m-0 text-sm text-slate-500">{locale === "zh" ? "暂无变化记录。" : "No change history is available yet."}</p>
            ) : null}
          </EvidenceDrawer>
        </section>

        {job.aliasIndex.length > 0 ? (
          <section className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <h2 className="m-0 text-xl font-semibold tracking-tight text-slate-950">
              {locale === "zh" ? "也可能这样称呼" : "Also called"}
            </h2>
            <div className="flex flex-wrap gap-2 text-sm text-slate-500">
              {job.aliasIndex.map((alias) => (
                <span key={`${alias.lang}-${alias.alias}`} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                  {alias.alias}
                </span>
              ))}
            </div>
          </section>
        ) : null}
      </Container>
    </main>
  );
}
