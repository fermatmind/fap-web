import { notFound } from "next/navigation";
import { CrosswalkOverrideSummary } from "@/components/ops/career/CrosswalkOverrideSummary";
import { CrosswalkPatchForm } from "@/components/ops/career/CrosswalkPatchForm";
import { CrosswalkPatchHistory } from "@/components/ops/career/CrosswalkPatchHistory";
import {
  adaptCareerCrosswalkOverrideSummary,
  adaptCareerCrosswalkPatchHistory,
} from "@/lib/career/adapters/adaptCareerCrosswalkOps";
import {
  fetchCareerCrosswalkOverrideSummary,
  fetchCareerCrosswalkPatchHistory,
  fetchCareerCrosswalkReviewQueueItem,
} from "@/lib/career/api/fetchCareerCrosswalkOps";
import { isCareerCrosswalkOpsRouteEnabled } from "@/lib/career/crosswalkOpsAccess";
import { normalizeLocale, type Locale } from "@/lib/i18n/locales";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export const dynamic = "force-dynamic";

export default async function CareerCrosswalkOpsDetailPage({ params }: Props) {
  const { locale: localeParam, slug } = await params;
  const locale = normalizeLocale(localeParam) as Locale;
  if (!isCareerCrosswalkOpsRouteEnabled()) {
    notFound();
  }

  const [queueItem, patchHistoryRaw, overrideRaw] = await Promise.all([
    fetchCareerCrosswalkReviewQueueItem({ locale, slug }),
    fetchCareerCrosswalkPatchHistory({ locale, slug }),
    fetchCareerCrosswalkOverrideSummary({ locale, slug }),
  ]);

  if (!queueItem) {
    notFound();
  }

  const history = adaptCareerCrosswalkPatchHistory(patchHistoryRaw);
  const overrideSummary = adaptCareerCrosswalkOverrideSummary(overrideRaw);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-4 rounded-xl border border-slate-200 bg-white p-4">
        <h1 className="text-2xl font-semibold text-slate-900">Crosswalk ops detail</h1>
        <p className="mt-1 text-sm text-slate-600">
          {String(queueItem.subject_slug ?? slug)} · {String(queueItem.current_crosswalk_mode ?? "unknown mode")}
        </p>
        <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-slate-600 sm:grid-cols-3">
          <div>
            <span className="text-slate-500">candidate:</span> {String(queueItem.candidate_target_kind ?? "—")} /{" "}
            {String(queueItem.candidate_target_slug ?? "—")}
          </div>
          <div>
            <span className="text-slate-500">publish track:</span> {String(queueItem.publish_track ?? "—")}
          </div>
          <div>
            <span className="text-slate-500">latest patch:</span> {String(queueItem.latest_patch_status ?? "none")}
          </div>
        </div>
      </header>

      <div className="space-y-4">
        <CrosswalkOverrideSummary summary={overrideSummary} />
        <CrosswalkPatchHistory history={history} />
        <CrosswalkPatchForm
          locale={locale}
          subjectSlug={slug}
          defaultTargetKind={(queueItem.candidate_target_kind as "occupation" | "family" | null) ?? "occupation"}
          defaultTargetSlug={typeof queueItem.candidate_target_slug === "string" ? queueItem.candidate_target_slug : slug}
          latestPatchKey={typeof queueItem.latest_patch_key === "string" ? queueItem.latest_patch_key : null}
        />
      </div>
    </main>
  );
}
