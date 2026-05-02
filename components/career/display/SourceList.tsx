import type { CareerDisplaySource } from "@/lib/career/displaySurface";

type SourceListProps = {
  heading: string;
  sources: CareerDisplaySource[];
};

export function SourceList({ heading, sources }: SourceListProps) {
  if (sources.length === 0) {
    return null;
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5" data-testid="source-list">
      <h2 className="m-0 text-2xl font-semibold tracking-normal text-slate-950">{heading}</h2>
      <ul className="m-0 mt-4 space-y-3 p-0">
        {sources.map((source) => (
          <li key={source.key} className="list-none text-sm leading-6 text-slate-700">
            {source.url ? (
              <a href={source.url} className="font-semibold text-slate-950 underline-offset-4 hover:underline">
                {source.label}
              </a>
            ) : (
              <span className="font-semibold text-slate-950">{source.label}</span>
            )}
            {source.usage ? <span> - {source.usage}</span> : null}
            {source.capturedAt ? <span> Captured: {source.capturedAt}.</span> : null}
            {source.expiresAt ? <span> Expires: {source.expiresAt}.</span> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
