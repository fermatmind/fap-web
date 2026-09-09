import {careerEvidenceLabel} from "@/lib/career/evidenceLabels";
import Link from 'next/link';
import { careerContentV3UiCopy, type CareerContentV3Item, type CareerContentV3 } from '@/lib/career/contentV3';
import type { Locale } from '@/lib/i18n/locales';

export function CareerPagePlaceholder({locale, data = false}: {locale: Locale; data?: boolean}) {
  return <p data-nosnippet="true" className="rounded-xl border border-dashed border-[#C7CFDF] bg-[#F7F9FC] px-5 py-4 text-sm text-[#5B6678]">{locale === 'zh' ? (data ? '数据待补充' : '内容待补充') : (data ? 'Data pending' : 'Content pending')}</p>;
}

export function CareerPageItem({ item, content }: { item: CareerContentV3Item; content: CareerContentV3 }) {
  const locale = content.locale;
  const copy = careerContentV3UiCopy(locale);
  if (item.availability === "missing") return <CareerPagePlaceholder locale={locale} />;

  if (item.type === "prose" || item.type === "notice") {
    return (
      <div className="space-y-3 text-[15px] leading-7 text-[#2A3346]">
        {(item.data.paragraphs as string[]).map((paragraph, index) => <p className="m-0" key={`${item.id}-${index}`}>{paragraph}</p>)}
      </div>
    );
  }
  if (item.type === "list") {
    return <ul className="m-0 space-y-2 pl-5 text-[15px] leading-7 text-[#2A3346]">{(item.data.entries as string[]).map((entry, index) => <li key={`${item.id}-${index}`}>{entry}</li>)}</ul>;
  }
  if (item.type === "cards" || item.type === "timeline") {
    return <div className="grid gap-3 md:grid-cols-2">{(item.data.entries as Array<{ id: string; values: string[]; title?: string | null }>).map((entry) => (
      <article className="rounded-xl border border-[#E5E9F2] bg-[#F7F9FC] p-4" key={entry.id}>
        <h4 className="m-0 text-base font-bold text-[#1A2233]">{entry.title ?? (locale === "zh" ? "内容待补充" : "Content pending")}</h4>
        {entry.values.map((value, index) => <p className="m-0 mt-2 text-sm leading-6 text-[#3A4255]" key={`${entry.id}-${index}`}>{value}</p>)}
      </article>
    ))}</div>;
  }
  if (item.type === "faq") {
    return <div className="space-y-3">{(item.data.entries as Array<{ id: string; question_key: string; question?: string | null; answer: string }>).map((entry) => (
      <details key={entry.id} className="group rounded-xl border border-[#E5E9F2] bg-white px-4">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between py-4 font-bold text-[#1A2233] after:text-xl after:font-normal after:text-[#2C3E8C] after:content-['+'] group-open:after:content-['−']">
          {entry.question ?? (locale === "zh" ? "问题待补充" : "Question pending")}
        </summary>
        <p className="m-0 pb-4 text-sm leading-7 text-[#2A3346]">{entry.answer}</p>
      </details>
    ))}</div>;
  }
  if (item.type === "links") {
    return <ul className="m-0 grid gap-2 p-0 sm:grid-cols-2">{(item.data.entries as Array<{ id: string; entity: string; url: string }>).map((entry) => (
      <li className="list-none" key={entry.id}>{entry.url.startsWith("#") ? (
        <a className="inline-flex min-h-11 items-center font-semibold text-[#2C3E8C]" href={entry.url}>{entry.entity}<span className="ml-1" aria-hidden="true">→</span></a>
      ) : entry.url.startsWith("/") ? (
        <Link className="inline-flex min-h-11 items-center font-semibold text-[#2C3E8C]" href={entry.url}>{entry.entity}<span className="ml-1" aria-hidden="true">→</span></Link>
      ) : (
        <a className="inline-flex min-h-11 items-center font-semibold text-[#2C3E8C]" href={entry.url} target="_blank" rel="noreferrer" aria-label={`${entry.entity} (${copy.externalLink})`}>{entry.entity}<span className="ml-1" aria-hidden="true">↗</span></a>
      )}</li>
    ))}</ul>;
  }
  if (item.type === "sources") {
    return <ul className="m-0 space-y-2 p-0">{(item.data.entries as Array<{ id: string; name: string; url: string | null; details?: string[]; publisher?: string; market?: string; period?: string; evidence_type?: string; scope?: string; limitation?: string; accessed_at?: string }>).map((entry) => (
      <li className="list-none text-sm leading-6" key={entry.id}>{entry.url ? <a className="font-semibold text-[#2C3E8C]" href={entry.url} target="_blank" rel="noreferrer" aria-label={`${entry.name} (${copy.externalLink})`}>{entry.name}<span className="ml-1" aria-hidden="true">↗</span></a> : <span>{entry.name}</span>}
        {[...(entry.details ?? []), entry.publisher, entry.market, entry.period, careerEvidenceLabel(entry.evidence_type, locale), careerEvidenceLabel(entry.scope, locale), entry.limitation, entry.accessed_at].filter(Boolean).map((detail, i) => <p className="m-0 mt-1 text-[#5B6678]" key={i}>{detail}</p>)}
      </li>
    ))}</ul>;
  }
  if (item.type === "metrics") {
    return <dl className="grid gap-3 sm:grid-cols-2">{(item.data.entries as Array<{ key: string; value: string; label?: string | null }>).map((entry, index) => (
      <div className="rounded-xl border border-[#E5E9F2] bg-[#F7F9FC] p-4" key={`${entry.key}-${index}`}>
        <dt className="font-bold text-[#1A2233]">{entry.label ?? (locale === "zh" ? "数据待补充" : "Data pending")}</dt>
        <dd className="m-0 mt-1 text-sm leading-6 text-[#3A4255]">{entry.value}</dd>
      </div>
    ))}</dl>;
  }

  const columns = item.data.column_keys as string[];
  const rows = item.data.rows as string[][];
  return (
    <div className="max-w-full overflow-x-auto rounded-xl border border-[#E5E9F2]" tabIndex={0} role="region" aria-label={item.title ?? (locale === "zh" ? "数据表格" : "Data table")}>
      <table className="w-full min-w-[560px] border-collapse text-left text-sm">
        <thead className="bg-[#F0F3FA]"><tr>{columns.map((column, index) => <th className="px-4 py-3 font-bold text-[#1A2233]" key={column} scope="col">{(item.data.column_labels as string[] | undefined)?.[index] ?? copy.fieldLabel(index)}</th>)}</tr></thead>
        <tbody>{rows.map((row, rowIndex) => <tr className="border-t border-[#E5E9F2]" key={rowIndex}>{row.map((cell, cellIndex) => <td className="px-4 py-3 align-top leading-6 text-[#2A3346]" key={cellIndex}>{cell}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}
