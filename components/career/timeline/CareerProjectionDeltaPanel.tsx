import type { CareerProjectionDeltaSummaryAdapter } from "@/lib/career/adapters/types";
import type { Locale } from "@/lib/i18n/locales";

type CareerProjectionDeltaPanelProps = {
  locale: Locale;
  delta: CareerProjectionDeltaSummaryAdapter;
  testId?: string;
};

function renderDelta(value: number | null): string {
  if (value === null) {
    return "—";
  }

  return `${value > 0 ? "+" : ""}${value}`;
}

export function CareerProjectionDeltaPanel({ locale, delta, testId }: CareerProjectionDeltaPanelProps) {
  if (!delta.deltaAvailable) {
    return null;
  }

  return (
    <section
      className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      data-testid={testId ?? "career-projection-delta"}
    >
      <h3 className="m-0 font-serif text-xl font-semibold text-[var(--fm-text)]">
        {locale === "zh" ? "变化摘要" : "Delta summary"}
      </h3>
      <div className="grid gap-2 md:grid-cols-3">
        {Object.entries(delta.scoreDeltas).map(([key, metric]) => (
          <div key={key} className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-3">
            <p className="m-0 text-xs uppercase tracking-[0.08em] text-[var(--fm-accent)]">{key}</p>
            <p className="m-0 mt-1 text-sm text-[var(--fm-text-muted)]">
              {locale === "zh" ? "变化" : "Delta"}: {renderDelta(metric.delta)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

