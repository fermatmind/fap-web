import type { HubMetric } from "@/lib/mbti/personalityHub.types";

export function ExecutiveSnapshotPanel({
  heading,
  metrics,
}: {
  heading: string;
  metrics: HubMetric[];
}) {
  return (
    <aside
      className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-hub-panel-bg)] p-5 shadow-[var(--fm-shadow-md)]"
      data-testid="personality-executive-snapshot"
    >
      <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-hub-navy)]">{heading}</p>
      <div className="mt-4 flex flex-wrap gap-2 md:hidden" data-testid="personality-executive-snapshot-compact">
        {metrics.slice(0, 3).map((metric) => (
          <span
            key={metric.key}
            className="rounded-full border border-[var(--fm-border)] bg-[var(--fm-hub-panel-muted-bg)] px-3 py-2 text-xs font-semibold text-[var(--fm-text)]"
          >
            {metric.value} · {metric.label}
          </span>
        ))}
      </div>
      <div className="mt-4 hidden gap-3 sm:grid-cols-2 md:grid">
        {metrics.map((metric) => (
          <div
            key={metric.key}
            className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-hub-panel-muted-bg)] p-4"
            data-testid={`personality-executive-metric-${metric.key}`}
          >
            <p className="m-0 text-2xl font-semibold text-[var(--fm-hub-navy)]">{metric.value}</p>
            <p className="m-0 mt-1 text-sm text-[var(--fm-text-muted)]">{metric.label}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}
