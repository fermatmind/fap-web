import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adaptCareerJobIndex } from "@/lib/career/adapters/adaptCareerJobIndex";
import { fetchCareerJobIndex } from "@/lib/career/api/fetchCareerJobIndex";
import { resolveLocale } from "@/lib/i18n/getDict";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

function formatUsdAnnual(value: number | null, locale: "en" | "zh"): string {
  if (value === null) {
    return locale === "zh" ? "暂未提供" : "Not available yet";
  }

  return new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number | null, locale: "en" | "zh"): string {
  if (value === null) {
    return locale === "zh" ? "暂未提供" : "Not available yet";
  }

  return locale === "zh" ? `${value}%` : `${value}%`;
}

function renderLightweightJobStatusNotice(dataStatus: "available" | "trust_limited" | "unavailable", locale: "en" | "zh") {
  if (dataStatus === "available") {
    return null;
  }

  return (
    <p className="m-0">
      {dataStatus === "trust_limited"
        ? locale === "zh"
          ? "当前卡片处于 trust-limited 模式，仅显示后端明确放行的轻量状态信息。"
          : "This card is currently in trust-limited mode and only shows the lightweight status information explicitly allowed by the backend."
        : locale === "zh"
          ? "当前卡片不可用，页面不会本地合成职业事实。"
          : "This card is currently unavailable, and the page does not synthesize local career facts."}
    </p>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);

  return buildPageMetadata({
    locale,
    pathname: locale === "zh" ? "/zh/career/jobs" : "/en/career/jobs",
    title: locale === "zh" ? "职业库" : "Career Job Library",
    description:
      locale === "zh"
        ? "基于 backend authority 轻量索引浏览职业事实、评分摘要与信任边界。"
        : "Browse job facts, compact score summaries, and trust boundaries from the backend authority index.",
    alternatesByLocale: {
      en: "/en/career/jobs",
      zh: "/zh/career/jobs",
      xDefault: "/",
    },
  });
}

export default async function CareerJobsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const payload = await fetchCareerJobIndex({ locale });
  const jobs = adaptCareerJobIndex({ locale, payload });

  return (
    <Container as="main" className="space-y-6 py-10">
      <section className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">Career Jobs</p>
        <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">
          {locale === "zh" ? "职业库" : "Job library"}
        </h1>
        <p className="m-0 text-[var(--fm-text-muted)]">
          {locale === "zh"
            ? "当前列表直接消费 backend B5 lightweight job index，不再回退到 CMS 职业列表 authority。"
            : "This list now consumes the backend B5 lightweight job index directly and does not fall back to the CMS job list authority."}
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <Card
              key={job.identity.canonicalSlug}
              data-testid="career-job-index-card"
              data-career-data-status={job.dataStatus}
            >
              <CardHeader>
                <div className="space-y-2">
                  <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
                    {job.identity.canonicalSlug}
                  </p>
                  <CardTitle className="text-lg">{job.titles.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-[var(--fm-text-muted)]">
                <p className="m-0">
                  {job.truthSummary.outlookDescription ||
                    (locale === "zh"
                      ? "当前卡片只显示 backend authority 明确提供的轻量摘要。"
                      : "This card only shows the lightweight summary explicitly provided by the backend authority.")}
                </p>
                {job.dataStatus === "available" ? (
                  <div className="space-y-1">
                    <p className="m-0">
                      {locale === "zh" ? "薪资" : "Salary"}:{" "}
                      {formatUsdAnnual(job.truthSummary.medianPayUsdAnnual, locale)}
                    </p>
                    <p className="m-0">
                      {locale === "zh" ? "十年增速" : "Ten-year outlook"}:{" "}
                      {formatPercent(job.truthSummary.outlookPct20242034, locale)}
                    </p>
                    <p className="m-0">
                      {locale === "zh" ? "Fit 分数" : "Fit score"}:{" "}
                      {job.scoreSummary.fitScore.value ?? "—"}
                    </p>
                    <p className="m-0">
                      {locale === "zh" ? "Confidence 分数" : "Confidence score"}:{" "}
                      {job.scoreSummary.confidenceScore.value ?? "—"}
                    </p>
                    <p className="m-0">
                      {locale === "zh" ? "Reviewer" : "Reviewer"}:{" "}
                      {job.trustSummary.reviewerStatus ?? "unknown"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {renderLightweightJobStatusNotice(job.dataStatus, locale)}
                    <p className="m-0">
                      {locale === "zh" ? "Reviewer" : "Reviewer"}:{" "}
                      {job.trustSummary.reviewerStatus ?? "unknown"}
                    </p>
                  </div>
                )}
                <Link
                  href={job.href}
                  className="font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]"
                >
                  {locale === "zh" ? "查看详情" : "View details"}
                </Link>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card
            className="md:col-span-2 xl:col-span-3"
            data-testid="career-job-index-status"
            data-career-data-status="unavailable"
          >
            <CardHeader>
              <CardTitle>{locale === "zh" ? "当前没有可公开展示的职业索引项" : "No public job index items are currently available"}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[var(--fm-text-muted)]">
              <p className="m-0">
                {locale === "zh"
                  ? "backend lightweight job index 当前未返回可渲染条目，因此页面不会回退到 CMS 职业列表。"
                  : "The backend lightweight job index did not return renderable items, so this page does not fall back to the CMS job list."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Container>
  );
}
