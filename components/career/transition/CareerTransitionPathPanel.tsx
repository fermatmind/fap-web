import { TrackedCareerLink } from "@/components/analytics/TrackedCareerLink";
import { TrustStrip } from "@/components/career/TrustStrip";
import { CAREER_TRACKING_EVENTS } from "@/lib/career/attribution";
import type {
  CareerTransitionEmphasisVariant,
  CareerTransitionPreviewAdapter,
  CareerTransitionPreviewDeltaEntryAdapter,
} from "@/lib/career/adapters/types";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";

type CareerTransitionPathPanelProps = {
  locale: Locale;
  displayLocale?: DisplayLocale;
  transitionPath: CareerTransitionPreviewAdapter;
  landingPath: string;
  emphasisVariant?: CareerTransitionEmphasisVariant;
  copyVariant?: "contract" | "public";
};

function renderScoreValue(value: number | null): string {
  return value === null ? "—" : String(value);
}

function getPathTypeLabel(locale: Locale, displayLocale: DisplayLocale, pathType: string): string {
  if (pathType === "bridge") {
    return locale === "zh" ? (displayLocale === "zh-TW" ? "銜接路徑" : "衔接路径") : "Bridge";
  }

  if (pathType === "hedge") {
    return locale === "zh" ? (displayLocale === "zh-TW" ? "降低轉職風險的路徑" : "风险对冲路径") : "Hedge";
  }

  if (pathType === "stable_upside") {
    return locale === "zh" ? (displayLocale === "zh-TW" ? "穩健發展路徑" : "稳健上行路径") : "Stable upside";
  }

  return displayLocale === "zh-TW" ? `自訂路徑 · ${pathType}` : locale === "zh" ? `自定义路径 · ${pathType}` : `Custom path · ${pathType}`;
}

function getPathTypeFocusCopy(locale: Locale, displayLocale: DisplayLocale, pathType: string): string {
  if (pathType === "bridge") {
    return locale === "zh"
      ? (displayLocale === "zh-TW" ? "聚焦 90 天內的銜接行動，先確認如何實際轉職。" : "强调 90 天衔接动作，优先解决迁移落地路径。")
      : "Focuses on 90-day bridge actions to make role transition execution concrete.";
  }

  if (pathType === "hedge") {
    return locale === "zh"
      ? (displayLocale === "zh-TW" ? "採用較保守的轉職方式，先降低轉換對現有工作的影響。" : "强调风险对冲与保守迁移，优先控制断裂成本。")
      : "Focuses on risk hedge and conservative transfer to reduce breakage cost.";
  }

  if (pathType === "stable_upside") {
    return locale === "zh"
      ? (displayLocale === "zh-TW" ? "把變動控制在可承受範圍內，逐步增加發展機會。" : "强调稳健增益，在可控变化下提升上行空间。")
      : "Focuses on stable upside with controlled change and incremental gain.";
  }

  return locale === "zh"
    ? (displayLocale === "zh-TW" ? "這是自訂路徑類型，目前只顯示已確認的資訊。" : "该路径使用后端提供的自定义类型，页面采用保守展示。")
    : "This path type is backend-defined and rendered with conservative fallback semantics.";
}

function getTimeHorizonLabel(locale: Locale, displayLocale: DisplayLocale, horizon: string): string {
  if (horizon === "days_0_30") {
    return locale === "zh" ? (displayLocale === "zh-TW" ? "第 0–30 天" : "第 0-30 天") : "Days 0-30";
  }

  if (horizon === "days_31_60") {
    return locale === "zh" ? (displayLocale === "zh-TW" ? "第 31–60 天" : "第 31-60 天") : "Days 31-60";
  }

  if (horizon === "days_61_90") {
    return locale === "zh" ? (displayLocale === "zh-TW" ? "第 61–90 天" : "第 61-90 天") : "Days 61-90";
  }

  return horizon;
}

