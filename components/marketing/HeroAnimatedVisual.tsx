import { cn } from "@/lib/utils";

type HeroAnimatedVisualProps = {
  localeLabel: "zh" | "en";
  className?: string;
};

const COPY = {
  en: {
    ariaLabel: "Structured cognitive engine panel",
    panelLabel: "Cognitive Engine Panel",
    panelVersion: "Protocol v5.1",
    panelNote: "From noise to clarity",
    modules: {
      matrix: "30-Facet Matrix",
      norm: "Norm Position",
      scenario: "Scenario Output",
      action: "Action Coordinates",
    },
    notes: {
      matrix: "Facet clusters calibrated across five trait domains.",
      norm: "Norm-referenced reading against 100,000+ observations.",
      scenario: "Scenario fit ranked by immediate decision relevance.",
      action: "Action coordinates distilled into next-step hypotheses.",
    },
    scenarioItems: [
      { name: "Partner fit", score: "0.82", status: "stable" },
      { name: "Career pivot", score: "0.74", status: "watch" },
      { name: "Pressure load", score: "0.39", status: "monitor" },
    ],
    actionRows: [
      { label: "Communication cadence", value: 84, code: "A1" },
      { label: "Role-fit hypothesis", value: 76, code: "B4" },
      { label: "Stress recovery protocol", value: 63, code: "C2" },
    ],
    matrixLegend: "30 / 30 facets calibrated",
    normPercentile: "71st percentile",
    normScore: "Z +0.64",
    footerLeft: "Interpretable",
    footerRight: "Actionable / Traceable",
  },
  zh: {
    ariaLabel: "结构化认知引擎面板",
    panelLabel: "结构化认知引擎面板",
    panelVersion: "Protocol v5.1",
    panelNote: "From noise to clarity",
    modules: {
      matrix: "30-Facet Matrix",
      norm: "Norm Position",
      scenario: "Scenario Output",
      action: "Action Coordinates",
    },
    notes: {
      matrix: "围绕五大特质域完成 30 个分面的高分辨率校准。",
      norm: "结果回到 100,000+ 样本常模中的相对位置读取。",
      scenario: "将当前输出映射进真实判断场景的优先链路。",
      action: "把判断依据压缩成可执行、可复盘的行动坐标。",
    },
    scenarioItems: [
      { name: "合伙拟合", score: "0.82", status: "稳定" },
      { name: "职业转型", score: "0.74", status: "关注" },
      { name: "压力负荷", score: "0.39", status: "监测" },
    ],
    actionRows: [
      { label: "沟通节奏", value: 84, code: "A1" },
      { label: "岗位拟合假设", value: 76, code: "B4" },
      { label: "恢复协议", value: 63, code: "C2" },
    ],
    matrixLegend: "30 / 30 分面已校准",
    normPercentile: "第 71 百分位",
    normScore: "Z +0.64",
    footerLeft: "可解释",
    footerRight: "可执行 / 可复盘",
  },
} as const;

const FACET_CELLS = [
  88, 72, 64, 52, 41, 75, 67, 55, 44, 38,
  82, 77, 69, 58, 47, 71, 66, 61, 49, 40,
  86, 79, 73, 63, 54, 74, 68, 59, 51, 43,
];

function NormCurve() {
  return (
    <svg viewBox="0 0 300 134" className="h-auto w-full" aria-hidden>
      <defs>
        <linearGradient id="fm-home-norm-curve" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#5a6371" />
          <stop offset="55%" stopColor="#00ff41" />
          <stop offset="100%" stopColor="#5a6371" />
        </linearGradient>
      </defs>

      <g stroke="rgba(118,128,142,0.28)" strokeWidth="1">
        <line x1="20" y1="110" x2="280" y2="110" />
        <line x1="20" y1="18" x2="20" y2="110" />
        <line x1="72" y1="18" x2="72" y2="110" />
        <line x1="124" y1="18" x2="124" y2="110" />
        <line x1="176" y1="18" x2="176" y2="110" />
        <line x1="228" y1="18" x2="228" y2="110" />
        <line x1="280" y1="18" x2="280" y2="110" />
      </g>

      <path
        d="M20 110 C 56 110, 74 103, 98 84 C 120 66, 138 28, 150 28 C 162 28, 180 66, 202 84 C 226 103, 244 110, 280 110"
        fill="none"
        stroke="url(#fm-home-norm-curve)"
        strokeWidth="3"
      />

      <line x1="183" y1="26" x2="183" y2="110" stroke="#00ff41" strokeDasharray="4 5" strokeWidth="2" />
      <circle cx="183" cy="54" r="6" fill="#0b0f14" stroke="#00ff41" strokeWidth="2.5" />

      <g fill="#7f8a98" fontSize="11" fontFamily="var(--font-fm-mono)">
        <text x="20" y="128" textAnchor="middle">
          -2
        </text>
        <text x="72" y="128" textAnchor="middle">
          -1
        </text>
        <text x="124" y="128" textAnchor="middle">
          0
        </text>
        <text x="176" y="128" textAnchor="middle">
          +1
        </text>
        <text x="228" y="128" textAnchor="middle">
          +2
        </text>
        <text x="280" y="128" textAnchor="middle">
          +3
        </text>
      </g>
    </svg>
  );
}

