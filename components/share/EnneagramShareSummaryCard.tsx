import Link from "next/link";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import type { EnneagramShareViewModel } from "@/lib/enneagram/shareSurface";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

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
  const startTestLabel = primaryActionLabel || (locale === "zh" ? "开始九型人格免费测试" : "Start the free Enneagram test");
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
                </div>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
              <div className="rounded-[24px] border border-white/80 bg-white/88 p-4 shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {locale === "zh" ? "全部九型概览" : "All nine overview"}
                </p>
                <div data-testid="enneagram-share-all9-profile" className="mt-3 space-y-2">
                  {viewModel.all9ProfileMini.map((type) => (
                    <div
                      key={`all9-${type.code}`}
                      className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-white/70 px-3 py-2 text-sm text-slate-700"
                    >
                      <span>{type.label}</span>
                      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        {locale === "zh" ? `排序 ${type.rank ?? "-"}` : `Rank ${type.rank ?? "-"}`}
                      </span>
                    </div>
                  ))}
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
            <div className="rounded-[24px] border border-white/80 bg-white/88 p-5 text-sm leading-7 text-slate-700 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                {locale === "zh" ? "公开摘要" : "Public-safe summary"}
              </p>
              <p className="m-0 mt-3">
                {locale === "zh"
                  ? "把它当作动机模式的反思线索，而不是固定身份或最终判断。"
                  : "Use this as a reflection cue for motivation patterns, not as a fixed identity or final verdict."}
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
