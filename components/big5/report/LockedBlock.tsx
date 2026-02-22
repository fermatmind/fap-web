export function LockedBlock({
  title,
  ctaLabel,
  description,
}: {
  title: string;
  ctaLabel?: string;
  description?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--fm-border)] bg-white/75 p-4 backdrop-blur-md">
      <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-white/50 to-slate-100/70" aria-hidden />
      <div className="relative z-10 space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--fm-border-strong)] bg-white/90 px-2 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-text-muted)]">
          <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 text-[var(--fm-accent)]" fill="currentColor" aria-hidden>
            <path d="M6 8V6a4 4 0 1 1 8 0v2h1a1 1 0 0 1 1 1v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a1 1 0 0 1 1-1h1Zm2 0h4V6a2 2 0 1 0-4 0v2Z" />
          </svg>
          Locked
        </div>
        <p className="m-0 text-sm font-semibold text-[var(--fm-text)]">{title}</p>
        <p className="m-0 text-sm text-[var(--fm-text-muted)]">
          {description ?? "Unlock to view this section in your full BIG5 report."}
        </p>
        <p className="m-0 text-xs font-semibold uppercase tracking-wide text-[var(--fm-accent)]">
          {ctaLabel ?? "Unlock full report"}
        </p>
      </div>
    </div>
  );
}
