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
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
      <p className="m-0 text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-sm text-slate-600">
        {description ?? "Unlock to view this section in your full BIG5 report."}
      </p>
      <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {ctaLabel ?? "Unlock full report"}
      </p>
    </div>
  );
}