function getDeltaLabel(locale: Locale, displayLocale: DisplayLocale, key: "entryEducationDelta" | "workExperienceDelta" | "trainingDelta"): string {
  if (locale === "zh") {
    if (key === "entryEducationDelta") return (displayLocale === "zh-TW" ? "入行學歷" : "入门学历");
    if (key === "workExperienceDelta") return (displayLocale === "zh-TW" ? "工作經驗" : "工作经验");
    return (displayLocale === "zh-TW" ? "在職訓練" : "在岗培训");
  }

  if (key === "entryEducationDelta") return "Entry education";
  if (key === "workExperienceDelta") return "Work experience";
  return "Training";
}

export function CareerTransitionPathPanel({
  locale,
  displayLocale = locale,
  transitionPath,
  landingPath,
  emphasisVariant = "balanced",
  copyVariant = "contract",
}: CareerTransitionPathPanelProps) {
  const deltaEntries = transitionPath.delta
    ? ([
        ["entryEducationDelta", transitionPath.delta.entryEducationDelta],
        ["workExperienceDelta", transitionPath.delta.workExperienceDelta],
        ["trainingDelta", transitionPath.delta.trainingDelta],
      ] as const).filter((entry): entry is [
        "entryEducationDelta" | "workExperienceDelta" | "trainingDelta",
        CareerTransitionPreviewDeltaEntryAdapter,
      ] => Boolean(entry[1]))
    : [];

  const prioritizeRisk = emphasisVariant === "risk_first";
  const prioritizeUpside = emphasisVariant === "upside_first";

  return (
    <section
      className="space-y-4 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      data-testid="career-transition-path-panel"
      data-path-type={transitionPath.pathType}
    >
      <header className="space-y-2" data-testid="career-transition-path-header">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
          {locale === "zh" ? (displayLocale === "zh-TW" ? "轉職路徑" : "转岗路径") : "Transition path"}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="m-0 font-serif text-2xl font-semibold text-[var(--fm-text)]">
            {locale === "zh" ? (displayLocale === "zh-TW" ? "下一步路徑一覽" : "下一步路径可视化") : "Next-step path visualization"}
          </h2>
          <span className="rounded-full border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
            {getPathTypeLabel(locale, displayLocale, transitionPath.pathType)}
          </span>
        </div>
        <p className="m-0 text-sm text-[var(--fm-text-muted)]" data-testid="career-transition-path-focus-copy">
          {getPathTypeFocusCopy(locale, displayLocale, transitionPath.pathType)}
        </p>
        <p className="m-0 text-xs uppercase tracking-[0.1em] text-[var(--fm-text-muted)]" data-testid="career-transition-emphasis-variant">
          {locale === "zh" ? (displayLocale === "zh-TW" ? "顯示重點" : "展示强调") : "Display emphasis"}: {emphasisVariant}
        </p>
      </header>

      <div className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
          {locale === "zh" ? (displayLocale === "zh-TW" ? "目標職位" : "目标岗位") : "Target job"}
        </p>
        <TrackedCareerLink
          href={transitionPath.targetJob.href}
          eventName={CAREER_TRACKING_EVENTS.transitionPreviewTargetClick}
          eventPayload={{
            locale,
            entrySurface: "career_recommendation_detail_transition_preview",
            sourcePageType: "career_recommendation_detail",
            targetAction: "open_transition_target_job",
            landingPath,
            routeFamily: "recommendation_detail",
            subjectKind: "job_slug",
            subjectKey: transitionPath.targetJob.canonicalSlug,
            queryMode: "non_query",
          }}
          className="mt-2 inline-block text-lg font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]"
          data-testid="career-transition-path-target-link"
        >
          {transitionPath.targetJob.title}
        </TrackedCareerLink>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section
          className={`space-y-2 rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4 ${
            prioritizeUpside ? "ring-2 ring-emerald-300" : ""
          }`}
          data-testid="career-transition-path-why"
        >
          <h3 className="m-0 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
            {locale === "zh" ? (displayLocale === "zh-TW" ? "為什麼建議這條路徑" : "为什么是这条路径") : "Why this path"}
          </h3>
          <p className="m-0 text-sm leading-7 text-[var(--fm-text)]">
            {transitionPath.whyThisPath ??
              (copyVariant === "public"
                ? locale === "zh"
                  ? (displayLocale === "zh-TW" ? "目前沒有足夠資料說明推薦原因。" : "当前没有足够路径理由，页面保持保守降级。")
                  : "No path rationale is available yet; rendering a conservative fallback."
                : locale === "zh"
                  ? (displayLocale === "zh-TW" ? "目前沒有可顯示的路徑理由（why_this_path）。" : "当前后端未返回 why_this_path，页面保持保守降级。")
                  : "No backend why_this_path provided for this path; rendering conservative fallback.")}
          </p>
        </section>
        <section
          className={`space-y-2 rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4 ${
            prioritizeRisk ? "ring-2 ring-amber-300" : ""
          }`}
          data-testid="career-transition-path-loss"
        >
          <h3 className="m-0 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
            {locale === "zh" ? (displayLocale === "zh-TW" ? "可能要付出哪些代價" : "会失去什么") : "What is lost"}
          </h3>
          <p className="m-0 text-sm leading-7 text-[var(--fm-text)]">
            {transitionPath.whatIsLost ??
              (copyVariant === "public"
                ? locale === "zh"
                  ? (displayLocale === "zh-TW" ? "目前沒有足夠資料說明可能的代價。" : "当前没有足够代价说明，页面保持保守降级。")
                  : "No tradeoff explanation is available yet; rendering a conservative fallback."
                : locale === "zh"
                  ? (displayLocale === "zh-TW" ? "目前沒有可顯示的代價說明（what_is_lost）。" : "当前后端未返回 what_is_lost，页面保持保守降级。")
                  : "No backend what_is_lost provided for this path; rendering conservative fallback.")}
          </p>
        </section>
      </div>

      <section
        className={`space-y-3 rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4 ${
          transitionPath.pathType === "bridge" || emphasizeBridge(emphasisVariant) ? "ring-2 ring-[var(--fm-accent)]/30" : ""
        }`}
        data-testid="career-transition-path-bridge-steps"
      >
        <h3 className="m-0 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
          {copyVariant === "public" ? (locale === "zh" ? (displayLocale === "zh-TW" ? "銜接步驟" : "衔接步骤") : "Bridge steps") : locale === "zh" ? (displayLocale === "zh-TW" ? "90 天銜接步驟" : "90 天衔接步骤") : "90-day bridge steps"}
        </h3>
        {(transitionPath.bridgeSteps90d ?? []).length > 0 ? (
          <ol className="m-0 grid gap-3 p-0">
            {(transitionPath.bridgeSteps90d ?? []).map((step) => (
              <li
                key={`${step.stepKey}:${step.timeHorizon}`}
                className="list-none rounded-lg border border-[var(--fm-border)] bg-[var(--fm-surface)] p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="m-0 text-sm font-semibold text-[var(--fm-text)]">{step.title}</p>
                  <span className="rounded-full border border-[var(--fm-border)] px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--fm-text-muted)]">
                    {getTimeHorizonLabel(locale, displayLocale, step.timeHorizon)}
                  </span>
                </div>
                <p className="m-0 mt-2 text-sm text-[var(--fm-text-muted)]">{step.description}</p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="m-0 text-sm text-[var(--fm-text-muted)]">
            {locale === "zh"
              ? copyVariant === "public"
                ? (displayLocale === "zh-TW" ? "目前沒有足夠資料列出銜接步驟。" : "当前没有足够衔接步骤，页面保持保守降级。")
                : (displayLocale === "zh-TW" ? "目前沒有可顯示的 90 天銜接步驟（bridge_steps_90d）。" : "当前后端未返回 bridge_steps_90d，页面保持保守降级。")
              : copyVariant === "public"
                ? "No bridge steps are available yet; rendering a conservative fallback."
                : "No backend bridge_steps_90d provided for this path; rendering conservative fallback."}
          </p>
        )}
      </section>

      <section className="grid gap-3 md:grid-cols-2" data-testid="career-transition-path-score-summary">
        <div className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">Mobility</p>
          <p className="m-0 mt-2 text-2xl font-semibold text-[var(--fm-text)]">
            {renderScoreValue(transitionPath.scoreSummary.mobilityScore.value)}
          </p>
          <p className="m-0 mt-1 text-xs text-[var(--fm-text-muted)]">
            {transitionPath.scoreSummary.mobilityScore.integrity_state}
          </p>
        </div>
        <div
          className={`rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4 ${
            prioritizeUpside ? "ring-2 ring-emerald-300" : ""
          }`}
        >
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">Confidence</p>
          <p className="m-0 mt-2 text-2xl font-semibold text-[var(--fm-text)]">
            {renderScoreValue(transitionPath.scoreSummary.confidenceScore.value)}
          </p>
          <p className="m-0 mt-1 text-xs text-[var(--fm-text-muted)]">
            {transitionPath.scoreSummary.confidenceScore.integrity_state}
          </p>
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-2" data-testid="career-transition-path-codes">
        <div className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
            {locale === "zh" ? (displayLocale === "zh-TW" ? "理由代碼" : "理由代码") : "Rationale codes"}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(transitionPath.rationaleCodes ?? []).length > 0 ? (
              (transitionPath.rationaleCodes ?? []).map((code) => (
                <span
                  key={code}
                  className="rounded-full border border-[var(--fm-border)] bg-[var(--fm-surface)] px-2 py-1 text-[11px] font-mono text-[var(--fm-text-muted)]"
                >
                  {code}
                </span>
              ))
            ) : (
              <span className="text-sm text-[var(--fm-text-muted)]">
                {locale === "zh" ? (displayLocale === "zh-TW" ? "暫無理由代碼" : "暂无理由代码") : "No rationale codes"}
              </span>
            )}
          </div>
        </div>
        <div className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
            {locale === "zh" ? (displayLocale === "zh-TW" ? "取捨代碼" : "取舍代码") : "Tradeoff codes"}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(transitionPath.tradeoffCodes ?? []).length > 0 ? (
              (transitionPath.tradeoffCodes ?? []).map((code) => (
                <span
                  key={code}
                  className="rounded-full border border-[var(--fm-border)] bg-[var(--fm-surface)] px-2 py-1 text-[11px] font-mono text-[var(--fm-text-muted)]"
                >
                  {code}
                </span>
              ))
            ) : (
              <span className="text-sm text-[var(--fm-text-muted)]">
                {locale === "zh" ? (displayLocale === "zh-TW" ? "暫無取捨代碼" : "暂无取舍代码") : "No tradeoff codes"}
              </span>
            )}
          </div>
        </div>
      </section>

      {deltaEntries.length > 0 ? (
        <section
          className="space-y-2 rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4"
          data-testid="career-transition-path-delta"
        >
          <h3 className="m-0 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
            {locale === "zh" ? (displayLocale === "zh-TW" ? "比較摘要" : "对比快照") : "Comparison snapshot"}
          </h3>
          {deltaEntries.map(([key, entry]) => (
            <div
              key={key}
              className="grid gap-2 border-b border-[var(--fm-border)] pb-2 last:border-b-0 last:pb-0 md:grid-cols-[minmax(0,1fr)_auto]"
            >
              <div className="space-y-1">
                <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
                  {getDeltaLabel(locale, displayLocale, key)}
                </p>
                <p className="m-0 text-sm text-[var(--fm-text)]">
                  <span className="font-mono">{entry.sourceValue}</span>
                  <span className="px-2 text-[var(--fm-text-muted)]">→</span>
                  <span className="font-mono">{entry.targetValue}</span>
                </p>
              </div>
              <div className="flex items-center md:justify-end">
                <span className="rounded-full border border-[var(--fm-border)] px-2 py-1 font-mono text-[11px] text-[var(--fm-text-muted)]">
                  {entry.direction}
                </span>
              </div>
            </div>
          ))}
        </section>
      ) : null}

      <section data-testid="career-transition-path-trust-summary">
        <TrustStrip
          locale={displayLocale}
          publicReview={transitionPath.trustSummary.publicReview}
          indexState={transitionPath.seoContract.indexState}
          reasonCodes={transitionPath.trustSummary.reasonCodes}
          compact
          testId="career-transition-path-trust-strip"
        />
      </section>
    </section>
  );
}

function emphasizeBridge(variant: CareerTransitionEmphasisVariant): boolean {
  return variant === "balanced" || variant === "risk_first";
}
