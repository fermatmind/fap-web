import Link from "next/link";
import { EvidenceDrawer } from "@/components/career/v1/EvidenceDrawer";

type DatasetMethodPanelProps = {
  title: string;
  summary: string;
  sourceSummary: string;
  reviewDisciplineSummary: string;
  included: string[];
  excluded: string[];
  boundaryNotes: string[];
  scopeSummary: {
    memberCount: number;
    includedCount: number;
    excludedCount: number;
    releaseCohortCounts: Record<string, number>;
    strongIndexDecisionCounts: Record<string, number>;
  };
  publication: {
    publisherName: string;
    publisherUrl: string;
    licenseName: string;
    licenseUrl: string;
    usageSummary: string;
    downloadUrl: string;
  };
};

export function DatasetMethodPanel({ title, summary, sourceSummary, reviewDisciplineSummary, included, excluded, boundaryNotes, scopeSummary, publication }: DatasetMethodPanelProps) {
  return (
    <section className="space-y-8" data-testid="dataset-method-panel">
      <header className="mx-auto max-w-4xl space-y-4 text-center">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">Dataset method</p>
        <h1 className="m-0 text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">{title}</h1>
        <p className="mx-auto m-0 max-w-2xl text-base leading-7 text-slate-500">{summary}</p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Metric label="Tracked occupations" value={String(scopeSummary.memberCount)} />
        <Metric label="Included publicly" value={String(scopeSummary.includedCount)} />
        <Metric label="Excluded from public detail" value={String(scopeSummary.excludedCount)} />
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <h2 className="m-0 text-2xl font-semibold tracking-tight text-slate-950">What this method protects</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <CopyBlock title="Sources" body={sourceSummary} />
          <CopyBlock title="Review discipline" body={reviewDisciplineSummary} />
        </div>
        <p className="m-0 mt-5 text-sm leading-6 text-slate-500">{publication.usageSummary}</p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link href={publication.publisherUrl} className="font-semibold text-orange-600 hover:text-orange-700">{publication.publisherName}</Link>
          <Link href={publication.licenseUrl} className="font-semibold text-orange-600 hover:text-orange-700">{publication.licenseName}</Link>
          <Link href={publication.downloadUrl} className="font-semibold text-orange-600 hover:text-orange-700">Download</Link>
        </div>
      </section>

      <div className="space-y-3">
        <EvidenceDrawer title="View inclusion boundary" testId="dataset-method-inclusion-drawer">
          <List title="Included" items={included} />
          <List title="Excluded" items={excluded} />
        </EvidenceDrawer>
        <EvidenceDrawer title="View method boundary" testId="dataset-method-boundary-drawer">
          <List title="Boundary notes" items={boundaryNotes} />
        </EvidenceDrawer>
        <EvidenceDrawer title="View technical distributions" testId="dataset-method-distribution-drawer">
          <Facet title="Release cohort distribution" facet={scopeSummary.releaseCohortCounts} />
          <Facet title="Strong-index decision distribution" facet={scopeSummary.strongIndexDecisionCounts} />
        </EvidenceDrawer>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 text-center shadow-sm">
      <p className="m-0 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="m-0 mt-3 text-4xl font-semibold tracking-tight text-slate-950">{value}</p>
    </div>
  );
}

function CopyBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <h2 className="m-0 text-base font-semibold text-slate-950">{title}</h2>
      <p className="m-0 mt-2 text-sm leading-6 text-slate-500">{body}</p>
    </div>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h2 className="m-0 text-base font-semibold text-slate-950">{title}</h2>
      <ul className="m-0 mt-2 list-disc space-y-1 pl-5">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function Facet({ title, facet }: { title: string; facet: Record<string, number> }) {
  const entries = Object.entries(facet).sort((left, right) => right[1] - left[1]);
  if (entries.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="m-0 text-base font-semibold text-slate-950">{title}</h2>
      <ul className="m-0 mt-2 list-disc space-y-1 pl-5">
        {entries.map(([key, value]) => (
          <li key={`${title}-${key}`}>{key}: {value}</li>
        ))}
      </ul>
    </div>
  );
}
