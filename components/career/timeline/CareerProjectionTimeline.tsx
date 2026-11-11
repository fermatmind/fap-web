import type { CareerProjectionTimelineAdapter } from "@/lib/career/adapters/types";
import type { DisplayLocale } from "@/lib/i18n/locales";

type CareerProjectionTimelineProps = {
  locale: DisplayLocale;
  timeline: CareerProjectionTimelineAdapter;
  testId?: string;
};

function formatTimestamp(value: string | null): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toISOString().replace("T", " ").slice(0, 16);
}

export function CareerProjectionTimeline({ locale, timeline, testId }: CareerProjectionTimelineProps) {
  if (!timeline.entries.length) {
    return null;
  }

  return (
    <section
      className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      data-testid={testId ?? "career-projection-timeline"}
    >
      <h3 className="m-0 font-serif text-xl font-semibold text-[var(--fm-text)]">
        {locale === "zh-TW" ? "推薦紀錄" : locale === "zh" ? "投影时间线" : "Projection timeline"}
      </h3>
      <ol className="m-0 list-none space-y-2 p-0">
        {timeline.entries.map((entry, index) => (
          <li key={`${entry.projectionUuid ?? "projection"}-${index}`} className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-3">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--fm-accent)]">
              {entry.entryKind ?? "entry"}
            </p>
            <p className="m-0 mt-1 text-sm font-medium text-[var(--fm-text)]">
              {locale === "zh-TW" && entry.entryKind === "initial" && entry.entryLabel === "Initial recommendation snapshot" ? "首次推薦快照" : entry.entryLabel ?? (locale === "zh-TW" ? "職涯推薦快照" : locale === "zh" ? "职业快照" : "Career snapshot")}
            </p>
            <p className="m-0 mt-1 text-xs text-[var(--fm-text-muted)]">
              {locale === "zh-TW" ? "時間" : locale === "zh" ? "时间" : "Time"}: {formatTimestamp(entry.createdAt)}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

