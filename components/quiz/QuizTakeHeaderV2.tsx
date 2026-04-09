import Link from "next/link";
import { LiveCompletedCounter } from "@/components/marketing/LiveCompletedCounter";

export function QuizTakeHeaderV2({
  brand,
  completedPrefix,
  completedSuffix,
  estimatedTimeLabel,
  minutesUnit,
  estimatedMinutes,
  backHref,
  backLabel,
  progressText,
  current,
  total,
  answered,
}: {
  brand: string;
  completedPrefix: string;
  completedSuffix: string;
  estimatedTimeLabel: string;
  minutesUnit: string;
  estimatedMinutes?: number | null;
  backHref?: string;
  backLabel?: string;
  progressText: string;
  current: number;
  total: number;
  answered: number;
}) {
  const safeTotal = Math.max(1, total);
  const safeCurrent = Math.min(Math.max(1, current), safeTotal);
  const percent = Math.round((Math.max(0, answered) / safeTotal) * 100);

  return (
    <header className="space-y-[var(--fm-gap-sm)] rounded-2xl border border-[var(--fm-border)] bg-white/95 p-[var(--fm-space-4)] shadow-[var(--fm-shadow-sm)] backdrop-blur">
      {backHref && backLabel ? (
        <Link href={backHref} className="text-sm font-medium text-[var(--fm-trust-blue)] hover:text-[var(--fm-trust-blue-strong)]">
          {backLabel}
        </Link>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-[var(--fm-gap-sm)]">
        <div className="min-w-0">
          <p className="m-0 font-serif text-lg font-semibold text-[var(--fm-text)]">{brand}</p>
          <p className="fm-tabular-nums mt-1 flex flex-wrap items-baseline gap-1 text-xs text-[var(--fm-text-muted)]">
            <span>{completedPrefix}</span>
            <LiveCompletedCounter className="font-semibold text-[var(--fm-text)]" />
            <span>{completedSuffix}</span>
          </p>
        </div>

        {typeof estimatedMinutes === "number" && estimatedMinutes > 0 ? (
          <p className="m-0 rounded-full border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] px-[var(--fm-pad-btn-sm-x)] py-[var(--fm-pad-btn-sm-y)] text-xs font-semibold text-[var(--fm-text)]">
            {estimatedTimeLabel}: {estimatedMinutes} {minutesUnit}
          </p>
        ) : null}
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between gap-[var(--fm-gap-sm)] text-xs">
          <p className="m-0 font-semibold text-[var(--fm-text)]">{progressText}</p>
          <p className="m-0 fm-tabular-nums font-semibold text-[var(--fm-trust-blue)]">
            {percent}% ({safeCurrent}/{safeTotal})
          </p>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[var(--fm-surface-muted)]" aria-hidden>
          <div
            className="h-full bg-gradient-to-r from-[var(--fm-trust-blue)] to-[var(--fm-teal)] transition-all duration-300"
            style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
          />
        </div>
      </div>
    </header>
  );
}
