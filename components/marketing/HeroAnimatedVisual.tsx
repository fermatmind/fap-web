"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type HeroAnimatedVisualProps = {
  localeLabel: "zh" | "en";
  className?: string;
};

type ScenarioKey = "compatibility" | "career" | "risk";

type TickerMetric = {
  key: string;
  value: string;
};

type FacetDefinition = {
  id: string;
  range: string;
  label: {
    zh: string;
    en: string;
  };
  hex: string;
  reading: number;
  z: number;
  axis: number;
  ring: number;
  scenarios: ScenarioKey[];
};

const COPY = {
  en: {
    ariaLabel: "Cognitive engine control console",
    panelLabel: "Cognitive Engine Control Console",
    panelSubnote: "MEASURE / POSITION / REASON_TRACE",
    systemStatus: "SYSTEM_STATUS: LOCKED",
    modules: {
      matrix: "Measurement array",
      coordinate: "Coordinate lock",
      reason: "Judgment basis",
    },
    notes: {
      matrix:
        "Thirty lower-level facets stay visible as live measurement units instead of collapsing into a coarse personality label.",
      coordinate:
        "The reading is positioned against 100,000+ external references so the output lands as a coordinate, not a self-contained score.",
      reason:
        "The active facet stays interrogable so the console can explain which judgment route will be activated next.",
    },
    matrixLegend: "30 nodes / 3 columns / live probe",
    matrixProbeTarget: "Probe target",
    matrixProbeHex: "Hex code",
    matrixProbeReading: "Reading",
    matrixSummaryLabel: "Active facet",
    matrixSummaryValue: "Signal routes",
    coordinateMeta: "100,000+ reference set",
    coordinateAnchor: "External coordinate lock, not an isolated score.",
    coordinateStatA: "Z-score",
    coordinateStatB: "Percentile",
    coordinateRuler: "Norm reference ruler",
    reasonSignalLabel: "Active signal",
    reasonRangeLabel: "Facet range",
    reasonRoutesLabel: "Output routes",
    reasonTraceLabel: "Judgment trace",
    routeLabels: {
      compatibility: "Partner fit",
      career: "Career path",
      risk: "Risk load",
    },
  },
  zh: {
    ariaLabel: "认知引擎入口控制台",
    panelLabel: "认知引擎入口控制台",
    panelSubnote: "MEASURE / POSITION / REASON_TRACE",
    systemStatus: "SYSTEM_STATUS: LOCKED",
    modules: {
      matrix: "测量阵列",
      coordinate: "定位切片",
      reason: "判断依据",
    },
    notes: {
      matrix: "三十个底层分面持续为可读节点，拒绝被压缩成一个粗颗粒类型标签。",
      coordinate: "输出的是坐标，不是孤立分数。",
      reason: "当前激活分面会继续暴露在控制台中，用来解释判断将被路由到哪条决策链路。",
    },
    matrixLegend: "30 节点 / 3 列探针阵列",
    matrixProbeTarget: "探针目标",
    matrixProbeHex: "节点编号",
    matrixProbeReading: "实时读数",
    matrixSummaryLabel: "当前分面",
    matrixSummaryValue: "信号路由",
    coordinateMeta: "100,000+ 常模参照",
    coordinateAnchor: "先定位外部坐标，再解释结果。",
    coordinateStatA: "Z 分数",
    coordinateStatB: "百分位",
    coordinateRuler: "常模定位尺",
    reasonSignalLabel: "激活信号",
    reasonRangeLabel: "分面区间",
    reasonRoutesLabel: "输出路由",
    reasonTraceLabel: "判断说明",
    routeLabels: {
      compatibility: "关系匹配",
      career: "职业路径",
      risk: "风险负荷",
    },
  },
} as const;

