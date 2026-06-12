import { BlockRenderer } from "@/components/big5/report/BlockRenderer";
import { LockedBlock } from "@/components/big5/report/LockedBlock";
import { BIG5_V1_STATE_MICROCOPY } from "@/lib/big5/microcopy";

type Section = {
  key?: string;
  title?: string;
  subtitle?: string;
  order?: number;
  page_slot?: string;
  access_level?: string;
  locked_preview_policy?: string;
  locked_preview_description?: string;
  locked_preview_cta?: string;
  blocks?: Array<Record<string, unknown>>;
  [key: string]: unknown;
};

const INTERNAL_DEBUG_PATTERNS = [
  /\bAttemptReadController\b/gi,
  /\bBig Five Report Engine v\d+(?:\s+registry)?\b/gi,
  /\bReport Engine v\d+\b/gi,
  /\bPR(?:1|2|3A|3B)\b/g,
];

function stripInternalDebugText(value: unknown): string {
  if (typeof value !== "string") return "";

  let text = value.trim();
  for (const pattern of INTERNAL_DEBUG_PATTERNS) {
    text = text.replace(pattern, "");
  }

  const cleaned = text.replace(/\s{2,}/g, " ").replace(/^[\s:;|,-]+|[\s:;|,-]+$/g, "").trim();
  return /^[.]+$/.test(cleaned) ? "" : cleaned;
}

function formatSectionKicker(section: Section, locale: "en" | "zh"): string {
  const orderValue = Number(section.order);
  const pageSlot = String(section.page_slot ?? "").trim();
  const parts: string[] = [];

  if (Number.isFinite(orderValue) && orderValue > 0) {
    parts.push(locale === "zh" ? `第 ${orderValue} 节` : `Step ${orderValue}`);
  }

  if (pageSlot) {
    const normalized = pageSlot.replace(/^page_/i, "");
    if (normalized) {
      parts.push(locale === "zh" ? `第 ${normalized} 页` : `Page ${normalized}`);
    }
  }

  return parts.join(" · ");
}

function getSectionAnchorId(sectionKey: string): string {
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
  const key = section.key ?? "unknown";
  const title = stripInternalDebugText(section.title) || (locale === "zh" ? "报告部分" : "Report section");
  const sectionId = getSectionAnchorId(key);
  const isBigFive = scaleCode === "BIG5_OCEAN";
  const sectionShellClassName = isBigFive
    ? "scroll-mt-28 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    : "space-y-2";
  const headerClassName = isBigFive ? "border-l-4 border-sky-300 pl-4" : "";
  const accessLevel = (section.access_level ?? "free").toString().toLowerCase();
  const isPaidSection = accessLevel === "paid";
  const blocks = Array.isArray(section.blocks) ? section.blocks : [];
  const subtitle = stripInternalDebugText(section.subtitle);
  const kicker = formatSectionKicker(section, locale);
  const lockedPreviewPolicy = String(section.locked_preview_policy ?? "none").trim().toLowerCase();
  const previewBlocks =
    lockedPreviewPolicy === "teaser_card"
      ? blocks.slice(0, 1)
      : lockedPreviewPolicy === "mask_and_cta"
        ? blocks.slice(0, 2)
        : [];

  const intent = scaleCode === "SDS_20" || scaleCode === "CLINICAL_COMBO_68" ? "clinical" : "personality";

  if (locked && isPaidSection) {
    return (
      <section id={sectionId} data-testid={isBigFive ? sectionId : undefined} className={sectionShellClassName}>
        <div className={headerClassName}>
          {kicker ? <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{kicker}</p> : null}
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          {subtitle ? <p className="m-0 text-sm text-slate-600">{subtitle}</p> : null}
        </div>
        {previewBlocks.length > 0 ? (
          <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            {previewBlocks.map((block, idx) => (
              <div key={`${key}-preview-${idx}`} className="opacity-70">
                <BlockRenderer block={block} sectionKey={key} normsStatus={normsStatus} />
              </div>
            ))}
          </div>
        ) : null}
        <LockedBlock
          title={title}
          ctaLabel={stripInternalDebugText(section.locked_preview_cta) || ctaLabel}
          description={stripInternalDebugText(section.locked_preview_description) || undefined}
          locale={locale}
          intent={intent}
        />
      </section>
    );
  }

  if (normsStatus === "MISSING" && (key === "domains_overview" || key === "facet_table" || key === "facet_details")) {
    return (
      <section id={sectionId} data-testid={isBigFive ? sectionId : undefined} className={sectionShellClassName}>
        <div className={headerClassName}>
          {kicker ? <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{kicker}</p> : null}
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          {subtitle ? <p className="m-0 text-sm text-slate-600">{subtitle}</p> : null}
        </div>
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          {BIG5_V1_STATE_MICROCOPY.norms.missing}
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
    <section id={sectionId} data-testid={isBigFive ? sectionId : undefined} className={sectionShellClassName}>
      <div className={headerClassName}>
        {kicker ? <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{kicker}</p> : null}
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {subtitle ? <p className="m-0 text-sm text-slate-600">{subtitle}</p> : null}
      </div>
      <div className="space-y-2">
        {blocks.map((block, idx) => (
          <BlockRenderer key={`${key}-${idx}`} block={block} sectionKey={key} normsStatus={normsStatus} />
        ))}
      </div>
      {isBigFive ? (
        <a href="#big5-on-this-page" className="inline-flex text-sm font-medium text-sky-700 hover:text-sky-900">
          {locale === "zh" ? "回到目录" : "Back to contents"}
        </a>
      ) : null}
    </section>
  );
}
