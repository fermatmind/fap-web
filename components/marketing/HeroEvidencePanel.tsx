import type { Locale } from "@/lib/i18n/locales";

const COPY = {
  en: {
    panelLabel: "Assessment preview",
    panelTitle: "From responses to decision-ready structure",
    panelMeta: "For orientation only before you start",
    facetTitle: "30-facet structure",
    facetNote:
      "Facet-level readings stay visible so interpretation can be discussed and reviewed, not reduced to one label.",
    normTitle: "Norm-referenced context",
    normPrimary: "Percentile context",
    normPrimaryValue: "P68",
    normSecondary: "Interpretation mode",
    normSecondaryValue: "Relative, not absolute",
    scenarioTitle: "Decision scenarios",
    scenarioItems: ["Learning direction", "Career planning", "Collaboration style"],
  },
  zh: {
    panelLabel: "结果预览",
    panelTitle: "从答题到可落地的判断结构",
    panelMeta: "用于开始前的结构化理解",
    facetTitle: "30 个分面结构",
    facetNote: "分面级读数保持可见，便于讨论与复盘，而不是被压缩成单一标签。",
    normTitle: "常模参照语境",
    normPrimary: "百分位语境",
    normPrimaryValue: "P68",
    normSecondary: "解释方式",
    normSecondaryValue: "相对解释，不作绝对定性",
    scenarioTitle: "常见决策场景",
    scenarioItems: ["学习方向", "职业规划", "协作风格"],
  },
} as const;

function buildFacetId(index: number): string {
  return `F${String(index).padStart(2, "0")}`;
}

const ACTIVE_FACETS = new Set([3, 7, 12, 18, 24, 27]);

export function HeroEvidencePanel({ locale }: { locale: Locale }) {
  const copy = COPY[locale];

  return (
    <div className="w-full rounded-[14px] border border-white/15 bg-[#101722] p-4 shadow-[0_20px_48px_rgba(5,9,16,0.42)] md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-3">
        <div className="space-y-1">
          <p className="m-0 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/58">{copy.panelLabel}</p>
          <p className="m-0 text-lg font-semibold tracking-[-0.02em] text-white/93 md:text-[1.3rem]">{copy.panelTitle}</p>
        </div>
        <p className="m-0 text-xs text-slate-300/75">{copy.panelMeta}</p>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.26fr_0.74fr]">
        <section className="rounded-[10px] border border-white/10 bg-white/[0.03] p-3.5 md:p-4">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-white/62">{copy.facetTitle}</p>
          <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6">
            {Array.from({ length: 30 }, (_, idx) => {
              const id = buildFacetId(idx + 1);
              const isActive = ACTIVE_FACETS.has(idx + 1);

              return (
                <span
                  key={id}
                  data-testid={`home-engine-node-${id}`}
                  className={`inline-flex h-8 items-center justify-center rounded-[8px] border text-[0.65rem] font-medium tracking-[0.06em] ${isActive
                    ? "border-[#85a9ca]/70 bg-[#6f8eac]/24 text-white"
                    : "border-white/12 bg-white/[0.02] text-white/74"
                    }`}
                >
                  {id}
                </span>
              );
            })}
          </div>
          <p className="m-0 mt-3 text-sm leading-7 text-slate-200/80">{copy.facetNote}</p>
        </section>

        <div className="grid gap-4">
          <section className="rounded-[10px] border border-white/10 bg-white/[0.03] p-3.5 md:p-4">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-white/62">{copy.normTitle}</p>
            <div className="mt-3 grid gap-2">
              <div className="rounded-md border border-white/10 bg-black/10 px-3 py-2.5">
                <p className="m-0 text-xs uppercase tracking-[0.12em] text-slate-300/80">{copy.normPrimary}</p>
                <p className="m-0 mt-1 text-base font-semibold text-white/92">{copy.normPrimaryValue}</p>
              </div>
              <div className="rounded-md border border-white/10 bg-black/10 px-3 py-2.5">
                <p className="m-0 text-xs uppercase tracking-[0.12em] text-slate-300/80">{copy.normSecondary}</p>
                <p className="m-0 mt-1 text-sm font-medium text-white/86">{copy.normSecondaryValue}</p>
              </div>
            </div>
          </section>

          <section className="rounded-[10px] border border-white/10 bg-white/[0.03] p-3.5 md:p-4">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-white/62">{copy.scenarioTitle}</p>
            <ul className="m-0 mt-3 list-none space-y-2 p-0 text-sm leading-6 text-slate-200/85">
              {copy.scenarioItems.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-[0.4rem] h-1.5 w-1.5 rounded-full bg-[#9db5cd]" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