const FACET_DEFINITIONS: FacetDefinition[] = [
  {
    id: "F01",
    range: "F01-F05",
    label: { zh: "战略谨慎", en: "Strategic caution" },
    hex: "0x1E7B101",
    reading: 0.612459,
    z: 1.422459,
    axis: 0,
    ring: 0,
    scenarios: ["compatibility", "risk"],
  },
  {
    id: "F02",
    range: "F01-F05",
    label: { zh: "社会信任", en: "Social trust" },
    hex: "0x1E7B10A",
    reading: 0.598213,
    z: 1.318774,
    axis: 0,
    ring: 1,
    scenarios: ["compatibility"],
  },
  {
    id: "F03",
    range: "F01-F05",
    label: { zh: "协作耐心", en: "Coordination patience" },
    hex: "0x1E7B10F",
    reading: 0.574118,
    z: 0.982145,
    axis: 0,
    ring: 2,
    scenarios: ["compatibility", "career"],
  },
  {
    id: "F04",
    range: "F01-F05",
    label: { zh: "关系修复", en: "Repair tendency" },
    hex: "0x1E7B118",
    reading: 0.543671,
    z: 0.74412,
    axis: 0,
    ring: 3,
    scenarios: ["compatibility", "risk"],
  },
  {
    id: "F05",
    range: "F01-F05",
    label: { zh: "情境敏感", en: "Context sensitivity" },
    hex: "0x1E7B11D",
    reading: 0.521337,
    z: 0.512318,
    axis: 0,
    ring: 4,
    scenarios: ["risk"],
  },
  {
    id: "F06",
    range: "F06-F10",
    label: { zh: "机会扫描", en: "Opportunity scan" },
    hex: "0x22A4002",
    reading: 0.646103,
    z: 1.184522,
    axis: 1,
    ring: 0,
    scenarios: ["career"],
  },
  {
    id: "F07",
    range: "F06-F10",
    label: { zh: "抽象推理", en: "Abstract reasoning" },
    hex: "0x22A4009",
    reading: 0.633945,
    z: 1.024551,
    axis: 1,
    ring: 1,
    scenarios: ["career"],
  },
  {
    id: "F08",
    range: "F06-F10",
    label: { zh: "模式提取", en: "Pattern extraction" },
    hex: "0x22A4010",
    reading: 0.618224,
    z: 0.904311,
    axis: 1,
    ring: 2,
    scenarios: ["career", "risk"],
  },
  {
    id: "F09",
    range: "F06-F10",
    label: { zh: "角色定位", en: "Role alignment" },
    hex: "0x22A4016",
    reading: 0.587331,
    z: 0.713944,
    axis: 1,
    ring: 3,
    scenarios: ["compatibility", "career"],
  },
  {
    id: "F10",
    range: "F06-F10",
    label: { zh: "路径弹性", en: "Path elasticity" },
    hex: "0x22A401B",
    reading: 0.56387,
    z: 0.601732,
    axis: 1,
    ring: 4,
    scenarios: ["career"],
  },
  {
    id: "F11",
    range: "F11-F15",
    label: { zh: "压力恢复", en: "Stress recovery" },
    hex: "0x31C5504",
    reading: 0.684221,
    z: 1.118734,
    axis: 2,
    ring: 0,
    scenarios: ["risk"],
  },
  {
    id: "F12",
    range: "F11-F15",
    label: { zh: "负荷耐受", en: "Load tolerance" },
    hex: "0x31C550D",
    reading: 0.661025,
    z: 0.964416,
    axis: 2,
    ring: 1,
    scenarios: ["risk"],
  },
  {
    id: "F13",
    range: "F11-F15",
    label: { zh: "失误复盘", en: "Error recovery" },
    hex: "0x31C5515",
    reading: 0.639583,
    z: 0.844103,
    axis: 2,
    ring: 2,
    scenarios: ["risk", "career"],
  },
  {
    id: "F14",
    range: "F11-F15",
    label: { zh: "情绪回稳", en: "Emotional reset" },
    hex: "0x31C551E",
    reading: 0.604972,
    z: 0.691223,
    axis: 2,
    ring: 3,
    scenarios: ["risk"],
  },
  {
    id: "F15",
    range: "F11-F15",
    label: { zh: "支持需求", en: "Support threshold" },
    hex: "0x31C5525",
    reading: 0.576241,
    z: 0.534908,
    axis: 2,
    ring: 4,
    scenarios: ["risk"],
  },
  {
    id: "F16",
    range: "F16-F20",
    label: { zh: "推进强度", en: "Execution drive" },
    hex: "0x417B200",
    reading: 0.622408,
    z: 1.116311,
    axis: 3,
    ring: 0,
    scenarios: ["career", "compatibility"],
  },
  {
    id: "F17",
    range: "F16-F20",
    label: { zh: "节奏控制", en: "Rhythm control" },
    hex: "0x417B20A",
    reading: 0.601927,
    z: 0.931224,
    axis: 3,
    ring: 1,
    scenarios: ["career", "risk"],
  },
  {
    id: "F18",
    range: "F16-F20",
    label: { zh: "执行一致", en: "Execution consistency" },
    hex: "0x417B213",
    reading: 0.583402,
    z: 0.803146,
    axis: 3,
    ring: 2,
    scenarios: ["career"],
  },
  {
    id: "F19",
    range: "F16-F20",
    label: { zh: "结果执念", en: "Result fixation" },
    hex: "0x417B21A",
    reading: 0.559217,
    z: 0.648224,
    axis: 3,
    ring: 3,
    scenarios: ["career", "risk"],
  },
  {
    id: "F20",
    range: "F16-F20",
    label: { zh: "迭代意愿", en: "Iteration appetite" },
    hex: "0x417B221",
    reading: 0.542731,
    z: 0.489552,
    axis: 3,
    ring: 4,
    scenarios: ["career"],
  },
  {
    id: "F21",
    range: "F21-F25",
    label: { zh: "自我揭示", en: "Self disclosure" },
    hex: "0x52D0C03",
    reading: 0.577164,
    z: 0.921806,
    axis: 4,
    ring: 0,
    scenarios: ["compatibility"],
  },
  {
    id: "F22",
    range: "F21-F25",
    label: { zh: "冲突回避", en: "Conflict avoidance" },
    hex: "0x52D0C0A",
    reading: 0.556388,
    z: 0.741363,
    axis: 4,
    ring: 1,
    scenarios: ["compatibility", "risk"],
  },
  {
    id: "F23",
    range: "F21-F25",
    label: { zh: "同理调度", en: "Empathy routing" },
    hex: "0x52D0C10",
    reading: 0.532245,
    z: 0.603441,
    axis: 4,
    ring: 2,
    scenarios: ["compatibility"],
  },
  {
    id: "F24",
    range: "F21-F25",
    label: { zh: "协商耐性", en: "Negotiation tolerance" },
    hex: "0x52D0C16",
    reading: 0.516744,
    z: 0.452217,
    axis: 4,
    ring: 3,
    scenarios: ["compatibility", "career"],
  },
  {
    id: "F25",
    range: "F21-F25",
    label: { zh: "反馈采纳", en: "Feedback uptake" },
    hex: "0x52D0C1F",
    reading: 0.498213,
    z: 0.308912,
    axis: 4,
    ring: 4,
    scenarios: ["compatibility"],
  },
  {
    id: "F26",
    range: "F26-F30",
    label: { zh: "远景整合", en: "Vision integration" },
    hex: "0x6A2B82F",
    reading: 0.641773,
    z: 1.146228,
    axis: 5,
    ring: 0,
    scenarios: ["career", "compatibility"],
  },
  {
    id: "F27",
    range: "F26-F30",
    label: { zh: "策略迁移", en: "Strategy transfer" },
    hex: "0x6A2B836",
    reading: 0.624281,
    z: 1.004552,
    axis: 5,
    ring: 1,
    scenarios: ["career"],
  },
  {
    id: "F28",
    range: "F26-F30",
    label: { zh: "路径抽象", en: "Path abstraction" },
    hex: "0x6A2B83D",
    reading: 0.603844,
    z: 0.852441,
    axis: 5,
    ring: 2,
    scenarios: ["career", "risk"],
  },
  {
    id: "F29",
    range: "F26-F30",
    label: { zh: "优先级排序", en: "Priority ranking" },
    hex: "0x6A2B843",
    reading: 0.581203,
    z: 0.701228,
    axis: 5,
    ring: 3,
    scenarios: ["career", "risk"],
  },
  {
    id: "F30",
    range: "F26-F30",
    label: { zh: "资源约束感", en: "Constraint awareness" },
    hex: "0x6A2B84A",
    reading: 0.552402,
    z: 0.548114,
    axis: 5,
    ring: 4,
    scenarios: ["risk", "career"],
  },
];

