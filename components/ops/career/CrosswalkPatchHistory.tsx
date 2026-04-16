import type { CareerCrosswalkPatchHistoryAdapter } from "@/lib/career/adapters/types";

type CrosswalkPatchHistoryProps = {
  history: CareerCrosswalkPatchHistoryAdapter;
};

export function CrosswalkPatchHistory({ history }: CrosswalkPatchHistoryProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4" data-testid="crosswalk-patch-history">
      <h2 className="text-base font-semibold text-slate-900">Patch history</h2>
      <p className="mt-1 text-xs text-slate-600">Version chain for {history.subjectSlug || "unknown subject"}.</p>

      <div className="mt-3 space-y-2">
        {history.patches.length === 0 ? (
          <p className="text-sm text-slate-500">No patches yet.</p>
        ) : (
          history.patches.map((patch) => (
            <div key={patch.patchKey} className="rounded-lg border border-slate-100 p-3">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-medium text-slate-900">{patch.patchVersion}</span>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700">{patch.patchStatus}</span>
                {patch.isLatest ? (
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">latest</span>
                ) : null}
              </div>
              <div className="mt-1 text-xs text-slate-600">
                target: {patch.targetKind ?? "—"} / {patch.targetSlug ?? "—"} · override:{" "}
                {patch.crosswalkModeOverride ?? "—"}
              </div>
              {patch.reviewNotes ? <p className="mt-1 text-xs text-slate-600">{patch.reviewNotes}</p> : null}
            </div>
          ))
        )}
      </div>
    </section>
  );
}

