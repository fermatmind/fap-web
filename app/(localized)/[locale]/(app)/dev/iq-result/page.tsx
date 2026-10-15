import Link from "next/link";
import { notFound } from "next/navigation";
import { IqResultShell } from "@/components/result/iq/IqResultShell";
import type { ReportResponse } from "@/lib/api/v0_3";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return { title: (await params).locale === "en" ? "IQ results · Local preview" : "IQ 结果页 · 本地样式预览",
    robots: { index: false, follow: false } };
}

// Development-only synthetic aggregates. No private attempt, answers or tokens.
// The scoring function below is fixture generation, never a production fallback.
export default async function Preview({ params, searchParams }: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ sample?: string; tools?: string }>;
}) {
  if (process.env.NODE_ENV !== "development") notFound();
  const locale = (await params).locale === "en" ? "en" : "zh";
  const { sample: requested, tools } = await searchParams;
  const raw = requested === "zero" ? 0 : requested === "low" ? 1 : requested === "high" ? 20 : 7;
  const score = raw === 0 ? 73 : raw <= 5 ? 85 + (raw - 1) * 3.75 : raw <= 20 ? 100 + (raw - 5) * 2 : 130 + (raw - 20) * 1.5;
  const percentile = raw === 0 ? 3.593 : raw === 1 ? 15.866 : raw === 20 ? 97.725 : 60.5137;
  const npr = raw === 0 ? 0 : raw === 20 ? 2 : raw === 1 ? 0 : 1;
  const vspr = raw === 0 ? 0 : raw === 20 ? 10 : raw === 1 ? 1 : 3;
  const vsi = raw - npr - vspr;
  const report = {
    ok: true, schema_version: "iq.report.v1", scale_code: "IQ_INTELLIGENCE_QUOTIENT",
    summary: { raw_score: raw, question_count: 30, beta_reference: {
      status: "available", source_kind: "designed_reference",
      model_version: "owner30_design_anchors_2026_10_14_v1",
      raw_score: raw, standard_score: score, display_score: Math.floor(score + 0.5), percentile,
      production_normed: false, claim_eligible: false, population_percentile_eligible: false,
    } },
    scoring: { status: "scored" }, duration_ms: 192000,
    dimensions: {
      visual_spatial_pattern_reasoning: { dimension_code: "VSPR", correct_count: vspr, item_count: 14 },
      visual_spatial_insight: { dimension_code: "VSI", correct_count: vsi, item_count: 13 },
      numerical_pattern_reasoning: { dimension_code: "NPR", correct_count: npr, item_count: 3 },
    },
  } as unknown as ReportResponse;
  return <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
    {tools === "1" ? <aside className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-4 text-sm" aria-label={locale === "zh" ? "本地预览工具" : "Local preview tools"}>
      <p className="font-semibold">{locale === "zh" ? "本地样式预览 · 示例数据" : "Local style preview · Sample data"}</p>
      <p className="mt-1 text-[var(--fm-text-muted)]">{locale === "zh" ? "沿用现有评分规则；逻辑、言语以0占位，尚未测量。此页仅在开发环境开放。" : "Uses the current scoring rules. Logic and verbal are unmeasured zero placeholders. Available only in development."}</p>
      <nav className="mt-3 flex flex-wrap gap-3" aria-label={locale === "zh" ? "切换结果案例" : "Choose a result example"}>
        {[["zero", locale === "zh" ? "偏低 · 73分" : "Low result · 73"], ["low", locale === "zh" ? "较低 · 85分" : "Below average · 85"], ["middle", locale === "zh" ? "中段 · 104分" : "Average · 104"], ["high", locale === "zh" ? "较高 · 130分" : "Above average · 130"]].map(([key, label]) => <Link
          key={key} href={`/${locale}/dev/iq-result?sample=${key}&tools=1`}
          aria-current={(requested ?? "middle") === key ? "page" : undefined}
          className="rounded-full border border-[var(--fm-border)] px-3 py-2 aria-[current=page]:bg-[var(--fm-accent)] aria-[current=page]:text-white">{label}</Link>)}
      </nav>
    </aside> : null}
    <IqResultShell locale={locale} reportData={report} resultData={null} accessView={null} />
  </main>;
}
