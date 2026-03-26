import { cn } from "@/lib/utils";

type HeroAnimatedVisualProps = {
  localeLabel: "zh" | "en";
  className?: string;
};

type SignalTone = "signal" | "muted";

const COPY = {
  en: {
    ariaLabel: "Structured cognitive engine panel",
    panelLabel: "Structured Cognitive Engine Panel",
    panelNote: "30-Facet / norm-anchored / scenario-mapped",
    systemStatus: "System active",
    panelVersion: "V3.1",
    modules: {
      matrix: "30-Facet Matrix",
      norm: "Norm Position",
      scenario: "Scenario Output",
      action: "Action Coordinates",
    },
    notes: {
      matrix: "High-resolution measurement across thirty interpretable facets.",
      norm: "Norm-anchored reading against a 100,000+ reference set.",
      scenario: "Current output mapped into real decision contexts.",
      action: "Three next-step coordinates distilled from the reading.",
    },
    matrixLegend: "30 facets calibrated",
    probeLabel: "Probe target",
    probeTarget: "Strategic caution",
    probeValue: "0.612",
    normMeta: "100,000+ reference set",
    normPercentile: "71st percentile",
    normScore: "+1.42 Z",
    scenarioItems: [
      { name: "Partner fit", score: "0.82", status: "Steady", value: 82 },
      { name: "Career pivot", score: "0.74", status: "Watch", value: 74 },
      { name: "Pressure load", score: "0.39", status: "Guarded", value: 39 },
    ],
    actionRows: [
      { label: "Communication rhythm", value: 84, code: "A1" },
      { label: "Role-fit signal", value: 76, code: "B4" },
      { label: "Recovery protocol", value: 63, code: "C2" },
    ],
    footerLeft: "Interpretable",
    footerRight: "Actionable / Traceable",
  },
  zh: {
    ariaLabel: "结构化认知引擎面板",
    panelLabel: "结构化认知引擎面板",
    panelNote: "30-Facet / 常模锚定 / 场景映射",
    systemStatus: "系统运行中",
    panelVersion: "V3.1",
    modules: {
      matrix: "30-Facet Matrix",
      norm: "Norm Position",
      scenario: "Scenario Output",
      action: "Action Coordinates",
    },
    notes: {
      matrix: "以三十个可解释分面完成高分辨率测量。",
      norm: "回到 100,000+ 常模参照中的相对位置读取。",
      scenario: "将当前输出映射到真实判断链路中的关键场景。",
      action: "把结果压缩成三条可执行的行动坐标。",
    },
    matrixLegend: "30 个分面已校准",
    probeLabel: "探针锁定",
    probeTarget: "战略谨慎",
    probeValue: "0.612",
    normMeta: "100,000+ 常模参照",
    normPercentile: "第 71 百分位",
    normScore: "+1.42 Z",
    scenarioItems: [
      { name: "合伙拟合", score: "0.82", status: "稳定", value: 82 },
      { name: "职业转型", score: "0.74", status: "关注", value: 74 },
      { name: "压力负荷", score: "0.39", status: "警惕", value: 39 },
    ],
    actionRows: [
      { label: "沟通节奏", value: 84, code: "A1" },
      { label: "岗位拟合", value: 76, code: "B4" },
      { label: "恢复协议", value: 63, code: "C2" },
    ],
    footerLeft: "可解释",
    footerRight: "可执行 / 可复盘",
  },
} as const;

const FACET_CELLS = [
  88, 72, 64, 52, 41, 75, 67, 55, 44, 38,
  82, 77, 69, 58, 47, 71, 66, 61, 49, 40,
  86, 79, 73, 63, 54, 74, 68, 59, 51, 43,
];

function SignalBar({ value, segments = 10, tone = "signal" }: { value: number; segments?: number; tone?: SignalTone }) {
  const activeCount = Math.max(1, Math.round((value / 100) * segments));

  return (
    <div className="fm-home-signal-bar" aria-hidden style={{ gridTemplateColumns: `repeat(${segments}, minmax(0, 1fr))` }}>
      {Array.from({ length: segments }, (_, index) => {
        const isActive = index < activeCount;
        return (
          <span
            key={`${tone}-${value}-${index}`}
            className={cn(
              "fm-home-signal-segment",
              isActive && "is-active",
              tone === "muted" && "is-muted",
            )}
          />
        );
      })}
    </div>
  );
}

