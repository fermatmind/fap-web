import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { ClaimGuard } from "@/components/career/ClaimGuard";
import { CareerExplainabilityPanel } from "@/components/career/CareerExplainabilityPanel";
import { TrustStrip } from "@/components/career/TrustStrip";
import { WarningBanner } from "@/components/career/WarningBanner";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adaptCareerJobExplainability } from "@/lib/career/adapters/adaptCareerExplainability";
import { adaptCareerJobBundle } from "@/lib/career/adapters/adaptCareerJobBundle";
import type { CareerExplainabilityAdapter, CareerJobBundleAdapter } from "@/lib/career/adapters/types";
import { CAREER_TRACKING_EVENTS, buildCareerAttributionPayload } from "@/lib/career/attribution";
import { fetchCareerJobExplainability } from "@/lib/career/api/fetchCareerJobExplainability";
import { fetchCareerJobBundle } from "@/lib/career/api/fetchCareerJobBundle";
import { buildCareerJobFrontendUrl, normalizeCareerBundleCanonicalPath } from "@/lib/career/urls";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { buildBreadcrumbJsonLd } from "@/lib/seo/generateSchema";
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

function formatPercent(value: number | null): string | null {
  if (value === null) {
    return null;
  }

  return `${value}%`;
}

function shouldNoindex(indexState: string | null | undefined): boolean {
  const normalized = String(indexState ?? "").trim().toLowerCase();
  return normalized === "blocked" || normalized === "noindex" || normalized === "unavailable";
}

async function loadCareerJobBundle(locale: Locale, slug: string): Promise<CareerJobBundleAdapter | null> {
  const payload = await fetchCareerJobBundle({ locale, slug });
  return adaptCareerJobBundle({
    locale,
    requestedSlug: slug,
    payload,
  });
}

async function loadCareerJobExplainability(locale: Locale, slug: string): Promise<CareerExplainabilityAdapter | null> {
  const payload = await fetchCareerJobExplainability({ locale, slug });
  return adaptCareerJobExplainability(payload);
}

function renderCareerJobProtocolStatus(job: CareerJobBundleAdapter, locale: Locale) {
  if (job.renderState.careerDataStatus === "available") {
    return null;
  }

  return (
    <div
      className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-950"
      data-testid="career-job-protocol-status"
      data-career-data-status={job.renderState.careerDataStatus}
    >
      <p className="m-0 font-medium">
        {job.renderState.careerDataStatus === "trust_limited"
          ? locale === "zh"
            ? "当前为 trust-limited 渲染"
            : "Rendering in trust-limited mode"
          : locale === "zh"
            ? "当前内容不可用"
            : "Career job data is currently unavailable"}
      </p>
      <p className="m-0 mt-2 leading-7">
        {locale === "zh"
          ? "当前页面只消费 backend authority bundle，并严格跟随 claim / trust / index gate。未明确放行的强结论内容不会渲染。"
          : "This page now renders only from backend authority bundles and follows explicit claim, trust, and index gates. Strong claims stay hidden unless they are explicitly allowed."}
      </p>
      {job.renderState.missingFields.length > 0 ? (
        <p className="m-0 mt-2 text-xs uppercase tracking-[0.08em] text-amber-900/80">
          {locale === "zh" ? "缺失字段" : "Missing fields"}: {job.renderState.missingFields.join(", ")}
        </p>
      ) : null}
    </div>
  );
}

function renderScoreValue(value: number | null): string {
  return value === null ? "—" : String(value);
}