const TICKER_METRICS: TickerMetric[] = [
  { key: "COMPATIBILITY_INDEX", value: "0.824219" },
  { key: "TRUST_DELTA", value: "0.612458" },
  { key: "COORDINATION_DRAG", value: "0.183441" },
  { key: "CAREER_VECTOR", value: "0.764118" },
  { key: "RISK_LOAD", value: "0.392604" },
];

function formatLocalePercentile(value: number, locale: "zh" | "en") {
  return locale === "zh" ? `${value.toFixed(1)} 百分位` : `${value.toFixed(1)} percentile`;
}

function formatNodeReading(value: number) {
  return value.toFixed(6);
}

function percentileFromZ(z: number) {
  const percentile = 50 * (1 + Math.tanh((z / Math.SQRT2) * 0.9));
  return Math.max(0, Math.min(99.9, percentile));
}

function SignalDots({ value, segments = 14, activeIndex = -1 }: { value: number; segments?: number; activeIndex?: number }) {
  const activeCount = Math.max(2, Math.round(value * segments));

  return (
    <div
      className="fm-home-engine-dots"
      aria-hidden
      style={{ gridTemplateColumns: `repeat(${segments}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: segments }, (_, index) => {
        const isActive = index < activeCount;
        const isTracked = index === activeIndex;
        return (
          <span
            key={`${value}-${index}`}
            className={cn("fm-home-engine-dot", isActive && "is-active", isTracked && "is-tracked")}
          />
        );
      })}
    </div>
  );
}

function NormCurve({ zScore }: { zScore: number }) {
  const x = 24 + ((zScore + 2) / 5) * 272;

  return (
    <svg viewBox="0 0 320 156" className="h-auto w-full" aria-hidden>
      <defs>
        <linearGradient id="fm-home-curve-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(0,255,65,0.12)" />
          <stop offset="52%" stopColor="rgba(0,255,65,0.84)" />
          <stop offset="100%" stopColor="rgba(0,255,65,0.12)" />
        </linearGradient>
      </defs>

      <g stroke="rgba(255,255,255,0.08)" strokeWidth="1">
        <line x1="24" y1="126" x2="296" y2="126" />
        {Array.from({ length: 6 }, (_, index) => (
          <line key={index} x1={24 + index * 54.4} y1="28" x2={24 + index * 54.4} y2="126" />
        ))}
      </g>

      <path
        d="M24 126 C 64 126, 90 118, 116 92 C 138 68, 154 34, 160 34 C 166 34, 182 68, 204 92 C 230 118, 256 126, 296 126"
        fill="none"
        stroke="url(#fm-home-curve-gradient)"
        strokeWidth="2.5"
        className="fm-home-engine-curve"
      />

      <line
        x1={x}
        y1="28"
        x2={x}
        y2="126"
        stroke="rgba(0,255,65,0.72)"
        strokeWidth="1.3"
        strokeDasharray="4 5"
        className="fm-home-engine-curve-scan"
      />
      <circle
        cx={x}
        cy="68"
        r="4.5"
        fill="#0b0f14"
        stroke="rgba(0,255,65,0.86)"
        strokeWidth="2"
        className="fm-home-engine-curve-dot"
      />

      <g fill="#7f8a98" fontSize="10.5" fontFamily="var(--font-fm-mono)">
        <text x="24" y="145" textAnchor="middle">
          -2
        </text>
        <text x="78" y="145" textAnchor="middle">
          -1
        </text>
        <text x="132" y="145" textAnchor="middle">
          0
        </text>
        <text x="186" y="145" textAnchor="middle">
          +1
        </text>
        <text x="240" y="145" textAnchor="middle">
          +2
        </text>
        <text x="296" y="145" textAnchor="middle">
          +3
        </text>
      </g>
    </svg>
  );
}


function buildReasonSummary(activeFacet: FacetDefinition, localeLabel: "zh" | "en") {
  const routeLabels = activeFacet.scenarios.map((scenario) => COPY[localeLabel].routeLabels[scenario]);
  if (localeLabel === "zh") {
    return `当前读数集中在「${activeFacet.label.zh}」分面，并被路由到${routeLabels.join("、")}等判断链路。`;
  }

  return `The current reading stays anchored on the ${activeFacet.label.en} facet and routes into ${routeLabels.join(", ")} judgment chains.`;
}

export function HeroAnimatedVisual({ localeLabel, className }: HeroAnimatedVisualProps) {
  const copy = COPY[localeLabel];
  const [hoveredFacetId, setHoveredFacetId] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTick((value) => value + 1);
    }, 1400);

    return () => window.clearInterval(timer);
  }, []);

  const cycleFacetId = FACET_DEFINITIONS[tick % FACET_DEFINITIONS.length]?.id ?? null;
  const activeFacetId = hoveredFacetId ?? cycleFacetId;

  const activeFacet = useMemo(
    () => FACET_DEFINITIONS.find((facet) => facet.id === activeFacetId) ?? FACET_DEFINITIONS[0],
    [activeFacetId],
  );

  const activeZScore = activeFacet.z;
  const percentile = percentileFromZ(activeZScore);
  const tickerLog = TICKER_METRICS.map(({ key, value }) => `${key}: ${value}`).join(" // ");
  const activeRoutes = activeFacet.scenarios.map((scenario) => copy.routeLabels[scenario]);

  const groupedFacets = useMemo(
    () => Array.from({ length: 3 }, (_, columnIndex) => FACET_DEFINITIONS.slice(columnIndex * 10, columnIndex * 10 + 10)),
    [],
  );

  return (
    <div className={cn("fm-home-engine-wrap relative mx-auto w-full", className)}>
      <div role="img" aria-label={copy.ariaLabel} className="fm-home-engine-panel">
        <div aria-hidden className="fm-home-engine-grid" />
        <div aria-hidden className="fm-home-engine-noise" />
        <div aria-hidden className="fm-home-engine-scanline" />

        <div className="fm-home-engine-shell">
          <div className="fm-home-engine-header">
            <div className="fm-home-engine-header-stack min-w-0 space-y-1">
              <p className="fm-home-engine-header-label m-0">{copy.panelLabel}</p>
              <p className="fm-home-engine-header-subnote m-0">{copy.panelSubnote}</p>
            </div>

            <div className="fm-home-engine-status">
              <span className="fm-home-engine-status-dot" />
              <span>{copy.systemStatus}</span>
            </div>
          </div>

          <div className="fm-home-engine-layout">
            <section className="fm-home-engine-module fm-home-engine-module-matrix">
              <div className="fm-home-engine-module-head">
                <div>
                  <p className="fm-home-engine-label m-0">{copy.modules.matrix}</p>
                  <p
                    className={cn(
                      "fm-home-engine-note m-0 mt-2",
                      localeLabel === "zh" && "fm-home-engine-note-compact"
                    )}
                  >
                    {copy.notes.matrix}
                  </p>
                </div>
                <span className="fm-home-engine-meta">{copy.matrixLegend}</span>
              </div>

              <div className="fm-home-engine-matrix-body">
                <div className="fm-home-engine-ledger">
                  <div className="fm-home-engine-probe-panel fm-home-engine-probe-strip">
                    <div className="fm-home-engine-probe-row">
                      <span className="fm-home-engine-meta-label">{copy.matrixProbeTarget}</span>
                      <span className="fm-home-engine-probe-data">{activeFacet.label[localeLabel]}</span>
                    </div>
                    <div className="fm-home-engine-probe-row">
                      <span className="fm-home-engine-meta-label">{copy.matrixProbeHex}</span>
                      <span className="fm-home-engine-probe-data">{activeFacet.hex}</span>
                    </div>
                    <div className="fm-home-engine-probe-row">
                      <span className="fm-home-engine-meta-label">{copy.matrixProbeReading}</span>
                      <span className="fm-home-engine-probe-data">{formatNodeReading(activeFacet.reading)}</span>
                    </div>
                  </div>

                  <div className="fm-home-engine-node-grid">
                    {groupedFacets.map((column, columnIndex) => (
                      <div key={`column-${columnIndex}`} className="fm-home-engine-node-column">
                        {column.map((facet, facetIndex) => (
                          <div
                            key={facet.id}
                            className={cn("fm-home-engine-node-entry", activeFacet.id === facet.id && "is-active")}
                            onMouseEnter={() => setHoveredFacetId(facet.id)}
                            onMouseLeave={() => setHoveredFacetId(null)}
                          >
                            <div className="fm-home-engine-node-entry-head">
                              <span className="fm-home-engine-node-entry-id">{facet.id}</span>
                              <span className="fm-home-engine-node-entry-hex">{facet.hex}</span>
                            </div>
                            <SignalDots
                              value={facet.reading}
                              segments={6}
                              activeIndex={activeFacet.id === facet.id ? Math.min(5, facetIndex % 6) : -1}
                            />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>

                  <div className="fm-home-engine-matrix-summary">
                    <div className="fm-home-engine-summary-cell">
                      <span className="fm-home-engine-meta-label">{copy.matrixSummaryLabel}</span>
                      <span className="fm-home-engine-summary-value">
                        {activeFacet.id} / {activeFacet.label[localeLabel]}
                      </span>
                    </div>

                    <div className="fm-home-engine-summary-cell">
                      <span className="fm-home-engine-meta-label">{copy.matrixSummaryValue}</span>
                      <span className="fm-home-engine-summary-value">{activeRoutes.join(" / ")}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="fm-home-engine-side-stack">
              <section className="fm-home-engine-module fm-home-engine-module-coordinate">
                <div className="fm-home-engine-module-head">
                  <div>
                    <p className="fm-home-engine-label m-0">{copy.modules.coordinate}</p>
                    <p
                      className={cn(
                        "fm-home-engine-note m-0 mt-2",
                        localeLabel === "zh" && "fm-home-engine-note-compact"
                      )}
                    >
                      {copy.notes.coordinate}
                    </p>
                  </div>
                  <span className="fm-home-engine-meta">{copy.coordinateMeta}</span>
                </div>

                <div className="fm-home-engine-norm-body">
                  <div className="fm-home-engine-norm-stats">
                    <div className="fm-home-engine-norm-stat">
                      <p className="fm-home-engine-meta-label m-0">{copy.coordinateStatA}</p>
                      <p className="fm-home-engine-norm-score m-0 mt-2">
                        {activeZScore >= 0 ? "+" : ""}
                        {activeZScore.toFixed(6)}
                      </p>
                    </div>
                    <div className="fm-home-engine-norm-stat">
                      <p className="fm-home-engine-meta-label m-0">{copy.coordinateStatB}</p>
                      <p className="fm-home-engine-norm-percentile m-0 mt-2">{formatLocalePercentile(percentile, localeLabel)}</p>
                    </div>
                  </div>
                  <div className="fm-home-engine-ruler">
                    <span className="fm-home-engine-meta-label">{copy.coordinateRuler}</span>
                    <SignalDots value={(percentile / 100) * 0.92} segments={18} activeIndex={Math.round((percentile / 100) * 17)} />
                  </div>

                  <NormCurve zScore={activeZScore} />
                </div>
              </section>

              <section className="fm-home-engine-module fm-home-engine-module-reason">
                <div className="fm-home-engine-reason-body">
                  <div className="fm-home-engine-reason-focus">
                    <div className="fm-home-engine-reason-head">
                      <span className="fm-home-engine-meta-label">{copy.reasonSignalLabel}</span>
                      <span className="fm-home-engine-probe-data">{activeFacet.id}</span>
                    </div>
                    <p className="fm-home-engine-reason-title m-0">{activeFacet.label[localeLabel]}</p>
                    <SignalDots value={activeFacet.reading} segments={10} activeIndex={tick % 10} />
                  </div>

                  <div className="fm-home-engine-reason-grid">
                    <div className="fm-home-engine-route-block">
                      <span className="fm-home-engine-meta-label">{copy.reasonRangeLabel}</span>
                      <span className="fm-home-engine-route-value">{activeFacet.range}</span>
                    </div>

                    <div className="fm-home-engine-route-block">
                      <span className="fm-home-engine-meta-label">{copy.reasonRoutesLabel}</span>
                      <div className="fm-home-engine-route-tags" aria-hidden>
                        {activeRoutes.map((route) => (
                          <span key={route} className="fm-home-engine-route-tag">
                            {route}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="fm-home-engine-reason-summary m-0">
                    <span className="fm-home-engine-meta-label">{copy.reasonTraceLabel}</span>
                    <span>{buildReasonSummary(activeFacet, localeLabel)}</span>
                  </p>
                </div>
              </section>
            </div>
          </div>

          <div className="fm-home-engine-footer" aria-hidden>
            <div className="fm-home-engine-log-track">
              <span>{tickerLog}</span>
              <span>{tickerLog}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
