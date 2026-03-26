import { Container } from "@/components/layout/Container";
import type { Locale } from "@/lib/i18n/locales";

const FACET_NODES = Array.from({ length: 30 }, (_, index) => index);
const NORM_TICKS = ["-2σ", "-1σ", "μ", "+1σ", "+2σ"];
const SCENARIO_CONNECTIONS = [
  { label: "F03", target: "Partner fit" },
  { label: "F12", target: "Career pivot" },
  { label: "F21", target: "Decision drag" },
  { label: "F27", target: "Pressure load" },
];

function ProtocolVisual({ type }: { type: "measurement" | "norm" | "mapping" }) {
  if (type === "measurement") {
    return (
      <div className="fm-home-protocol-viz fm-home-protocol-viz--measurement" aria-hidden>
        <div className="fm-home-protocol-viz-head">
          <span>Sampling lattice</span>
          <span>RETINA / 30</span>
        </div>
        <div className="fm-home-facet-grid">
          {FACET_NODES.map((node) => (
            <span
              key={node}
              className={`fm-home-facet-node${node % 7 === 0 || node % 11 === 0 ? " is-highlighted" : ""}`}
            />
          ))}
        </div>
        <div className="fm-home-protocol-readout">
          <span>SCAN 084.32</span>
          <span>DELTA 0.612</span>
        </div>
      </div>
    );
  }

  if (type === "norm") {
    return (
      <div className="fm-home-protocol-viz fm-home-protocol-viz--norm" aria-hidden>
        <div className="fm-home-protocol-viz-head">
          <span>Reference ruler</span>
          <span>99.9% ACCURACY</span>
        </div>
        <div className="fm-home-norm-curve">
          <svg viewBox="0 0 220 88" className="h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 78H210" stroke="currentColor" strokeOpacity="0.18" strokeWidth="1" />
            <path
              d="M15 78C40 78 52 72 72 50C88 32 96 10 110 10C124 10 132 32 148 50C168 72 180 78 205 78"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <path d="M142 14V78" stroke="currentColor" strokeOpacity="0.55" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx="142" cy="42" r="4" fill="currentColor" />
          </svg>
        </div>
        <div className="fm-home-norm-ticks">
          {NORM_TICKS.map((tick) => (
            <span key={tick}>{tick}</span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="fm-home-protocol-viz fm-home-protocol-viz--mapping" aria-hidden>
      <div className="fm-home-protocol-viz-head">
        <span>Topology routing</span>
        <span>ACTIONABLE</span>
      </div>
      <div className="fm-home-topology">
        <div className="fm-home-topology-spine" />
        {SCENARIO_CONNECTIONS.map((connection, index) => (
          <div key={connection.label} className="fm-home-topology-row" style={{ ["--row-index" as string]: index }}>
            <span className="fm-home-topology-node">{connection.label}</span>
            <span className="fm-home-topology-link" />
            <span className="fm-home-topology-target">{connection.target}</span>
          </div>
        ))}
      </div>
      <div className="fm-home-protocol-readout">
        <span>SYNC 03.19.26</span>
        <span>READY</span>
      </div>
    </div>
  );
}

const PROTOCOLS = {
  en: {
    kicker: "THE ARCHITECT PROTOCOLS",
    title: "The Architect Protocols",
    signal: "Precision. Sovereignty. Evidence.",
    subtitle:
      "Methodology, precision, and sovereignty are wired together as operating constraints, not as soft marketing claims.",
    ticker:
      "SYNCING_REF_SET // FACET_DELTA 0.612 // RULER_LOCK 99.9% // ADAPTIVE_PROTOCOL ONLINE //",
    items: [
      {
        number: "01",
        title: "High-resolution measurement",
        description:
          "A micro 30-facet scan lattice keeps the output grounded in readable trait structure rather than broad labels.",
        footnotePrimary: "FACETS: 30",
        footnoteSecondary: "SAMPLING_RATE: HIGH",
        type: "measurement",
      },
      {
        number: "02",
        title: "Norm reference system",
        description:
          "A calibrated Gaussian slice anchors each result against 100,000+ reference samples so judgment stays relative, not isolated.",
        footnotePrimary: "NORM_SET: 100K+",
        footnoteSecondary: "Z-SCORE_ACCURACY: 99.9%",
        type: "norm",
      },
      {
        number: "03",
        title: "Scenario mapping engine",
        description:
          "Trait signals are routed into partner fit, career pivot, and decision drag outputs that can actually enter judgment chains.",
        footnotePrimary: "PROTOCOL: ADAPTIVE",
        footnoteSecondary: "ACTIONABLE_OUTPUTS",
        type: "mapping",
      },
    ],
  },
  zh: {
    kicker: "THE ARCHITECT PROTOCOLS",
    title: "三大架构协议",
    signal: "Precision. Sovereignty. Evidence.",
    subtitle: "Methodology、Precision、Sovereignty 被焊接成同一套协议底座，不是三条互不相关的营销优点。",
    ticker: "SYNCING_REF_SET // FACET_DELTA 0.612 // RULER_LOCK 99.9% // ADAPTIVE_PROTOCOL ONLINE //",
    items: [
      {
        number: "01",
        title: "高分辨率测量",
        description: "以 30-Facet 微分辨扫描阵列取代粗颗粒标签模型，输出的是可读结构，不是生活化解释。",
        footnotePrimary: "FACETS: 30",
        footnoteSecondary: "SAMPLING_RATE: HIGH",
        type: "measurement",
      },
      {
        number: "02",
        title: "常模锚定系统",
        description: "通过 100,000+ 常模参照与高斯切片定位，把结果放回统计坐标，而不是停留在孤立分数。",
        footnotePrimary: "NORM_SET: 100K+",
        footnoteSecondary: "Z-SCORE_ACCURACY: 99.9%",
        type: "norm",
      },
      {
        number: "03",
        title: "场景映射引擎",
        description: "把分面信号连接到合伙、转型与高压判断等真实输出，让数据直接进入决策链路。",
        footnotePrimary: "PROTOCOL: ADAPTIVE",
        footnoteSecondary: "ACTIONABLE_OUTPUTS",
        type: "mapping",
      },
    ],
  },
} as const;

export function ValuePropsSection({ locale }: { locale: Locale }) {
  const copy = PROTOCOLS[locale];

  return (
    <section
      data-testid="home-value-props-section"
      className="fm-home-value-props relative z-10 pb-[var(--fm-space-14)] pt-[var(--fm-space-10)] md:pb-[var(--fm-space-16)] md:pt-[var(--fm-space-14)]"
    >
      <Container className="space-y-[var(--fm-space-7)]">
        <div className="mx-auto max-w-[46rem] space-y-3 text-center">
          <p className="fm-home-section-kicker m-0">{copy.kicker}</p>
          <h2 className="m-0 text-[clamp(2rem,4vw,3.25rem)] font-semibold tracking-[-0.05em] text-[#f2f2f7]">
            {copy.title}
          </h2>
          <p className="m-0 font-mono text-[0.82rem] uppercase tracking-[0.24em] text-[#00ff41] opacity-90">{copy.signal}</p>
          <p className="mx-auto m-0 max-w-[42rem] text-[0.98rem] leading-7 text-[#aab3bf] md:text-[1.04rem]">
            {copy.subtitle}
          </p>
        </div>

        <div className="fm-home-protocol-rack">
          <div className="fm-home-protocol-bus">
            {copy.items.map((item, index) => (
              <article
                key={item.number}
                className="fm-home-protocol-module"
                style={{ ["--protocol-index" as string]: index }}
              >
                <div className="space-y-5">
                  <div className="flex items-start justify-between gap-5">
                    <div className="space-y-2">
                      <p className="m-0 font-mono text-[0.72rem] uppercase tracking-[0.24em] text-[#6f7a88]">
                        {item.number}
                      </p>
                      <h3 className="m-0 text-[1.15rem] font-semibold leading-tight tracking-[-0.03em] text-[#f2f2f7]">
                        {item.title}
                      </h3>
                    </div>

                    <div className="space-y-1 text-right">
                      <p className="m-0 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[#8c95a3]">
                        {item.footnotePrimary}
                      </p>
                      <p className="m-0 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[#00ff41] opacity-90">
                        {item.footnoteSecondary}
                      </p>
                    </div>
                  </div>

                  <p className="m-0 text-[0.92rem] leading-7 text-[#b8c1cc]">{item.description}</p>

                  <ProtocolVisual type={item.type} />
                </div>
              </article>
            ))}
          </div>

          <div className="fm-home-protocol-ticker" aria-hidden>
            <div className="fm-home-protocol-ticker-track">
              <span>{copy.ticker}</span>
              <span>{copy.ticker}</span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
