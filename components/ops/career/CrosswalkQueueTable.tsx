import Link from "next/link";
import type { CareerCrosswalkOpsQueueItemAdapter } from "@/lib/career/adapters/types";
import type { Locale } from "@/lib/i18n/locales";
import { localizedPath } from "@/lib/i18n/locales";

type CrosswalkQueueTableProps = {
  locale: Locale;
  items: CareerCrosswalkOpsQueueItemAdapter[];
};

function modeTone(mode: string | null): string {
  switch (mode) {
    case "local_heavy_interpretation":
      return "text-red-700";
    case "unmapped":
      return "text-orange-700";
    case "family_proxy":
      return "text-amber-700";
    default:
      return "text-slate-700";
  }
}

export function CrosswalkQueueTable({ locale, items }: CrosswalkQueueTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full text-sm" data-testid="crosswalk-ops-queue-table">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-600">
          <tr>
            <th className="px-3 py-2">Slug</th>
            <th className="px-3 py-2">Mode</th>
            <th className="px-3 py-2">Target</th>
            <th className="px-3 py-2">Patch</th>
            <th className="px-3 py-2">Queue reason</th>
            <th className="px-3 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.subjectSlug} className="border-t border-slate-100 align-top">
              <td className="px-3 py-3">
                <div className="font-medium text-slate-900">{item.subjectSlug}</div>
                <div className="text-xs text-slate-500">{item.canonicalTitleEn ?? "—"}</div>
              </td>
              <td className={`px-3 py-3 font-medium ${modeTone(item.currentCrosswalkMode)}`}>
                {item.currentCrosswalkMode ?? "unknown"}
              </td>
              <td className="px-3 py-3">
                <div>{item.candidateTargetKind ?? "—"}</div>
                <div className="text-xs text-slate-500">{item.candidateTargetSlug ?? "—"}</div>
              </td>
              <td className="px-3 py-3">
                <div>{item.latestPatchStatus ?? "none"}</div>
                <div className="text-xs text-slate-500">{item.latestPatchVersion ?? "—"}</div>
              </td>
              <td className="px-3 py-3 text-xs text-slate-600">
                {(item.queueReasons.length > 0 ? item.queueReasons : ["none"]).join(", ")}
              </td>
              <td className="px-3 py-3">
                <Link
                  href={localizedPath(`/ops/career/crosswalk/${item.subjectSlug}`, locale)}
                  className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Open
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
