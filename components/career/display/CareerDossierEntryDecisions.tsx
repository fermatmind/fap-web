import { CareerEvidenceLine } from "@/components/career/display/CareerEvidenceLine";
import {
  careerContentV3ColumnCopy,
  careerContentV3ItemCopy,
  type CareerContentV3,
  type CareerContentV3Item,
} from "@/lib/career/contentV3";

const SUPPORTED_COPY_KEYS = new Set([
  "career.item.entry-role-comparison",
  "career.item.employer-evidence",
  "career.item.entry-portfolio",
  "career.item.interview-probation",
  "career.item.seven-day-trial",
  "career.item.seven-day-decision",
  "career.item.recruitment-sample",
  "career.item.credential-decision",
  "career.item.credential-boundary",
]);

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];
}

function rows(item: CareerContentV3Item): string[][] {
  return Array.isArray(item.data.rows)
    ? item.data.rows.filter((row): row is string[] => Array.isArray(row) && row.every((cell) => typeof cell === "string"))
    : [];
}

function entries(item: CareerContentV3Item): Array<{ id: string; values: string[] }> {
  return Array.isArray(item.data.entries)
    ? item.data.entries.flatMap((entry) => {
        if (!entry || typeof entry !== "object" || Array.isArray(entry)) return [];
        const record = entry as Record<string, unknown>;
        const values = stringArray(record.values);
        return typeof record.id === "string" && values.length > 0 ? [{ id: record.id, values }] : [];
      })
    : [];
}

function ItemTitle({ item, locale }: { item: CareerContentV3Item; locale: "zh" | "en" }) {
  const title = careerContentV3ItemCopy(item.copyKey, locale);
  return title ? <h4 className="m-0 text-lg font-bold text-[#172A60]">{title}</h4> : null;
}

function DecisionTable({ item, content }: { item: CareerContentV3Item; content: CareerContentV3 }) {
  const columns = stringArray(item.data.column_keys);
  const tableRows = rows(item);
  const labels = columns.map((column) => careerContentV3ColumnCopy(column, content.locale) ?? column);
  return (
    <>
      <div className="mt-4 hidden overflow-x-auto md:block">
        <table className="w-full table-fixed border-collapse text-left text-sm leading-6">
          <thead><tr>{labels.map((label) => <th key={label} scope="col" className="border border-[#DCE3F0] bg-[#EEF3FB] px-3 py-3 font-bold text-[#243B7A]">{label}</th>)}</tr></thead>
          <tbody>{tableRows.map((row, rowIndex) => <tr key={`${item.id}:${rowIndex}`}>{row.map((cell, cellIndex) => cellIndex === 0
            ? <th key={`${rowIndex}:${cellIndex}`} scope="row" className="border border-[#DCE3F0] bg-[#F8FAFD] px-3 py-3 align-top font-bold text-[#243B7A]">{cell}</th>
            : <td key={`${rowIndex}:${cellIndex}`} className="border border-[#DCE3F0] px-3 py-3 align-top text-[#465066]">{cell}</td>)}</tr>)}</tbody>
        </table>
      </div>
      <div className="mt-4 grid gap-3 md:hidden">
        {tableRows.map((row, rowIndex) => (
          <article key={`${item.id}:mobile:${rowIndex}`} className="min-w-0 rounded-xl border border-[#DCE3F0] bg-[#F8FAFD] p-4">
            {row.map((cell, cellIndex) => (
              <div key={`${rowIndex}:${cellIndex}`} className={cellIndex === 0 ? "font-bold text-[#243B7A]" : "mt-3"}>
                {cellIndex > 0 ? <p className="m-0 text-xs font-bold text-[#657087]">{labels[cellIndex]}</p> : null}
                <p className={`m-0 ${cellIndex > 0 ? "mt-1 text-sm leading-6 text-[#465066]" : ""}`}>{cell}</p>
              </div>
            ))}
          </article>
        ))}
      </div>
      <CareerEvidenceLine content={content} factRefs={item.factRefs} sourceRefs={item.sourceRefs} />
    </>
  );
}

function DecisionCards({ item, content }: { item: CareerContentV3Item; content: CareerContentV3 }) {
  const values = entries(item);
  const ordered = item.type === "timeline";
  const Wrapper = ordered ? "ol" : "div";
  return (
    <>
      <Wrapper className={`mt-4 grid list-none gap-3 p-0 ${ordered ? "md:grid-cols-7" : "md:grid-cols-2"}`}>
        {values.map((entry, index) => {
          const Tag = ordered ? "li" : "article";
          return (
            <Tag key={entry.id} className="min-w-0 rounded-xl border border-[#DCE3F0] bg-[#F8FAFD] p-4">
              {ordered ? <span className="text-xs font-extrabold text-[#0E9F94]">{String(index + 1).padStart(2, "0")}</span> : null}
              <h4 className="m-0 mt-1 text-sm font-bold text-[#243B7A]">{entry.values[0]}</h4>
              {entry.values.slice(1).map((value, valueIndex) => <p key={`${entry.id}:${valueIndex}`} className="m-0 mt-2 text-sm leading-6 text-[#465066]">{value}</p>)}
            </Tag>
          );
        })}
      </Wrapper>
      <CareerEvidenceLine content={content} factRefs={item.factRefs} sourceRefs={item.sourceRefs} />
    </>
  );
}

function DecisionText({ item, content }: { item: CareerContentV3Item; content: CareerContentV3 }) {
  const values = item.type === "list" ? stringArray(item.data.entries) : stringArray(item.data.paragraphs);
  if (item.type === "notice") {
    return <><aside className="mt-4 rounded-xl border-l-4 border-[#E8920C] bg-[#FFF6E9] px-5 py-4 text-sm leading-7 text-[#5A4930]">{values.map((value) => <p className="m-0" key={value}>{value}</p>)}</aside><CareerEvidenceLine content={content} factRefs={item.factRefs} sourceRefs={item.sourceRefs} /></>;
  }
  return <><ul className="mt-4 grid gap-2 pl-5 text-sm leading-7 text-[#465066]">{values.map((value) => <li key={value}>{value}</li>)}</ul><CareerEvidenceLine content={content} factRefs={item.factRefs} sourceRefs={item.sourceRefs} /></>;
}

export function careerEntryDecisionItems(items: readonly CareerContentV3Item[]): CareerContentV3Item[] {
  return items.filter((item) => item.availability === "available" && SUPPORTED_COPY_KEYS.has(item.copyKey));
}

export function CareerDossierEntryDecisions({ items, content }: { items: readonly CareerContentV3Item[]; content: CareerContentV3 }) {
  const visibleItems = careerEntryDecisionItems(items);
  if (visibleItems.length === 0) return null;
  const heading = content.locale === "zh"
    ? "应届生／转行者如何验证并入门"
    : "How graduates and career changers can validate and enter";
  return (
    <div className="mt-8 border-t border-[#E5E9F2] pt-7" data-testid="career-entry-decisions">
      <h3 className="m-0 text-xl font-bold text-[#172A60]">{heading}</h3>
      <div className="mt-5 space-y-8">
        {visibleItems.map((item) => (
          <section key={item.id} aria-labelledby={`${item.id}-title`} className="min-w-0">
            <div id={`${item.id}-title`}><ItemTitle item={item} locale={content.locale} /></div>
            {item.type === "table" || item.type === "matrix" ? <DecisionTable item={item} content={content} />
              : item.type === "cards" || item.type === "timeline" ? <DecisionCards item={item} content={content} />
                : <DecisionText item={item} content={content} />}
          </section>
        ))}
      </div>
    </div>
  );
}
