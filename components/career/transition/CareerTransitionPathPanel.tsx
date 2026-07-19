import { TrackedCareerLink } from "@/components/analytics/TrackedCareerLink";
import { TrustStrip } from "@/components/career/TrustStrip";
import { CAREER_TRACKING_EVENTS } from "@/lib/career/attribution";
import type {
  CareerTransitionEmphasisVariant,
  CareerTransitionPreviewAdapter,
  CareerTransitionPreviewDeltaEntryAdapter,
} from "@/lib/career/adapters/types";
import type { Locale } from "@/lib/i18n/locales";

type CareerTransitionPathPanelProps = {
  locale: Locale;
  transitionPath: CareerTransitionPreviewAdapter;
  landingPath: string;
  emphasisVariant?: CareerTransitionEmphasisVariant;
  copyVariant?: "contract" | "public";
};

function renderScoreValue(value: number | null): string {
  return value === null ? "—" : String(value);
}

function getPathTypeLabel(locale: Locale, pathType: string): string {
  if (pathType === "bridge") {
    return locale === "zh" ? "衔接路径" : "Bridge";
  }

  if (pathType === "hedge") {
    return locale === "zh" ? "风险对冲路径" : "Hedge";
  }

  if (pathType === "stable_upside") {
    return locale === "zh" ? "稳健上行路径" : "Stable upside";
  }

  return locale === "zh" ? `自定义路径 · ${pathType}` : `Custom path · ${pathType}`;
}

function getPathTypeFocusCopy(locale: Locale, pathType: string): string {
  if (pathType === "bridge") {
    return locale === "zh"
      ? "强调 90 天衔接动作，优先解决迁移落地路径。"
      : "Focuses on 90-day bridge actions to make role transition execution concrete.";
  }

  if (pathType === "hedge") {
    return locale === "zh"
      ? "强调风险对冲与保守迁移，优先控制断裂成本。"
      : "Focuses on risk hedge and conservative transfer to reduce breakage cost.";
  }

  if (pathType === "stable_upside") {
    return locale === "zh"
      ? "强调稳健增益，在可控变化下提升上行空间。"
      : "Focuses on stable upside with controlled change and incremental gain.";
  }

  return locale === "zh"
    ? "该路径使用后端提供的自定义类型，页面采用保守展示。"
    : "This path type is backend-defined and rendered with conservative fallback semantics.";
}

function getTimeHorizonLabel(locale: Locale, horizon: string): string {
  if (horizon === "days_0_30") {
    return locale === "zh" ? "第 0-30 天" : "Days 0-30";
  }

  if (horizon === "days_31_60") {
    return locale === "zh" ? "第 31-60 天" : "Days 31-60";
  }

  if (horizon === "days_61_90") {
    return locale === "zh" ? "第 61-90 天" : "Days 61-90";
  }

  return horizon;
}

function getDeltaLabel(locale: Locale, key: "entryEducationDelta" | "workExperienceDelta" | "trainingDelta"): string {
  if (locale === "zh") {
    if (key === "entryEducationDelta") return "入门学历";
    if (key === "workExperienceDelta") return "工作经验";
    return "在岗培训";
  }

  if (key === "entryEducationDelta") return "Entry education";
  if (key === "workExperienceDelta") return "Work experience";
  return "Training";
}

export function CareerTransitionPathPanel({
  locale,
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
          {locale === "zh" ? "转岗路径" : "Transition path"}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="m-0 font-serif text-2xl font-semibold text-[var(--fm-text)]">
            {locale === "zh" ? "下一步路径可视化" : "Next-step path visualization"}
          </h2>
          <span className="rounded-full border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
            {getPathTypeLabel(locale, transitionPath.pathType)}
          </span>
        </div>
        <p className="m-0 text-sm text-[var(--fm-text-muted)]" data-testid="career-transition-path-focus-copy">
          {getPathTypeFocusCopy(locale, transitionPath.pathType)}
        </p>
        <p className="m-0 text-xs uppercase tracking-[0.1em] text-[var(--fm-text-muted)]" data-testid="career-transition-emphasis-variant">
          {locale === "zh" ? "展示强调" : "Display emphasis"}: {emphasisVariant}
        </p>
      </header>

      <div className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
          {locale === "zh" ? "目标岗位" : "Target job"}
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
            {locale === "zh" ? "为什么是这条路径" : "Why this path"}
          </h3>
          <p className="m-0 text-sm leading-7 text-[var(--fm-text)]">
            {transitionPath.whyThisPath ??
              (copyVariant === "public"
                ? locale === "zh"
                  ? "当前没有足够路径理由，页面保持保守降级。"
                  : "No path rationale is available yet; rendering a conservative fallback."
                : locale === "zh"
                  ? "当前后端未返回 why_this_path，页面保持保守降级。"
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
            {locale === "zh" ? "会失去什么" : "What is lost"}
          </h3>
          <p className="m-0 text-sm leading-7 text-[var(--fm-text)]">
            {transitionPath.whatIsLost ??
              (copyVariant === "public"
                ? locale === "zh"
                  ? "当前没有足够代价说明，页面保持保守降级。"
                  : "No tradeoff explanation is available yet; rendering a conservative fallback."
                : locale === "zh"
                  ? "当前后端未返回 what_is_lost，页面保持保守降级。"
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
          {copyVariant === "public" ? (locale === "zh" ? "衔接步骤" : "Bridge steps") : locale === "zh" ? "90 天衔接步骤" : "90-day bridge steps"}
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
                    {getTimeHorizonLabel(locale, step.timeHorizon)}
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
                ? "当前没有足够衔接步骤，页面保持保守降级。"
                : "当前后端未返回 bridge_steps_90d，页面保持保守降级。"
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
            {locale === "zh" ? "理由代码" : "Rationale codes"}
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
                {locale === "zh" ? "暂无理由代码" : "No rationale codes"}
              </span>
            )}
          </div>
        </div>
        <div className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
            {locale === "zh" ? "取舍代码" : "Tradeoff codes"}
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
                {locale === "zh" ? "暂无取舍代码" : "No tradeoff codes"}
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
            {locale === "zh" ? "对比快照" : "Comparison snapshot"}
          </h3>
          {deltaEntries.map(([key, entry]) => (
            <div
              key={key}
              className="grid gap-2 border-b border-[var(--fm-border)] pb-2 last:border-b-0 last:pb-0 md:grid-cols-[minmax(0,1fr)_auto]"
            >
              <div className="space-y-1">
                <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
                  {getDeltaLabel(locale, key)}
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
          locale={locale}
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
