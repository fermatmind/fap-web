import { MarkdownBlockRenderer } from "@/components/clinical/report/MarkdownBlockRenderer";
import { CrisisOverlay } from "@/components/clinical/report/CrisisOverlay";
import type { Big5ReportSection } from "@/lib/api/v0_3";

function normalizeBlocks(section: Big5ReportSection) {
  if (!Array.isArray(section.blocks)) return [];
  return section.blocks;
}

export function ReportSectionRenderer({
  locale,
  section,
  locked,
}: {
  locale: "en" | "zh";
  section: Big5ReportSection;
  locked: boolean;
}) {
  const key = typeof section.key === "string" ? section.key.trim() : "";
  const title = typeof section.title === "string" && section.title.trim().length > 0
    ? section.title.trim()
    : key || "section";
  const accessLevel = String(section.access_level ?? "free").trim().toLowerCase();
  const blocks = normalizeBlocks(section);

  if (locked && accessLevel === "paid") {
    return (
      <section data-section-key={key || "unknown"} className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="m-0 text-lg font-semibold text-slate-900">{title}</h3>
        <p className="m-0 text-sm text-slate-600">
          {locale === "zh" ? "解锁后可查看该章节。" : "Unlock to view this section."}
        </p>
      </section>
    );
  }

  if (key === "crisis_banner") {
    const resources = Array.isArray(section.resources)
      ? section.resources.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
      : [];
    const reasons = Array.isArray(section.reasons)
      ? section.reasons.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      : [];

    return (
      <section data-section-key={key || "unknown"} className="space-y-3">
        <h3 className="m-0 text-lg font-semibold text-slate-900">{title}</h3>
        <CrisisOverlay locale={locale} resources={resources} reasons={reasons} />
        {blocks.length > 0 ? (
          <div className="space-y-2">
            {blocks.map((block, index) => (
              <MarkdownBlockRenderer key={`${key}-block-${index}`} block={block} />
            ))}
          </div>
        ) : null}
      </section>
    );
  }

  return (
    <section data-section-key={key || "unknown"} className="space-y-3">
      <h3 className="m-0 text-lg font-semibold text-slate-900">{title}</h3>
      <div className="space-y-2">
        {blocks.map((block, index) => (
          <MarkdownBlockRenderer key={`${key}-block-${index}`} block={block} />
        ))}
      </div>
    </section>
  );
}
