import { BlockRenderer } from "@/components/big5/report/BlockRenderer";
import { LockedBlock } from "@/components/big5/report/LockedBlock";

type Section = {
  key?: string;
  title?: string;
  subtitle?: string;
  access_level?: string;
  locked_preview_description?: string;
  locked_preview_cta?: string;
  blocks?: Array<Record<string, unknown>>;
  [key: string]: unknown;
};

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function anchorId(sectionKey: string): string {
  const normalized = sectionKey.replace(/[^a-z0-9_-]+/gi, "-").toLowerCase();
  return `big5-section-${normalized || "section"}`;
}

export function SectionRenderer({
  section,
  locked,
  normsStatus,
  ctaLabel,
  locale = "en",
  scaleCode,
}: {
  section: Section;
  locked: boolean;
  normsStatus?: string;
  ctaLabel?: string;
  locale?: "en" | "zh";
  scaleCode?: string;
}) {
  const key = text(section.key) || "section";
  const title = text(section.title) || key;
  const isBigFive = scaleCode === "BIG5_OCEAN";
  const shellClass = isBigFive
    ? "scroll-mt-28 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    : "space-y-2";
  const blocks = Array.isArray(section.blocks) ? section.blocks : [];

  if (locked) {
    return (
      <section id={anchorId(key)} data-testid={isBigFive ? anchorId(key) : undefined} className={shellClass}>
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <LockedBlock
          title={title}
          ctaLabel={text(section.locked_preview_cta) || ctaLabel}
          description={text(section.locked_preview_description) || undefined}
          locale={locale}
          intent="personality"
        />
      </section>
    );
  }

  return (
    <section id={anchorId(key)} data-testid={isBigFive ? anchorId(key) : undefined} className={shellClass}>
      <div className={isBigFive ? "border-l-4 border-sky-300 pl-4" : ""}>
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {text(section.subtitle) ? <p className="m-0 text-sm text-slate-600">{text(section.subtitle)}</p> : null}
      </div>
      <div className="space-y-2">
        {blocks.map((block, index) => (
          <BlockRenderer key={`${key}-${text(block.id) || index}`} block={block} sectionKey={key} normsStatus={normsStatus} locale={locale} />
        ))}
      </div>
    </section>
  );
}
