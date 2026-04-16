import type { ReactNode } from "react";
import type {
  CareerLifecycleOperationalAdapter,
  CareerProjectionDeltaSummaryAdapter,
  CareerProjectionTimelineAdapter,
} from "@/lib/career/adapters/types";
import type { Locale } from "@/lib/i18n/locales";

type CareerLifecycleOperationalPanelProps = {
  locale: Locale;
  lifecycleOperational: CareerLifecycleOperationalAdapter;
  projectionTimeline: CareerProjectionTimelineAdapter | null;
  projectionDeltaSummary: CareerProjectionDeltaSummaryAdapter | null;
  children: ReactNode;
  testId?: string;
};

export function CareerLifecycleOperationalPanel({
  locale,
  lifecycleOperational,
  projectionTimeline,
  projectionDeltaSummary,
  children,
  testId,
}: CareerLifecycleOperationalPanelProps) {
  return (
    <section
      className="space-y-4 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      data-testid={testId ?? "career-lifecycle-operational-panel"}
    >
      <div className="space-y-1">
        <h2 className="m-0 font-serif text-2xl font-semibold text-[var(--fm-text)]">
          {locale === "zh" ? "Lifecycle 操作面" : "Lifecycle operational panel"}
        </h2>
        <p className="m-0 text-sm text-[var(--fm-text-muted)]">
          {locale === "zh"
            ? "将 feedback / timeline / delta / shortlist 收拢为同一操作闭环。"
            : "Unifies feedback, timeline, delta, and shortlist into one operational loop."}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-4" data-testid="career-lifecycle-operational-metrics">
        <Metric
          label={locale === "zh" ? "Timeline entries" : "Timeline entries"}
          value={String(lifecycleOperational.timelineEntryCount ?? projectionTimeline?.entries.length ?? 0)}
        />
        <Metric
          label={locale === "zh" ? "Delta" : "Delta"}
          value={
            lifecycleOperational.deltaAvailable || projectionDeltaSummary?.deltaAvailable
              ? locale === "zh"
                ? "可用"
                : "available"
              : locale === "zh"
                ? "不可用"
                : "unavailable"
          }
        />
        <Metric
          label={locale === "zh" ? "Lifecycle state" : "Lifecycle state"}
          value={lifecycleOperational.lifecycleState ?? "baseline_only"}
        />
        <Metric
          label={locale === "zh" ? "Closure state" : "Closure state"}
          value={lifecycleOperational.closureState ?? "baseline_only"}
        />
      </div>

      {children}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-3">
      <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">{label}</p>
      <p className="m-0 mt-2 text-sm font-medium text-[var(--fm-text)]">{value}</p>
    </div>
  );
}