function NormCurve() {
  return (
    <svg viewBox="0 0 320 150" className="h-auto w-full" aria-hidden>
      <g stroke="rgba(242,242,247,0.1)" strokeWidth="1">
        <line x1="24" y1="120" x2="296" y2="120" />
        <line x1="24" y1="28" x2="24" y2="120" />
        <line x1="78" y1="28" x2="78" y2="120" />
        <line x1="132" y1="28" x2="132" y2="120" />
        <line x1="186" y1="28" x2="186" y2="120" />
        <line x1="240" y1="28" x2="240" y2="120" />
        <line x1="296" y1="28" x2="296" y2="120" />
      </g>

      <path
        d="M24 120 C 64 120, 90 112, 116 88 C 138 68, 154 36, 160 36 C 166 36, 182 68, 204 88 C 230 112, 256 120, 296 120"
        fill="none"
        stroke="rgba(0,255,65,0.82)"
        strokeWidth="2.4"
        className="fm-home-engine-curve"
      />

      <line x1="202" y1="36" x2="202" y2="120" stroke="#00ff41" strokeDasharray="4 4" strokeWidth="1.5" />
      <circle cx="202" cy="60" r="5" fill="#0b0f14" stroke="#00ff41" strokeWidth="2" className="fm-home-engine-curve-dot" />

      <g fill="#7f8a98" fontSize="10.5" fontFamily="var(--font-fm-mono)">
        <text x="24" y="138" textAnchor="middle">-2</text>
        <text x="78" y="138" textAnchor="middle">-1</text>
        <text x="132" y="138" textAnchor="middle">0</text>
        <text x="186" y="138" textAnchor="middle">+1</text>
        <text x="240" y="138" textAnchor="middle">+2</text>
        <text x="296" y="138" textAnchor="middle">+3</text>
      </g>
    </svg>
  );
}

function RadarGlyph() {
  return (
    <svg viewBox="0 0 144 124" className="h-auto w-full" aria-hidden>
      <g stroke="rgba(242,242,247,0.12)" strokeWidth="1">
        <polygon points="72,12 124,40 108,102 36,102 20,40" fill="none" />
        <polygon points="72,32 104,48 94,86 50,86 40,48" fill="none" />
        <line x1="72" y1="12" x2="72" y2="102" />
        <line x1="20" y1="40" x2="108" y2="102" />
        <line x1="124" y1="40" x2="36" y2="102" />
      </g>
      <polygon
        points="72,24 108,47 92,92 53,78 34,51"
        fill="rgba(0,255,65,0.14)"
        stroke="#00ff41"
        strokeWidth="1.8"
        className="fm-home-engine-radar-shape"
      />
      <g fill="#00ff41" className="fm-home-engine-radar-points">
        <circle cx="72" cy="24" r="2.6" />
        <circle cx="108" cy="47" r="2.6" />
        <circle cx="92" cy="92" r="2.6" />
        <circle cx="53" cy="78" r="2.6" />
        <circle cx="34" cy="51" r="2.6" />
      </g>
    </svg>
  );
}

