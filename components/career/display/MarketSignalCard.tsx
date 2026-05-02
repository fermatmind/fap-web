import type { CareerDisplaySection } from "@/lib/career/displaySurface";

type MarketSignalCardProps = {
  section: CareerDisplaySection;
};

export function MarketSignalCard({ section }: MarketSignalCardProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5" data-testid="market-signal-card">
      <h2 className="m-0 text-2xl font-semibold tracking-normal text-slate-950">{section.heading}</h2>
      {section.signalMeta && section.signalMeta.length > 0 ? (
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          {section.signalMeta.map(([label, value]) => (
            <div key={`${label}:${value}`} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <dt className="text-xs font-medium uppercase text-slate-500">{label}</dt>
              <dd className="m-0 mt-1 text-sm font-semibold text-slate-900">{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {section.body ? <p className="m-0 mt-4 text-sm leading-7 text-slate-700">{section.body}</p> : null}
      {section.keywords && section.keywords.length > 0 ? (
        <ul className="m-0 mt-4 flex list-none flex-wrap gap-2 p-0" aria-label="Market signal keywords">
          {section.keywords.map((keyword) => (
            <li key={keyword} className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">
              {keyword}
            </li>
          ))}
        </ul>
      ) : null}
      {section.interpretation ? <p className="m-0 mt-4 text-sm leading-7 text-slate-700">{section.interpretation}</p> : null}
      {section.linkedinNote ? <p className="m-0 mt-3 text-sm leading-7 text-slate-600">{section.linkedinNote}</p> : null}
    </section>
  );
}
