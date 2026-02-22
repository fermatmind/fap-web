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
      <section
        data-section-key={key || "unknown"}
        className="relative overflow-hidden rounded-2xl border border-[var(--fm-border)] bg-white/75 p-4 backdrop-blur-md"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-white/50 to-slate-100/70" aria-hidden />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--fm-border-strong)] bg-white/90 px-2 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-text-muted)]">
            <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 text-[var(--fm-accent)]" fill="currentColor" aria-hidden>
              <path d="M6 8V6a4 4 0 1 1 8 0v2h1a1 1 0 0 1 1 1v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a1 1 0 0 1 1-1h1Zm2 0h4V6a2 2 0 1 0-4 0v2Z" />
            </svg>
            {locale === "zh" ? "已锁定" : "Locked"}
          </div>
          <h3 className="m-0 text-lg font-semibold text-[var(--fm-text)]">{title}</h3>
          <p className="m-0 text-sm text-[var(--fm-text-muted)]">
            {locale === "zh" ? "解锁后可查看该章节。" : "Unlock to view this section."}
          </p>
        </div>
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
