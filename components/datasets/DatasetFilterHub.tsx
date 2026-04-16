type DatasetFilterHubProps = {
  familyEnabled: boolean;
  publishTrackEnabled: boolean;
  indexPostureEnabled: boolean;
  includedCount: number;
  excludedCount: number;
  familyFacet: Record<string, number>;
  publishTrackFacet: Record<string, number>;
  releaseCohortFacet: Record<string, number>;
  publicIndexStateFacet: Record<string, number>;
};

function topFacetSummary(facet: Record<string, number>): string {
  const entries = Object.entries(facet).sort((left, right) => right[1] - left[1]);
  if (entries.length === 0) {
    return "No public-safe distribution available.";
  }

  return entries
    .slice(0, 3)
    .map(([key, value]) => `${key}: ${value}`)
    .join(" · ");
}

export function DatasetFilterHub({
  familyEnabled,
  publishTrackEnabled,
  indexPostureEnabled,
  includedCount,
  excludedCount,
  familyFacet,
  publishTrackFacet,
  releaseCohortFacet,
  publicIndexStateFacet,
}: DatasetFilterHubProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6" data-testid="dataset-filter-hub">
      <div className="space-y-2">
        <h2 className="m-0 text-2xl font-semibold tracking-tight text-slate-950">How to use this database</h2>
        <p className="m-0 text-sm leading-6 text-slate-500">
          Use the public summary to understand coverage first. Detailed internal review queues and raw evidence stay out of this page.
        </p>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <Info label="Included / Excluded" value={`${includedCount} / ${excludedCount}`} />
        <Info label="Family filters" value={familyEnabled ? "Available" : "Deferred"} />
        <Info label="Index posture" value={indexPostureEnabled ? "Available" : "Deferred"} />
      </div>
      <details className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        <summary className="cursor-pointer font-medium text-slate-900">View public-safe facet summary</summary>
        <div className="mt-4 grid gap-3 border-t border-slate-200 pt-4 md:grid-cols-2">
          <Info label="Family distribution" value={topFacetSummary(familyFacet)} />
          <Info label="Publish track" value={publishTrackEnabled ? topFacetSummary(publishTrackFacet) : "Deferred"} />
          <Info label="Release coverage" value={topFacetSummary(releaseCohortFacet)} />
          <Info label="Public index posture" value={topFacetSummary(publicIndexStateFacet)} />
        </div>
      </details>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="m-0 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="m-0 mt-2 text-sm font-medium text-slate-950">{value}</p>
    </div>
  );
}
