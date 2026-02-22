export function ProgressHeader({
  current,
  total,
  answered,
}: {
  current: number;
  total: number;
  answered: number;
}) {
  const safeTotal = Math.max(total, 1);
  const percent = Math.round((answered / safeTotal) * 100);
  const remaining = Math.max(0, safeTotal - answered);
  const estimatedMinutesLeft = Math.max(1, Math.ceil((remaining * 10) / 60));

  return (
    <header className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-700">
        <span>
          {current}/{safeTotal}
        </span>
        <span>{percent}% complete</span>
        <span>{remaining} left</span>
        <span>~{estimatedMinutesLeft} min left</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200" aria-hidden>
        <div
          className="h-full bg-slate-900 transition-all"
          style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
        />
      </div>
    </header>
  );
}
