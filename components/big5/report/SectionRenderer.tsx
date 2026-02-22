import { BlockRenderer } from "@/components/big5/report/BlockRenderer";
import { LockedBlock } from "@/components/big5/report/LockedBlock";

type Section = {
  key?: string;
  title?: string;
  access_level?: string;
  blocks?: Array<Record<string, unknown>>;
  [key: string]: unknown;
};

export function SectionRenderer({
  section,
  locked,
  normsStatus,
  ctaLabel,
}: {
  section: Section;
  locked: boolean;
  normsStatus?: string;
  ctaLabel?: string;
}) {
  const key = section.key ?? "unknown";
  const title = section.title ?? key;
  const accessLevel = (section.access_level ?? "free").toString().toLowerCase();
  const isPaidSection = accessLevel === "paid";
  const blocks = Array.isArray(section.blocks) ? section.blocks : [];

  if (locked && isPaidSection) {
    return (
      <section className="space-y-2">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <LockedBlock title={title} ctaLabel={ctaLabel} />
      </section>
    );
  }

  if (normsStatus === "MISSING" && (key === "domains_overview" || key === "facet_table")) {
    return (
      <section className="space-y-2">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          Percentile views are temporarily unavailable because current norms status is MISSING.
        </div>
        <div className="space-y-2">
          {blocks.map((block, idx) => (
            <BlockRenderer key={`${key}-${idx}`} block={block} sectionKey={key} normsStatus={normsStatus} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-2">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <div className="space-y-2">
        {blocks.map((block, idx) => (
          <BlockRenderer key={`${key}-${idx}`} block={block} sectionKey={key} normsStatus={normsStatus} />
        ))}
      </div>
    </section>
  );
}
