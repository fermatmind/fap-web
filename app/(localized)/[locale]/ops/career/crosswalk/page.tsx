import { notFound } from "next/navigation";
import { CrosswalkQueueTable } from "@/components/ops/career/CrosswalkQueueTable";
import { adaptCareerCrosswalkQueue } from "@/lib/career/adapters/adaptCareerCrosswalkOps";
import { fetchCareerCrosswalkReviewQueue } from "@/lib/career/api/fetchCareerCrosswalkOps";
import { normalizeLocale, type Locale } from "@/lib/i18n/locales";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{
    crosswalk_mode?: string | string[];
    requires_editorial_patch?: string | string[];
    publish_track?: string | string[];
    batch_origin?: string | string[];
    queue_reason?: string | string[];
    sort?: string | string[];
  }>;
};

function pickString(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export default async function CareerCrosswalkOpsQueuePage({ params, searchParams }: Props) {
  const { locale: localeParam } = await params;
  const query: NonNullable<Awaited<Props["searchParams"]>> = (await searchParams) ?? {};
  const locale = normalizeLocale(localeParam) as Locale;

  const payload = await fetchCareerCrosswalkReviewQueue({
    locale,
    filters: {
      crosswalk_mode: pickString(query.crosswalk_mode),
      requires_editorial_patch: pickString(query.requires_editorial_patch),
      publish_track: pickString(query.publish_track),
      batch_origin: pickString(query.batch_origin),
      queue_reason: pickString(query.queue_reason),
      sort: pickString(query.sort) ?? "risk",
    },
  });
  if (!payload) {
    notFound();
  }
  const queue = adaptCareerCrosswalkQueue(payload);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-4">
        <h1 className="text-2xl font-semibold text-slate-900">Career crosswalk review queue</h1>
        <p className="mt-1 text-sm text-slate-600">
          Internal-only queue for local_heavy_interpretation, family_proxy, unmapped and conservative review modes.
        </p>
      </header>

      <div className="mb-4 grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm sm:grid-cols-4">
        <div>
          <div className="text-xs text-slate-500">Total</div>
          <div className="text-lg font-semibold text-slate-900">{queue.counts.total ?? 0}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Local heavy</div>
          <div className="text-lg font-semibold text-red-700">{queue.counts.local_heavy_interpretation ?? 0}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Family proxy</div>
          <div className="text-lg font-semibold text-amber-700">{queue.counts.family_proxy ?? 0}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Unmapped</div>
          <div className="text-lg font-semibold text-orange-700">{queue.counts.unmapped ?? 0}</div>
        </div>
      </div>

      <CrosswalkQueueTable locale={locale} items={queue.items} />
    </main>
  );
}
