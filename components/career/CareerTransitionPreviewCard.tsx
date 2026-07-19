import { TrackedCareerLink } from "@/components/analytics/TrackedCareerLink";
import { TrustStrip } from "@/components/career/TrustStrip";
import { CAREER_TRACKING_EVENTS } from "@/lib/career/attribution";
import type {
  CareerTransitionPreviewAdapter,
  CareerTransitionPreviewDeltaEntryAdapter,
} from "@/lib/career/adapters/types";
import type { Locale } from "@/lib/i18n/locales";

function renderScoreValue(value: number | null): string {
  return value === null ? "—" : String(value);
}

function getPathTypeLabel(locale: Locale, pathType: string): string {
  if (pathType === "stable_upside") {
    return locale === "zh" ? "稳定上行路径" : "Stable upside";
  }

  return pathType.replace(/_/g, " ");
}

function getTargetRoleLabel(locale: Locale): string {
  return locale === "zh" ? "目标岗位" : "Target role";
}

function getIngredientsLabel(locale: Locale): string {
  return locale === "zh" ? "转岗要素" : "Transition ingredients";
}

function getComparisonLabel(locale: Locale): string {
  return locale === "zh" ? "对比快照" : "Comparison snapshot";
}

function getDeltaLabel(locale: Locale, key: "entryEducationDelta" | "workExperienceDelta" | "trainingDelta"): string {
  if (locale === "zh") {
    switch (key) {
      case "entryEducationDelta":
        return "入门学历";
      case "workExperienceDelta":
        return "工作经验";
      case "trainingDelta":
        return "在岗培训";
    }
  }

  switch (key) {
    case "entryEducationDelta":
      return "Entry education";
    case "workExperienceDelta":
      return "Work experience";
    case "trainingDelta":
      return "Training";
  }
}

type CareerTransitionPreviewCardProps = {
  locale: Locale;
  preview: CareerTransitionPreviewAdapter;
  landingPath: string;
};

export function CareerTransitionPreviewCard({
  locale,
  preview,
  landingPath,
}: CareerTransitionPreviewCardProps) {
  const hasSteps = Array.isArray(preview.steps) && preview.steps.length > 0;
  const deltaEntries = preview.delta
    ? ([
        ["entryEducationDelta", preview.delta.entryEducationDelta],
        ["workExperienceDelta", preview.delta.workExperienceDelta],
        ["trainingDelta", preview.delta.trainingDelta],
      ] as const).filter((entry): entry is [
        "entryEducationDelta" | "workExperienceDelta" | "trainingDelta",
        CareerTransitionPreviewDeltaEntryAdapter,
      ] => Boolean(entry[1]))
    : [];

  return (
    <section
      className="space-y-4 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      data-testid="career-transition-preview"
    >
      <div className="space-y-1" data-testid="career-transition-preview-header">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
          {locale === "zh" ? "转岗预览" : "Transition preview"}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="m-0 font-serif text-2xl font-semibold text-[var(--fm-text)]">
            {locale === "zh" ? "下一步岗位预览" : "Next-step role preview"}
          </h2>
          <span
            className="rounded-full border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]"
            data-testid="career-transition-preview-path-type"
          >
            {getPathTypeLabel(locale, preview.pathType)}
          </span>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4">
        <div
          className="flex flex-wrap items-start justify-between gap-3"
          data-testid="career-transition-preview-target"
        >
          <div className="space-y-1">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
              {getTargetRoleLabel(locale)}
            </p>
            <TrackedCareerLink
              href={preview.targetJob.href}
              eventName={CAREER_TRACKING_EVENTS.transitionPreviewTargetClick}
              eventPayload={{
                locale,
                entrySurface: "career_recommendation_detail_transition_preview",
                sourcePageType: "career_recommendation_detail",
                targetAction: "open_transition_target_job",
                landingPath,
                routeFamily: "recommendation_detail",
                subjectKind: "job_slug",
                subjectKey: preview.targetJob.canonicalSlug,
                queryMode: "non_query",
              }}
              data-testid="career-transition-preview-link"
              className="text-lg font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]"
            >
              {preview.targetJob.title}
            </TrackedCareerLink>
          </div>
        </div>

        <div
          className="grid gap-3 md:grid-cols-2"
          data-testid="career-transition-preview-score-band"
        >
          <div
            className="rounded-lg border border-[var(--fm-border)] bg-[var(--fm-surface)] p-3"
            data-testid="career-transition-preview-score-mobility"
          >
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
              Mobility
            </p>
            <p className="m-0 mt-2 text-2xl font-semibold text-[var(--fm-text)]">
              {renderScoreValue(preview.scoreSummary.mobilityScore.value)}
            </p>
            <p className="m-0 mt-1 text-xs text-[var(--fm-text-muted)]">
              {preview.scoreSummary.mobilityScore.integrity_state}
            </p>
          </div>
          <div
            className="rounded-lg border border-[var(--fm-border)] bg-[var(--fm-surface)] p-3"
            data-testid="career-transition-preview-score-confidence"
          >
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
              Confidence
            </p>
            <p className="m-0 mt-2 text-2xl font-semibold text-[var(--fm-text)]">
              {renderScoreValue(preview.scoreSummary.confidenceScore.value)}
            </p>
            <p className="m-0 mt-1 text-xs text-[var(--fm-text-muted)]">
              {preview.scoreSummary.confidenceScore.integrity_state}
            </p>
          </div>
        </div>

        {hasSteps ? (
          <div
            className="space-y-2 rounded-lg border border-[var(--fm-border)] bg-[var(--fm-surface)] p-3"
            data-testid="career-transition-preview-ingredients"
          >
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
              {getIngredientsLabel(locale)}
            </p>
            <div
              className="flex flex-wrap gap-2 text-[11px] text-[var(--fm-text-muted)]"
              data-testid="career-transition-preview-steps"
            >
              {preview.steps?.map((step) => (
                <span
                  key={step}
                  className="rounded-full border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] px-2 py-1 font-mono"
                >
                  {step}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {deltaEntries.length > 0 ? (
          <div
            className="space-y-2 rounded-lg border border-[var(--fm-border)] bg-[var(--fm-surface)] p-3"
            data-testid="career-transition-preview-comparison"
          >
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
              {getComparisonLabel(locale)}
            </p>
            <div
              className="space-y-2"
              data-testid="career-transition-preview-delta"
            >
              {deltaEntries.map(([key, entry]) => (
                <div
                  key={key}
                  className="grid gap-2 border-b border-[var(--fm-border)] pb-2 last:border-b-0 last:pb-0 md:grid-cols-[minmax(0,1fr)_auto]"
                >
                  <div className="space-y-1">
                    <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
                      {getDeltaLabel(locale, key)}
                    </p>
                    <p className="m-0 text-sm text-[var(--fm-text)]" data-testid={`career-transition-preview-delta-${key}`}>
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
            </div>
          </div>
        ) : null}

        <div data-testid="career-transition-preview-footer">
          <TrustStrip
            locale={locale}
            publicReview={preview.trustSummary.publicReview}
            indexState={preview.seoContract.indexState}
            reasonCodes={preview.trustSummary.reasonCodes}
            compact
            testId="career-transition-preview-trust-strip"
          />
        </div>
      </div>
    </section>
  );
}
