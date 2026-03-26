import { cn } from "@/lib/utils";

type HeroAnimatedVisualProps = {
  chips: string[];
  localeLabel: "zh" | "en";
  className?: string;
};

const VISUAL_COPY = {
  en: {
    label: "Structured assessment workspace",
    surfaceTitle: "Assessment Workspace",
    reportTitle: "Structured Report",
    reportSubtitle: "Personality / Career / Capability",
    readinessLabel: "Decision-ready",
    confidenceLabel: "Interpretation confidence",
    confidenceValue: "92%",
    evidenceTitle: "Evidence trace",
    evidenceItems: ["Facet-level scoring", "Norm-referenced reading", "Action summary"],
    actionTitle: "Recommended next focus",
    actionLine: "Validate role-fit assumptions before the next career decision.",
    radarTitle: "Signal profile",
    radarLegend: ["Personality", "Capability", "Career"],
    railCards: [
      { title: "Interpretation", value: "Explainable", note: "Dimension-based narrative" },
      { title: "Output", value: "Actionable", note: "Immediate discussion points" },
      { title: "Review", value: "Traceable", note: "Reusable result history" },
    ],
    metricLabels: ["Pattern fit", "Career direction", "Capability signal"],
  },
  zh: {
    label: "结构化测评工作台",
    surfaceTitle: "测评工作台",
    reportTitle: "结构化结果报告",
    reportSubtitle: "人格 / 职业 / 能力",
    readinessLabel: "可用于决策",
    confidenceLabel: "解释可信度",
    confidenceValue: "92%",
    evidenceTitle: "证据链路",
    evidenceItems: ["分面评分", "常模参照", "行动摘要"],
    actionTitle: "建议优先关注",
    actionLine: "在下一次职业决策前，先校准角色匹配假设。",
    radarTitle: "结果信号图",
    radarLegend: ["人格", "能力", "职业"],
    railCards: [
      { title: "Interpretation", value: "可解释", note: "回到维度与行为线索" },
      { title: "Output", value: "可行动", note: "直接进入下一步判断" },
      { title: "Review", value: "可复盘", note: "结果可持续回看" },
    ],
    metricLabels: ["模式匹配", "职业方向", "能力信号"],
  },
} as const;

function RadarChart({ localeLabel }: { localeLabel: "zh" | "en" }) {
  const copy = VISUAL_COPY[localeLabel];

  return (
    <svg viewBox="0 0 220 180" className="h-auto w-full" aria-hidden>
      <defs>
        <linearGradient id="fm-home-radar-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(21,63,131,0.26)" />
          <stop offset="100%" stopColor="rgba(13,148,136,0.18)" />
        </linearGradient>
      </defs>
      <g stroke="#d2dce9" strokeWidth="1">
        <polygon points="110,18 182,60 158,144 62,144 38,60" fill="none" />
        <polygon points="110,42 160,70 142,128 78,128 60,70" fill="none" />
        <polygon points="110,64 142,82 130,116 90,116 78,82" fill="none" />
      </g>
      <g stroke="#bcc8d7" strokeWidth="1">
        <line x1="110" y1="18" x2="110" y2="144" />
        <line x1="38" y1="60" x2="158" y2="144" />
        <line x1="182" y1="60" x2="62" y2="144" />
      </g>
      <polygon
        points="110,34 168,68 140,132 86,118 62,72"
        fill="url(#fm-home-radar-fill)"
        stroke="#153f83"
        strokeWidth="2"
      />
      <g fill="#153f83">
        <circle cx="110" cy="34" r="3.5" />
        <circle cx="168" cy="68" r="3.5" />
        <circle cx="140" cy="132" r="3.5" />
        <circle cx="86" cy="118" r="3.5" />
        <circle cx="62" cy="72" r="3.5" />
      </g>
      <g fill="#4f6285" fontSize="11" fontWeight="600">
        <text x="110" y="12" textAnchor="middle">
          {copy.radarLegend[0]}
        </text>
        <text x="196" y="64" textAnchor="end">
          {copy.radarLegend[1]}
        </text>
        <text x="110" y="164" textAnchor="middle">
          {copy.radarLegend[2]}
        </text>
      </g>
    </svg>
  );
}

