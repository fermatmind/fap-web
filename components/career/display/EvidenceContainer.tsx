import Link from "next/link";
import type { CareerDisplayChecklistItem, CareerDisplaySection, CareerDisplayTableRow } from "@/lib/career/displaySurface";

type EvidenceContainerProps = {
  section: CareerDisplaySection;
  testId?: string;
};

function renderBody(body: CareerDisplaySection["body"]) {
  if (!body) {
    return null;
  }

  if (Array.isArray(body)) {
    return (
      <div className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
        {body.map((paragraph) => (
          <p key={paragraph} className="m-0">
            {paragraph}
          </p>
        ))}
      </div>
    );
  }

  return <p className="m-0 mt-4 text-sm leading-7 text-slate-700">{body}</p>;
}

function isChecklistItem(value: string | CareerDisplayChecklistItem): value is CareerDisplayChecklistItem {
  return typeof value !== "string";
}

function TableRows({ rows }: { rows: CareerDisplayTableRow[] }) {
  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <div className="hidden overflow-hidden rounded-lg border border-slate-200 sm:block">
        <table className="w-full border-collapse text-left text-sm">
          <tbody>
            {rows.map((row) => (
              <tr key={row.join(":")} className="border-b border-slate-100 last:border-b-0">
                {row.map((cell, index) => (
                  <td key={`${cell}:${index}`} className="align-top px-4 py-3 text-slate-700 first:font-semibold first:text-slate-950">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="m-0 space-y-3 p-0 sm:hidden">
        {rows.map((row) => (
          <li key={row.join(":")} className="list-none rounded-lg border border-slate-200 p-3 text-sm text-slate-700">
            <p className="m-0 font-semibold text-slate-950">{row[0]}</p>
            <p className="m-0 mt-1">{row[1]}</p>
            {row[2] ? <p className="m-0 mt-1 text-slate-600">{row[2]}</p> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function EvidenceContainer({ section, testId }: EvidenceContainerProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5" data-testid={testId ?? `career-display-section-${section.id}`}>
      <h2 className="m-0 text-2xl font-semibold tracking-normal text-slate-950">{section.heading}</h2>
      {section.intro ? <p className="m-0 mt-3 text-sm leading-7 text-slate-700">{section.intro}</p> : null}
      {renderBody(section.body)}
      {section.answer ? <p className="m-0 mt-4 text-sm leading-7 text-slate-700">{section.answer}</p> : null}
      {section.profile && section.profile.length > 0 ? (
        <ul className="m-0 mt-4 flex list-none flex-wrap gap-2 p-0">
          {section.profile.map((item) => (
            <li key={item} className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800">
              {item}
            </li>
          ))}
        </ul>
      ) : null}
      <TableRows rows={section.rows ?? []} />
      <TableRows rows={section.entryTable ?? []} />
      {section.items && section.items.length > 0 ? (
        <ul className="m-0 mt-4 space-y-2 pl-5 text-sm leading-6 text-slate-700">
          {section.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
      {section.traits && section.traits.length > 0 ? (
        <ul className="m-0 mt-4 space-y-2 pl-5 text-sm leading-6 text-slate-700">
          {section.traits.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
      {section.contexts && section.contexts.length > 0 ? (
        <ul className="m-0 mt-4 flex list-none flex-wrap gap-2 p-0">
          {section.contexts.map((item) => (
            <li key={item} className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700">
              {item}
            </li>
          ))}
        </ul>
      ) : null}
      {section.checks && section.checks.length > 0 ? (
        <ul className="m-0 mt-4 grid gap-3 p-0">
          {section.checks.map((item) => (
            <li key={typeof item === "string" ? item : item.title} className="list-none rounded-lg border border-slate-100 bg-slate-50 p-3">
              {isChecklistItem(item) ? (
                <>
                  <p className="m-0 text-sm font-semibold text-slate-950">{item.title}</p>
                  {item.question ? <p className="m-0 mt-1 text-sm leading-6 text-slate-700">{item.question}</p> : null}
                  {item.note ? <p className="m-0 mt-1 text-xs leading-5 text-slate-600">{item.note}</p> : null}
                </>
              ) : (
                <p className="m-0 text-sm leading-6 text-slate-700">{item}</p>
              )}
            </li>
          ))}
        </ul>
      ) : null}
      {section.score ? <p className="m-0 mt-4 text-sm font-semibold text-slate-950">{section.score}</p> : null}
      {section.question ? <p className="m-0 mt-3 text-sm leading-7 text-slate-700">{section.question}</p> : null}
      {section.fermatView ? <p className="m-0 mt-3 text-sm leading-7 text-slate-700">{section.fermatView}</p> : null}
      {section.careerRisks && section.careerRisks.length > 0 ? (
        <ul className="m-0 mt-4 grid gap-2 pl-5 text-sm leading-6 text-slate-700 sm:grid-cols-2">
          {section.careerRisks.map((risk) => (
            <li key={risk}>{risk}</li>
          ))}
        </ul>
      ) : null}
      {section.steps && section.steps.length > 0 ? (
        <ol className="m-0 mt-4 space-y-4 pl-5 text-sm leading-6 text-slate-700">
          {section.steps.map((step) => (
            <li key={step.title}>
              <p className="m-0 font-semibold text-slate-950">{step.title}</p>
              <ul className="m-0 mt-2 space-y-1 pl-5">
                {step.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      ) : null}
      {section.caveat ? <p className="m-0 mt-4 text-sm leading-7 text-slate-600">{section.caveat}</p> : null}
      {section.warning ? <p className="m-0 mt-4 text-sm font-medium leading-7 text-amber-900">{section.warning}</p> : null}
      {section.note ? <p className="m-0 mt-4 text-sm leading-7 text-slate-600">{section.note}</p> : null}
      {section.cta ? (
        <div className="mt-4">
          {section.cta.prompt ? <p className="m-0 mb-2 text-sm text-slate-600">{section.cta.prompt}</p> : null}
          <Link
            href={section.cta.href}
            className="inline-flex min-h-10 items-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-50"
          >
            {section.cta.label}
          </Link>
        </div>
      ) : null}
    </section>
  );
}