export function HeroAnimatedVisual({ localeLabel, className }: HeroAnimatedVisualProps) {
  const copy = COPY[localeLabel];

  return (
    <div className={cn("relative mx-auto w-full max-w-[43rem]", className)}>
      <div role="img" aria-label={copy.ariaLabel} className="fm-home-engine-panel">
        <div aria-hidden className="fm-home-engine-grid" />
        <div aria-hidden className="fm-home-engine-noise" />
        <div aria-hidden className="fm-home-engine-scanline" />

        <div className="fm-home-engine-shell">
          <div className="fm-home-engine-header">
            <div className="min-w-0 space-y-2">
              <p className="fm-home-engine-header-label m-0">{copy.panelLabel}</p>
              <p className="fm-home-engine-header-note m-0">{copy.panelNote}</p>
            </div>

            <div className="fm-home-engine-status">
              <span className="fm-home-engine-status-dot" />
              <span>{copy.systemStatus}</span>
              <span className="fm-home-engine-status-version">{copy.panelVersion}</span>
            </div>
          </div>

          <div className="fm-home-engine-layout">
            <section className="fm-home-engine-module fm-home-engine-module-matrix">
              <div className="fm-home-engine-module-head">
                <div>
                  <p className="fm-home-engine-label m-0">{copy.modules.matrix}</p>
                  <p className="fm-home-engine-note m-0 mt-2">{copy.notes.matrix}</p>
                </div>
                <span className="fm-home-engine-meta">{copy.matrixLegend}</span>
              </div>

              <div className="fm-home-engine-matrix-body">
                <div className="fm-home-facet-grid" aria-hidden>
                  {FACET_CELLS.map((value, index) => (
                    <div key={`${value}-${index}`} className="fm-home-facet-cell">
                      <span className="fm-home-facet-id">F{`${index + 1}`.padStart(2, "0")}</span>
                      <SignalBar value={value} segments={4} tone="muted" />
                    </div>
                  ))}
                </div>

                <div className="fm-home-engine-radar-box">
                  <div className="fm-home-engine-radar-meta">
                    <div>
                      <p className="fm-home-engine-meta-label m-0">{copy.probeLabel}</p>
                      <p className="fm-home-engine-probe-name m-0 mt-2">{copy.probeTarget}</p>
                    </div>
                    <p className="fm-home-engine-probe-value m-0">{copy.probeValue}</p>
                  </div>
                  <div className="mt-4">
                    <RadarGlyph />
                  </div>
                </div>
              </div>
            </section>

            <section className="fm-home-engine-module">
              <div className="fm-home-engine-module-head">
                <div>
                  <p className="fm-home-engine-label m-0">{copy.modules.norm}</p>
                  <p className="fm-home-engine-note m-0 mt-2">{copy.notes.norm}</p>
                </div>
                <div className="text-right">
                  <p className="fm-home-engine-meta-label m-0">{copy.normMeta}</p>
                  <p className="fm-home-engine-norm-score m-0 mt-2">{copy.normScore}</p>
                  <p className="fm-home-engine-norm-percentile m-0 mt-1">{copy.normPercentile}</p>
                </div>
              </div>

              <div className="mt-4">
                <NormCurve />
              </div>
            </section>

            <section className="fm-home-engine-module">
              <div className="fm-home-engine-module-head">
                <div>
                  <p className="fm-home-engine-label m-0">{copy.modules.scenario}</p>
                  <p className="fm-home-engine-note m-0 mt-2">{copy.notes.scenario}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2.5">
                {copy.scenarioItems.map((item) => (
                  <div key={item.name} className="fm-home-engine-scenario-row">
                    <div className="min-w-0">
                      <p className="m-0 text-sm font-medium text-[#f2f2f7]">{item.name}</p>
                    </div>
                    <p className="m-0 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-[#a1adbb]">{item.score}</p>
                    <span className="fm-home-engine-status-pill">{item.status}</span>
                    <SignalBar value={item.value} segments={8} />
                  </div>
                ))}
              </div>
            </section>

            <section className="fm-home-engine-module fm-home-engine-module-action">
              <div className="fm-home-engine-module-head">
                <div>
                  <p className="fm-home-engine-label m-0">{copy.modules.action}</p>
                  <p className="fm-home-engine-note m-0 mt-2">{copy.notes.action}</p>
                </div>
              </div>

              <div className="fm-home-engine-action-grid">
                {copy.actionRows.map((row) => (
                  <div key={row.label} className="fm-home-engine-action-row">
                    <div className="flex items-center justify-between gap-3">
                      <span className="fm-home-engine-meta-label">{row.code}</span>
                      <span className="fm-home-engine-action-value">{row.value}</span>
                    </div>
                    <p className="m-0 mt-3 text-sm font-medium text-[#f2f2f7]">{row.label}</p>
                    <div className="mt-3">
                      <SignalBar value={row.value} segments={10} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="fm-home-engine-footer">
            <span>{copy.footerLeft}</span>
            <span>{copy.footerRight}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