export function HeroAnimatedVisual({ chips, localeLabel, className }: HeroAnimatedVisualProps) {
  const copy = VISUAL_COPY[localeLabel];

  return (
    <div className={cn("relative mx-auto w-full max-w-[38rem]", className)}>
      <div aria-hidden className="fm-home-hero-orbit fm-home-hero-orbit-left" />
      <div aria-hidden className="fm-home-hero-orbit fm-home-hero-orbit-right" />

      <div
        role="img"
        aria-label={copy.label}
        className="fm-home-hero-surface relative overflow-hidden rounded-[2rem] border border-white/75 bg-white/86 p-4 shadow-[0_28px_80px_rgba(16,35,64,0.18)] backdrop-blur-xl md:p-5"
      >
        <div className="fm-home-hero-surface-inner relative overflow-hidden rounded-[1.65rem] border border-[#d8e1ec] bg-[linear-gradient(180deg,rgba(248,251,255,0.98)_0%,rgba(239,245,252,0.92)_100%)] px-4 py-4 md:px-5 md:py-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d9e2ed] pb-4">
            <div className="space-y-1">
              <p className="m-0 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#5d718f]">
                {copy.surfaceTitle}
              </p>
              <p className="m-0 text-sm font-semibold text-[var(--fm-trust-blue-strong)]">{copy.reportTitle}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {chips.slice(0, 3).map((chip, index) => (
                <span
                  key={`${chip}-${index}`}
                  className="rounded-full border border-[#d2dce8] bg-white/85 px-3 py-1 text-[0.68rem] font-semibold tracking-[0.08em] text-[#45607f]"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.08fr)_minmax(15rem,0.92fr)]">
            <div className="space-y-4">
              <div className="rounded-[1.35rem] border border-[#d7e1ec] bg-white/92 p-4 shadow-[0_12px_30px_rgba(19,41,71,0.08)]">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="m-0 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#70839d]">
                      {copy.reportSubtitle}
                    </p>
                    <h3 className="m-0 text-lg font-semibold tracking-[-0.03em] text-[var(--fm-trust-blue-strong)]">
                      {copy.readinessLabel}
                    </h3>
                  </div>
                  <div className="rounded-[1rem] border border-[#dce5ee] bg-[#f6f9fc] px-3 py-2 text-right">
                    <p className="m-0 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#70839d]">
                      {copy.confidenceLabel}
                    </p>
                    <p className="m-0 mt-1 text-xl font-semibold tracking-[-0.04em] text-[var(--fm-trust-blue-strong)]">
                      {copy.confidenceValue}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_11rem] sm:items-center">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      {copy.metricLabels.map((label, index) => (
                        <div key={label} className="grid grid-cols-[7rem_minmax(0,1fr)_2.4rem] items-center gap-3 text-sm">
                          <span className="text-[#4f6285]">{label}</span>
                          <span className="h-2 rounded-full bg-[#e6edf4]">
                            <span
                              className="block h-full rounded-full bg-[linear-gradient(90deg,#153f83_0%,#1f7ca6_100%)]"
                              style={{ width: `${[86, 79, 73][index]}%` }}
                            />
                          </span>
                          <span className="text-right font-semibold text-[var(--fm-trust-blue-strong)]">
                            {[86, 79, 73][index]}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-[1rem] border border-[#e1e7ef] bg-[#f8fbfd] px-3 py-3">
                      <p className="m-0 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#70839d]">
                        {copy.actionTitle}
                      </p>
                      <p className="m-0 mt-2 text-sm leading-6 text-[#304865]">{copy.actionLine}</p>
                    </div>
                  </div>

                  <div className="rounded-[1.15rem] border border-[#dce4ee] bg-[#fbfdff] px-3 py-3">
                    <p className="m-0 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#70839d]">
                      {copy.radarTitle}
                    </p>
                    <div className="mt-2">
                      <RadarChart localeLabel={localeLabel} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.25rem] border border-[#d9e2ec] bg-[#f8fbfd] px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="m-0 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#70839d]">
                    {copy.evidenceTitle}
                  </p>
                  <span className="h-px flex-1 bg-[#d8e0ea]" />
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {copy.evidenceItems.map((item) => (
                    <div
                      key={item}
                      className="rounded-[1rem] border border-[#dde5ee] bg-white px-3 py-3 text-sm font-medium text-[#304865]"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {copy.railCards.map((card, index) => (
                <div
                  key={card.title}
                  className="rounded-[1.2rem] border border-[#dae3ed] bg-white/92 px-4 py-4 shadow-[0_10px_24px_rgba(19,41,71,0.06)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="m-0 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#70839d]">
                      {card.title}
                    </p>
                    <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#153f83]" />
                  </div>
                  <p className="m-0 mt-3 text-[1.05rem] font-semibold tracking-[-0.03em] text-[var(--fm-trust-blue-strong)]">
                    {card.value}
                  </p>
                  <p className="m-0 mt-2 text-sm leading-6 text-[#4f6285]">{card.note}</p>
                  <div className="mt-4 h-1.5 rounded-full bg-[#e6edf4]">
                    <span
                      className="block h-full rounded-full bg-[linear-gradient(90deg,#153f83_0%,#0d9488_100%)]"
                      style={{ width: `${[86, 81, 77][index]}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
