export function MatrixProgressHeader({
  title,
  current,
  total,
  answered,
  status,
}: {
  title: string;
  current: number;
  total: number;
  answered: number;
  status?: string;
}) {
  const safeTotal = Math.max(1, total);
  const safeCurrent = Math.min(Math.max(1, current), safeTotal);
  const percent = Math.round((answered / safeTotal) * 100);

  return (
    <header className="sticky top-0 z-10 rounded-2xl border border-[var(--fm-border)] bg-white/95 p-4 shadow-[var(--fm-shadow-sm)] backdrop-blur">
      <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="m-0 text-sm font-semibold text-[var(--fm-text)]">{title}</p>
          {status ? <p className="m-0 text-xs text-[var(--fm-text-muted)]">{status}</p> : null}
        </div>
        <div className="text-right">
          <p className="m-0 text-sm font-semibold text-[var(--fm-trust-blue)]">{percent}%</p>
          <p className="m-0 text-xs text-[var(--fm-text-muted)]">
            {safeCurrent}/{safeTotal}
          </p>
        </div>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-[var(--fm-surface-muted)]" aria-hidden>
        <div
          className="h-full bg-gradient-to-r from-[var(--fm-trust-blue)] to-[var(--fm-teal)] transition-all duration-300"
          style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
        />
      </div>
    </header>
  );
}
