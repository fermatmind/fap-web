import type { CareerCrosswalkOverrideSummaryAdapter } from "@/lib/career/adapters/types";

type CrosswalkOverrideSummaryProps = {
  summary: CareerCrosswalkOverrideSummaryAdapter | null;
};

export function CrosswalkOverrideSummary({ summary }: CrosswalkOverrideSummaryProps) {
  if (!summary) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-4" data-testid="crosswalk-override-summary">
        <h2 className="text-base font-semibold text-slate-900">Override resolution</h2>
        <p className="mt-2 text-sm text-slate-500">No override summary available.</p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4" data-testid="crosswalk-override-summary">
      <h2 className="text-base font-semibold text-slate-900">Override resolution</h2>
      <p className="mt-1 text-xs text-slate-600">{summary.canonicalTitleEn ?? summary.subjectSlug}</p>

      <dl className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs text-slate-500">Original mode</dt>
          <dd className="font-medium text-slate-900">{summary.originalCrosswalkMode ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Resolved mode</dt>
          <dd className="font-medium text-slate-900">{summary.resolvedCrosswalkMode ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Resolved target</dt>
          <dd className="font-medium text-slate-900">
            {summary.resolvedTargetKind ?? "—"} / {summary.resolvedTargetSlug ?? "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Override applied</dt>
          <dd className="font-medium text-slate-900">{summary.overrideApplied ? "yes" : "no"}</dd>
        </div>
      </dl>
    </section>
  );
}

