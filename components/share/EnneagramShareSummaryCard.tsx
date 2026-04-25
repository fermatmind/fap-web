import Link from "next/link";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import type { EnneagramShareViewModel } from "@/lib/enneagram/shareSurface";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatDate(value: string | null, locale: Locale): string {
  if (!value) return locale === "zh" ? "未提供" : "Not provided";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatGap(value: number | null): string {
  if (value === null) return "--";
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function resolveHeadline(viewModel: EnneagramShareViewModel, locale: Locale): string {
  const primary = viewModel.primaryCandidate?.label ?? "";
  const secondary = viewModel.secondCandidate?.label ?? viewModel.closeCallPair?.typeB?.label ?? "";

  if (locale === "zh") {
    if (viewModel.interpretationScope === "close_call") {
      return primary && secondary ? `${primary} / ${secondary}` : "近邻候选";
    }
    if (viewModel.interpretationScope === "diffuse") {
      return "分散结构";
    }
    if (viewModel.interpretationScope === "low_quality") {
      return "解释边界较宽";
    }
    return primary || "当前主候选";
  }

  if (viewModel.interpretationScope === "close_call") {
    return primary && secondary ? `${primary} / ${secondary}` : "Near-neighbor candidates";
  }
  if (viewModel.interpretationScope === "diffuse") {
    return "Diffuse profile";
  }
  if (viewModel.interpretationScope === "low_quality") {
    return "Wider interpretation boundary";
  }
  return primary || "Current leading candidate";
}

export default function EnneagramShareSummaryCard({
  locale,
  viewModel,
  primaryActionHref,
  primaryActionLabel,
  testId = "enneagram-share-summary-card",
  className,
  onPrimaryActionClick,
  onLibraryActionClick,
}: {
  locale: Locale;
  viewModel: EnneagramShareViewModel;
  primaryActionHref?: string;
  primaryActionLabel?: string;
  testId?: string;
  className?: string;
  onPrimaryActionClick?: () => void;
  onLibraryActionClick?: () => void;
}) {
  const testsHref = localizedPath("/tests", locale);
  const startTestHref = primaryActionHref || viewModel.startTestHref;
  const startTestLabel = primaryActionLabel || (locale === "zh" ? "开始九型测试" : "Start Enneagram test");
  const headline = resolveHeadline(viewModel, locale);

  return (
    <main
      data-testid={testId}
      className={cn("mx-auto w-full max-w-5xl px-4 py-10 md:px-6 md:py-14", className)}
    >
      <div className="overflow-hidden rounded-[32px] border border-amber-100 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.14),_transparent_38%),linear-gradient(135deg,_#ffffff_0%,_#fffaf0_46%,_#f8fafc_100%)] shadow-[0_24px_64px_rgba(15,23,42,0.10)]">
        <div className="grid gap-6 p-6 md:p-8 lg:grid-cols-[minmax(0,1.25fr)_320px] lg:gap-8">
          <section className="space-y-5">
            <div className="space-y-3">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
                {locale === "zh" ? "九型公开分享摘要" : "Enneagram public summary"}
              </p>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {viewModel.formLabel ? (
                    <span
                      data-testid="enneagram-share-form-badge"
                      className="inline-flex rounded-full border border-amber-200 bg-white/90 px-3 py-1 text-sm font-semibold text-slate-700"
                    >
                      {viewModel.formLabel}
                    </span>
                  ) : null}
                  {viewModel.confidenceLabel ? (
                    <span
                      data-testid="enneagram-share-confidence-badge"
                      className="inline-flex rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-sm text-slate-700"
                    >
                      {locale === "zh" ? "置信" : "Confidence"} · {viewModel.confidenceLabel}
                    </span>
                  ) : null}
                </div>
                <h1
                  data-testid="enneagram-share-headline"
                  className="m-0 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl"
                >
                  {headline}
                </h1>
                <p
                  data-testid="enneagram-share-lead"
                  className="m-0 max-w-3xl text-lg leading-8 text-slate-700"
                >
                  {viewModel.lead}
                </p>
                {viewModel.summaryText ? (
                  <p className="m-0 max-w-3xl text-base leading-7 text-slate-700">{viewModel.summaryText}</p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {viewModel.topTypes.slice(0, 3).map((type) => (
                <div
                  key={`${type.code}-${type.rank ?? "na"}`}
                  data-testid={`enneagram-share-top-type-${type.rank ?? type.code}`}
                  className="rounded-[24px] border border-white/80 bg-white/88 p-4 shadow-[0_12px_28px_rgba(15,23,42,0.06)]"
                >
                  <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {locale === "zh" ? `Top ${type.rank ?? "-"}` : `Top ${type.rank ?? "-"}`}
                  </p>
                  <p className="m-0 mt-2 text-lg font-semibold text-slate-950">{type.label}</p>
                  {type.score !== null ? (
                    <p className="m-0 mt-1 text-sm text-slate-600">
                      {locale === "zh" ? "分值" : "Score"} · {formatGap(type.score)}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
              <div className="rounded-[24px] border border-white/80 bg-white/88 p-4 shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {locale === "zh" ? "全部九型概览" : "All nine overview"}
                </p>
                <div data-testid="enneagram-share-all9-profile" className="mt-3 space-y-2">
                  {viewModel.all9ProfileMini.map((type) => {
                    const width = Math.max(8, Math.min(100, type.score ?? 0));
                    return (
                      <div key={`all9-${type.code}`} className="space-y-1">
                        <div className="flex items-center justify-between gap-3 text-sm text-slate-700">
                          <span>{type.label}</span>
                          <span>{type.score === null ? "--" : formatGap(type.score)}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-amber-500/70" style={{ width: `${width}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[24px] border border-white/80 bg-white/88 p-4 shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
                  <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {locale === "zh" ? "解释边界" : "Interpretation boundary"}
                  </p>
                  <p data-testid="enneagram-share-methodology-boundary" className="m-0 mt-2 text-sm leading-7 text-slate-700">
                    {viewModel.methodologyBoundary}
                  </p>
                </div>

                {viewModel.closeCallPair ? (
                  <div
                    data-testid="enneagram-share-close-call"
                    className="rounded-[24px] border border-amber-200 bg-amber-50/70 p-4"
                  >
                    <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
                      {locale === "zh" ? "近邻竞争" : "Close call"}
                    </p>
                    <p className="m-0 mt-2 text-sm font-semibold text-slate-900">
                      {viewModel.closeCallPair.typeA?.label ?? "--"} / {viewModel.closeCallPair.typeB?.label ?? "--"}
                    </p>
                    {viewModel.closeCallPair.triggerReason ? (
                      <p className="m-0 mt-1 text-sm leading-7 text-slate-700">{viewModel.closeCallPair.triggerReason}</p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={startTestHref}
                className={buttonVariants({ className: "min-w-[180px]" })}
                onClick={onPrimaryActionClick}
              >
                {startTestLabel}
              </Link>
              <Link
                href={testsHref}
                className={buttonVariants({ variant: "outline", className: "min-w-[160px]" })}
                onClick={onLibraryActionClick}
              >
                {locale === "zh" ? "查看全部测试" : "Browse all tests"}
              </Link>
            </div>
          </section>

          <section className="space-y-4">
            <Card className="border-white/70 bg-white/88 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-slate-900">
                  {locale === "zh" ? "公开摘要卡" : "Share-safe summary card"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-700">
                <div>
                  <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {locale === "zh" ? "解释状态" : "Interpretation state"}
                  </p>
                  <p data-testid="enneagram-share-scope" className="m-0 mt-2 font-semibold text-slate-900">
                    {viewModel.interpretationScope}
                  </p>
                  {viewModel.interpretationReason ? (
                    <p className="m-0 mt-1 leading-7">{viewModel.interpretationReason}</p>
                  ) : null}
                </div>

                <div>
                  <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {locale === "zh" ? "主导差距" : "Dominance gap"}
                  </p>
                  <p className="m-0 mt-2">
                    abs {formatGap(viewModel.dominanceGapAbs)} / pct {formatGap(viewModel.dominanceGapPct)}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                  <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {locale === "zh" ? "快照与版本" : "Snapshot and versions"}
                  </p>
                  <p className="m-0 mt-2">
                    {locale === "zh" ? "生成时间" : "Generated"} · {formatDate(viewModel.generatedAt, locale)}
                  </p>
                  {viewModel.contentSnapshotStatus ? (
                    <p className="m-0 mt-1">
                      {locale === "zh" ? "快照状态" : "Snapshot"} · {viewModel.contentSnapshotStatus}
                    </p>
                  ) : null}
                  {viewModel.reportSchemaVersion ? (
                    <p className="m-0 mt-1">
                      schema · {viewModel.reportSchemaVersion}
                    </p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </main>
  );
}
