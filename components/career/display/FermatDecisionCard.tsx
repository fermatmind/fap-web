import type { CareerDisplaySection } from "@/lib/career/displaySurface";

type FermatDecisionCardProps = {
  section: CareerDisplaySection;
};

export function FermatDecisionCard({ section }: FermatDecisionCardProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5" data-testid="fermat-decision-card">
      <h2 className="m-0 text-2xl font-semibold tracking-normal text-slate-950">{section.heading}</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <h3 className="m-0 text-base font-semibold text-emerald-800">{section.fitTitle}</h3>
          <ul className="m-0 space-y-2 pl-5 text-sm leading-6 text-slate-700">
            {(section.fitItems ?? []).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="space-y-3">
          <h3 className="m-0 text-base font-semibold text-amber-800">{section.cautionTitle}</h3>
          <ul className="m-0 space-y-2 pl-5 text-sm leading-6 text-slate-700">
            {(section.cautionItems ?? []).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