function ScoreCard({
  title,
  value,
  integrity,
}: {
  title: string;
  value: number | null;
  integrity: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4">
      <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">{title}</p>
      <p className="m-0 mt-2 text-2xl font-semibold text-[var(--fm-text)]">{renderScoreValue(value)}</p>
      <p className="m-0 mt-1 text-xs text-[var(--fm-text-muted)]">{integrity}</p>
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

  const canonicalPath = normalizeCareerBundleCanonicalPath(
    locale,
    job.seoContract.canonicalPath,
    buildCanonicalPath(job.slug, locale)
  );
  const title = `${job.title} | FermatMind`;
  const description =
    job.summary ||
    (locale === "zh"
      ? `${job.title} 的职业事实、信任边界、评分与风险提示。`
      : `Career facts, trust boundaries, scoring, and warnings for ${job.title}.`);

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
  const [job, explainability] = await Promise.all([
    loadCareerJobBundle(locale, slug),
    loadCareerJobExplainability(locale, slug),
  ]);

  if (!job) {
    return notFound();
  }

  const canonicalPath = normalizeCareerBundleCanonicalPath(
    locale,
    job.seoContract.canonicalPath,
    buildCanonicalPath(job.slug, locale)
  );
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: locale === "zh" ? "首页" : "Home", path: localizedPath("/", locale) },
    { name: locale === "zh" ? "职业" : "Career", path: localizedPath("/career", locale) },
    { name: locale === "zh" ? "职业库" : "Jobs", path: localizedPath("/career/jobs", locale) },
    { name: job.title, path: canonicalPath },
  ]);

  const canRenderAiStrategy =
    job.claimPermissions.allow_ai_strategy && job.renderState.careerDataStatus !== "unavailable";
  const canRenderAnswerSurface = job.renderState.canRenderAnswerSurface;

  return (
    <Container as="main" className="space-y-6 py-10">
      <AnalyticsPageViewTracker
        eventName={CAREER_TRACKING_EVENTS.jobDetailView}
        properties={buildCareerAttributionPayload({
          locale,
          entrySurface: "career_job_detail",
          sourcePageType: "career_job_detail",
          targetAction: "view_surface",
          landingPath: localizedPath(`/career/jobs/${job.slug}`, locale),
          routeFamily: "job_detail",
          subjectKind: "job_slug",
          subjectKey: job.slug,
        })}
      />
      <JsonLd id={`career-job-breadcrumb-${job.slug}`} data={breadcrumbJsonLd} />
      <Breadcrumb
        items={[
          { label: locale === "zh" ? "首页" : "Home", href: localizedPath("/", locale) },
          { label: locale === "zh" ? "职业" : "Career", href: localizedPath("/career", locale) },
          { label: locale === "zh" ? "职业库" : "Jobs", href: localizedPath("/career/jobs", locale) },
          { label: job.title },
        ]}
      />

      <section className="space-y-4 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
          {locale === "zh" ? "Career bundle" : "Career bundle"}
        </p>
        <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">{job.title}</h1>
        {job.summary ? <p className="m-0 text-[var(--fm-text-muted)]">{job.summary}</p> : null}
        {renderCareerJobProtocolStatus(job, locale)}
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
              {locale === "zh" ? "Canonical slug" : "Canonical slug"}
            </p>
            <p className="m-0 mt-2 text-sm text-[var(--fm-text-muted)]">{job.slug}</p>
          </div>
          <div className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
              {locale === "zh" ? "Index state" : "Index state"}
            </p>
            <p className="m-0 mt-2 text-sm text-[var(--fm-text-muted)]">{job.seoContract.indexState ?? "unknown"}</p>
          </div>
          <div className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
              {locale === "zh" ? "Compiler version" : "Compiler version"}
            </p>
            <p className="m-0 mt-2 text-sm text-[var(--fm-text-muted)]">
              {job.provenanceMeta.compilerVersion ?? "unknown"}
            </p>
          </div>
        </div>
      </section>

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

      <div className="grid gap-4 md:grid-cols-2">
        <ClaimGuard
          allowed={job.renderState.canRenderSalarySurface}
          fallback={
            <Card data-testid="career-job-claim-gated-status">
              <CardHeader>
                <CardTitle>{locale === "zh" ? "职业结论闸门" : "Career claim gate"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-[var(--fm-text-muted)]">
                <p className="m-0">
                  {locale === "zh"
                    ? "薪资与强结论内容必须经过 backend claim permissions 放行。当前页面保持保守。"
                    : "Salary and strong-claim surfaces require explicit backend claim permissions. This page stays conservative."}
                </p>
              </CardContent>
            </Card>
          }
        >
          <Card data-testid="career-job-salary-surface">
            <CardHeader>
              <CardTitle>{locale === "zh" ? "薪资水平" : "Salary range"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-[var(--fm-text-muted)]">
              <p className="m-0">{formatUsdAnnual(job.truthLayer.medianPayUsdAnnual, locale)}</p>
              {job.truthLayer.outlookPct20242034 !== null ? (
                <p className="m-0">
                  {locale === "zh" ? "十年增速" : "Ten-year outlook"}: {formatPercent(job.truthLayer.outlookPct20242034)}
                </p>
              ) : null}
            </CardContent>
          </Card>
        </ClaimGuard>

        <ClaimGuard
          allowed={canRenderAnswerSurface}
          fallback={
            <Card>
              <CardHeader>
                <CardTitle>{locale === "zh" ? "职业事实层" : "Truth layer"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-[var(--fm-text-muted)]">
                <p className="m-0">
                  {locale === "zh"
                    ? "当前 answer surface 未被 backend 显式放行，因此页面不会补写本地职业解释。"
                    : "The answer surface is not explicitly enabled by the backend, so this page does not synthesize a local job explanation."}
                </p>
              </CardContent>
            </Card>
          }
        >
          <Card>
            <CardHeader>
              <CardTitle>{locale === "zh" ? "职业事实层" : "Truth layer"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-[var(--fm-text-muted)]">
              {job.truthLayer.entryEducation ? (
                <p className="m-0">
                  {locale === "zh" ? "入门学历" : "Entry education"}: {job.truthLayer.entryEducation}
                </p>
              ) : null}
              {job.truthLayer.workExperience ? (
                <p className="m-0">
                  {locale === "zh" ? "工作经验" : "Work experience"}: {job.truthLayer.workExperience}
                </p>
              ) : null}
              {job.truthLayer.onTheJobTraining ? (
                <p className="m-0">
                  {locale === "zh" ? "在岗训练" : "On-the-job training"}: {job.truthLayer.onTheJobTraining}
                </p>
              ) : null}
              {canRenderAiStrategy && job.truthLayer.aiExposure !== null ? (
                <p className="m-0">
                  AI exposure: {job.truthLayer.aiExposure}
                </p>
              ) : null}
              {job.truthLayer.sourceRefs.length === 0 ? (
                <p className="m-0">{locale === "zh" ? "暂未提供更多来源。" : "No additional source refs yet."}</p>
              ) : null}
            </CardContent>
          </Card>
        </ClaimGuard>
      </div>

      {job.renderState.canRenderFitSurface ? (
        <section className="space-y-4 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
          <div className="space-y-1">
            <h2 className="m-0 font-serif text-2xl font-semibold text-[var(--fm-text)]">
              {locale === "zh" ? "后端评分维度" : "Backend score dimensions"}
            </h2>
            <p className="m-0 text-sm text-[var(--fm-text-muted)]">
              {locale === "zh"
                ? "页面直接消费 backend white-box score bundle，不在前端复算。"
                : "This page consumes the backend white-box score bundle directly and does not recompute scores in the client."}
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <ScoreCard title="Fit" value={job.scoreBundle.fitScore.value} integrity={job.scoreBundle.fitScore.integrity_state} />
            <ScoreCard title="Strain" value={job.scoreBundle.strainScore.value} integrity={job.scoreBundle.strainScore.integrity_state} />
            <ScoreCard title="AI" value={canRenderAiStrategy ? job.scoreBundle.aiSurvivalScore.value : null} integrity={job.scoreBundle.aiSurvivalScore.integrity_state} />
            <ScoreCard title="Mobility" value={job.scoreBundle.mobilityScore.value} integrity={job.scoreBundle.mobilityScore.integrity_state} />
            <ScoreCard title="Confidence" value={job.scoreBundle.confidenceScore.value} integrity={job.scoreBundle.confidenceScore.integrity_state} />
          </div>
        </section>
      ) : null}

      {explainability ? (
        <CareerExplainabilityPanel
          locale={locale}
          explainability={explainability}
          title={locale === "zh" ? "结构化 explainability" : "Structured explainability"}
          subtitle={
            locale === "zh"
              ? "只展示 backend explainability authority payload 的结构化字段，不在前端扩写为建议、策略或 radar。"
              : "This section renders structured fields from the backend explainability authority payload only, without frontend advice, strategy expansion, or radar semantics."
          }
          testId="career-job-explainability-panel"
        />
      ) : null}

      <WarningBanner
        locale={locale}
        warnings={job.warnings}
        title={locale === "zh" ? "显式警告与边界" : "Explicit warnings and limits"}
        testId="career-job-warning-banner"
      />

      {job.aliasIndex.length > 0 ? (
        <section className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
          <h2 className="m-0 font-serif text-xl font-semibold text-[var(--fm-text)]">
            {locale === "zh" ? "保守别名索引" : "Conservative alias index"}
          </h2>
          <div className="flex flex-wrap gap-2 text-sm text-[var(--fm-text-muted)]">
            {job.aliasIndex.map((alias) => (
              <span key={`${alias.lang}-${alias.alias}`} className="rounded-full border border-[var(--fm-border)] px-3 py-1">
                {alias.alias}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      <Link
        href={localizedPath("/career/jobs", locale)}
        className="text-sm font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]"
      >
        {locale === "zh" ? "返回职业库" : "Back to job library"}
      </Link>
    </Container>
  );
}
