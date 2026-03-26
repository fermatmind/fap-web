import type { CSSProperties } from "react";
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
    },
    notes: {
      matrix: "Thirty lower-level facets form the measurement layer beneath the visible result.",
      norm: "The reading returns to an external reference frame instead of staying an isolated score.",
    },
    matrixLegend: "30 facets calibrated",
    matrixSummaryLabel: "Measured output",
    matrixSummaryValue: "30 facets calibrated",
    matrixDetail: "Thirty facet signals stay visible without reducing the user to a broad label.",
    matrixStreamLabel: "Reading",
    normMeta: "100,000+ reference set",
    normAnchor: "Objective placement, not an isolated score.",
    normPercentile: "71st percentile",
    normScore: "+1.42 Z",
    normStatA: "Z-Score",
    normStatB: "Percentile",
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
    },
    notes: {
      matrix: "不是粗标签，而是由三十个底层分面构成的测量层。",
      norm: "你的读数被放回外部参照系中读取，而不是停留在孤立分数。",
    },
    matrixLegend: "30 个分面已校准",
    matrixSummaryLabel: "测量输出",
    matrixSummaryValue: "30 分面已校准",
    matrixDetail: "三十条分面信号持续可读，而不是被压扁成一个粗略标签。",
    matrixStreamLabel: "读数",
    normMeta: "100,000+ 常模参照",
    normAnchor: "客观坐标，不是孤立分数。",
    normPercentile: "第 71 百分位",
    normScore: "+1.42 Z",
    normStatA: "Z-Score",
    normStatB: "Percentile",
  },
} as const;

const FACET_STREAMS = [
  { range: "F01-F05", code: "0xDE02D8D6", probe: "0.612", value: 84 },
  { range: "F06-F10", code: "0x0679B80F", probe: "0.544", value: 76 },
  { range: "F11-F15", code: "0x1E21B16F", probe: "0.481", value: 63 },
  { range: "F16-F20", code: "0x1677B181", probe: "0.573", value: 71 },
  { range: "F21-F25", code: "0x22E22B26", probe: "0.528", value: 68 },
  { range: "F26-F30", code: "0x26A2B82F", probe: "0.601", value: 74 },
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
        stroke="rgba(0,255,65,0.68)"
        strokeWidth="2.4"
        className="fm-home-engine-curve"
      />

      <line x1="202" y1="36" x2="202" y2="120" stroke="rgba(0,255,65,0.56)" strokeDasharray="4 4" strokeWidth="1.5" />
      <circle cx="202" cy="60" r="5" fill="#0b0f14" stroke="rgba(0,255,65,0.74)" strokeWidth="2" className="fm-home-engine-curve-dot" />

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
        fill="rgba(0,255,65,0.1)"
        stroke="rgba(0,255,65,0.72)"
        strokeWidth="1.8"
        className="fm-home-engine-radar-shape"
      />
      <g fill="rgba(0,255,65,0.78)" className="fm-home-engine-radar-points">
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
    <div className={cn("relative mx-auto w-full max-w-[47rem]", className)}>
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
                  {FACET_STREAMS.map((item, index) => (
                    <div
                      key={item.code}
                      className="fm-home-facet-stream"
                      style={{ "--fm-stream-delay": `${index * 180}ms` } as CSSProperties}
                    >
                      <div className="fm-home-facet-stream-head">
                        <span className="fm-home-facet-range">{item.range}</span>
                        <span className="fm-home-facet-code">{item.code}</span>
                      </div>
                      <SignalBar value={item.value} segments={10} tone="muted" />
                      <div className="fm-home-facet-stream-foot">
                        <span className="fm-home-facet-probe-label">{copy.matrixStreamLabel}</span>
                        <span className="fm-home-facet-probe-value">{item.probe}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="fm-home-engine-radar-box">
                  <div className="fm-home-engine-radar-meta">
                    <p className="fm-home-engine-meta-label m-0">{copy.matrixSummaryLabel}</p>
                    <p className="fm-home-engine-probe-value m-0">{copy.matrixSummaryValue}</p>
                  </div>
                  <div className="mt-4">
                    <RadarGlyph />
                  </div>
                  <p className="fm-home-engine-radar-detail m-0">{copy.matrixDetail}</p>
                </div>
              </div>
            </section>

            <section className="fm-home-engine-module">
              <div className="fm-home-engine-module-head">
                <div>
                  <p className="fm-home-engine-label m-0">{copy.modules.norm}</p>
                  <p className="fm-home-engine-note m-0 mt-2">{copy.notes.norm}</p>
                </div>
              </div>

              <div className="fm-home-engine-norm-body">
                <div className="fm-home-engine-norm-stats">
                  <div className="fm-home-engine-norm-stat">
                    <p className="fm-home-engine-meta-label m-0">{copy.normStatA}</p>
                    <p className="fm-home-engine-norm-score m-0 mt-2">{copy.normScore}</p>
                  </div>
                  <div className="fm-home-engine-norm-stat">
                    <p className="fm-home-engine-meta-label m-0">{copy.normStatB}</p>
                    <p className="fm-home-engine-norm-percentile m-0 mt-2">{copy.normPercentile}</p>
                  </div>
                </div>
                <p className="fm-home-engine-norm-anchor m-0">
                  <span className="fm-home-engine-meta-label">{copy.normMeta}</span>
                  <span>{copy.normAnchor}</span>
                </p>
                <NormCurve />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