function RadarGlyph() {
  return (
    <svg viewBox="0 0 120 104" className="h-auto w-full" aria-hidden>
      <g stroke="rgba(118,128,142,0.26)" strokeWidth="1">
        <polygon points="60,8 103,32 90,84 30,84 17,32" fill="none" />
        <polygon points="60,26 87,40 79,72 41,72 33,40" fill="none" />
        <line x1="60" y1="8" x2="60" y2="84" />
        <line x1="17" y1="32" x2="90" y2="84" />
        <line x1="103" y1="32" x2="30" y2="84" />
      </g>
      <polygon points="60,18 91,39 78,77 47,67 31,43" fill="rgba(0,255,65,0.16)" stroke="#00ff41" strokeWidth="2" />
      <g fill="#00ff41">
        <circle cx="60" cy="18" r="3" />
        <circle cx="91" cy="39" r="3" />
        <circle cx="78" cy="77" r="3" />
        <circle cx="47" cy="67" r="3" />
        <circle cx="31" cy="43" r="3" />
      </g>
    </svg>
  );
}

export function HeroAnimatedVisual({ localeLabel, className }: HeroAnimatedVisualProps) {
  const copy = COPY[localeLabel];

  return (
    <div className={cn("relative mx-auto w-full max-w-[42rem]", className)}>
      <div aria-hidden className="fm-home-hero-orbit fm-home-hero-orbit-left" />
      <div aria-hidden className="fm-home-hero-orbit fm-home-hero-orbit-right" />

      <div role="img" aria-label={copy.ariaLabel} className="fm-home-engine-panel">
        <div aria-hidden className="fm-home-engine-grid" />
        <div aria-hidden className="fm-home-engine-noise" />

        <div className="relative z-10 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="space-y-1">
              <p className="m-0 font-mono text-[0.72rem] uppercase tracking-[0.28em] text-[#7d8896]">
                {copy.panelLabel}
              </p>
              <h3 className="m-0 text-lg font-semibold tracking-[-0.03em] text-[#f2f2f7]">{copy.panelNote}</h3>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-[#98a3b1]">
              <span className="inline-flex h-2 w-2 rounded-full bg-[#00ff41]" />
              {copy.panelVersion}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.04fr)_minmax(15rem,0.96fr)]">
            <div className="grid gap-4">
              <section className="fm-home-engine-module fm-home-engine-module-matrix">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="fm-home-engine-label m-0">{copy.modules.matrix}</p>
                    <p className="fm-home-engine-note m-0 mt-2">{copy.notes.matrix}</p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[#7d8896]">
                    {copy.matrixLegend}
                  </span>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_7.5rem]">
                  <div className="grid grid-cols-5 gap-2">
                    {FACET_CELLS.map((value, index) => (
                      <div
                        key={`${value}-${index}`}
                        className="rounded-[0.8rem] border border-white/8 bg-[#11161e] px-2 py-2"
                      >
                        <p className="m-0 font-mono text-[0.58rem] uppercase tracking-[0.18em] text-[#687383]">
                          F{`${index + 1}`.padStart(2, "0")}
                        </p>
                        <div className="mt-2 h-1.5 rounded-full bg-white/6">
                          <span className="block h-full rounded-full bg-[#00ff41]" style={{ width: `${value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-[1rem] border border-white/8 bg-[#0d1218] px-3 py-3">
                    <p className="m-0 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[#7d8896]">signal plot</p>
                    <div className="mt-3">
                      <RadarGlyph />
                    </div>
                  </div>
                </div>
              </section>

              <section className="fm-home-engine-module">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="fm-home-engine-label m-0">{copy.modules.action}</p>
                    <p className="fm-home-engine-note m-0 mt-2">{copy.notes.action}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {copy.actionRows.map((row) => (
                    <div key={row.label} className="rounded-[0.95rem] border border-white/8 bg-[#0f141b] px-3 py-3">
                      <div className="flex items-center justify-between gap-3 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-[#8a95a3]">
                        <span>{row.code}</span>
                        <span>{row.value}</span>
                      </div>
                      <p className="m-0 mt-2 text-sm font-medium text-[#e3e6eb]">{row.label}</p>
                      <div className="mt-3 h-1.5 rounded-full bg-white/6">
                        <span className="block h-full rounded-full bg-[#00ff41]" style={{ width: `${row.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="grid gap-4">
              <section className="fm-home-engine-module">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="fm-home-engine-label m-0">{copy.modules.norm}</p>
                    <p className="fm-home-engine-note m-0 mt-2">{copy.notes.norm}</p>
                  </div>
                  <div className="text-right">
                    <p className="m-0 font-mono text-[0.66rem] uppercase tracking-[0.18em] text-[#8d98a6]">
                      {copy.normScore}
                    </p>
                    <p className="m-0 mt-1 text-sm font-semibold text-[#f2f2f7]">{copy.normPercentile}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <NormCurve />
                </div>
              </section>

              <section className="fm-home-engine-module">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="fm-home-engine-label m-0">{copy.modules.scenario}</p>
                    <p className="fm-home-engine-note m-0 mt-2">{copy.notes.scenario}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {copy.scenarioItems.map((item) => (
                    <div key={item.name} className="grid grid-cols-[minmax(0,1fr)_3.5rem_4.2rem] items-center gap-3 rounded-[0.95rem] border border-white/8 bg-[#0f141b] px-3 py-3">
                      <div>
                        <p className="m-0 text-sm font-medium text-[#f2f2f7]">{item.name}</p>
                      </div>
                      <p className="m-0 text-right font-mono text-[0.74rem] uppercase tracking-[0.16em] text-[#98a3b1]">
                        {item.score}
                      </p>
                      <span className="inline-flex justify-center rounded-full border border-white/8 bg-white/[0.04] px-2 py-1 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#00ff41]">
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[#7d8896]">
            <span>{copy.footerLeft}</span>
            <span>{copy.footerRight}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
