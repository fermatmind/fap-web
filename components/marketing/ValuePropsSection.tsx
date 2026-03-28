import { Container } from "@/components/layout/Container";
import type { Locale } from "@/lib/i18n/locales";

const FACET_NODES = Array.from({ length: 30 }, (_, index) => index);
const NORM_TICKS = ["-2σ", "-1σ", "M", "+1σ", "+2σ"];
const SCENARIO_CONNECTIONS = [
  {
    label: "F03",
    target: { en: "Partner fit", zh: "关系匹配" },
  },
  {
    label: "F12",
    target: { en: "Career pivot", zh: "职业转向" },
  },
  {
    label: "F21",
    target: { en: "Decision drag", zh: "决策阻滞" },
  },
  {
    label: "F27",
    target: { en: "Pressure load", zh: "压力负荷" },
  },
];

function ProtocolVisual({
  type,
  locale,
}: {
  type: "measurement" | "norm" | "mapping";
  locale: Locale;
}) {
  const copy = {
    measurement: {
      head: locale === "zh" ? "30-Facet 节点阵列" : "30-facet matrix",
      meta: locale === "zh" ? "SCAN_DEPTH: HIGH" : "SCAN_DEPTH: HIGH",
      readoutA: "SAMPLE_RATE: HIGH",
      readoutB: "TRACEABLE_STATE: ENABLED",
    },
    norm: {
      head: locale === "zh" ? "常模定位曲线" : "Norm reference curve",
      meta: locale === "zh" ? "Z-SCORE: ACTIVE" : "Z-SCORE: ACTIVE",
    },
    mapping: {
      head: locale === "zh" ? "规则映射拓扑" : "Scenario topology",
      meta: locale === "zh" ? "ACTIONABLE_OUTPUTS" : "ACTIONABLE_OUTPUTS",
      readoutA: "RULE_LOCK: 99.9",
      readoutB: "OUTPUT_MODE: ACTIONABLE",
    },
  } as const;

  if (type === "measurement") {
    return (
      <div className="fm-home-core-visual fm-home-core-visual--measurement" aria-hidden>
        <div className="fm-home-core-visual-head">
          <span>{copy.measurement.head}</span>
          <span>{copy.measurement.meta}</span>
        </div>
        <div className="fm-home-core-facet-grid">
          {FACET_NODES.map((node) => (
            <span
              key={node}
              className={`fm-home-core-facet-node${node % 7 === 0 || node % 11 === 0 ? " is-active" : ""}`}
            />
          ))}
        </div>
        <div className="fm-home-core-visual-foot">
          <span>{copy.measurement.readoutA}</span>
          <span>{copy.measurement.readoutB}</span>
        </div>
      </div>
    );
  }

  if (type === "norm") {
    return (
      <div className="fm-home-core-visual fm-home-core-visual--norm" aria-hidden>
        <div className="fm-home-core-visual-head">
          <span>{copy.norm.head}</span>
          <span>{copy.norm.meta}</span>
        </div>
        <div className="fm-home-core-norm-curve">
          <svg viewBox="0 0 220 92" className="h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 78H210" stroke="currentColor" strokeOpacity="0.14" strokeWidth="1" />
            <path
              d="M15 78C40 78 52 70 72 50C90 28 98 12 110 12C122 12 130 28 148 50C168 70 180 78 205 78"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <path d="M142 15V79" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx="142" cy="40" r="4" fill="currentColor" />
          </svg>
        </div>
        <div className="fm-home-core-norm-ticks">
          {NORM_TICKS.map((tick) => (
            <span key={tick}>{tick}</span>
          ))}
        </div>
        <div className="fm-home-core-visual-foot">
          <span>NORM_REFERENCED</span>
          <span>STABILITY_CHECK: PASS</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fm-home-core-visual fm-home-core-visual--mapping" aria-hidden>
      <div className="fm-home-core-visual-head">
        <span>{copy.mapping.head}</span>
        <span>{copy.mapping.meta}</span>
      </div>
      <div className="fm-home-core-topology">
        <div className="fm-home-core-topology-spine" />
        {SCENARIO_CONNECTIONS.map((connection, index) => (
          <div key={connection.label} className="fm-home-core-topology-row" style={{ ["--row-index" as string]: index }}>
            <span className="fm-home-core-topology-node">{connection.label}</span>
            <span className="fm-home-core-topology-link" />
            <span className="fm-home-core-topology-target">{connection.target[locale]}</span>
          </div>
        ))}
      </div>
      <div className="fm-home-core-visual-foot">
        <span>{copy.mapping.readoutA}</span>
        <span>{copy.mapping.readoutB}</span>
      </div>
    </div>
  );
}

const PROTOCOLS = {
  en: {
    entryLabel: "[ ENTERING CORE PROTOCOL ZONE ]",
    kicker: "THE FERMAT PROTOCOLS / CORE ARCHITECTURE",
    title: "The Architect Protocols",
    subtitle:
      "These are not three separate selling points. They are the underlying structure that makes one measurement system possible.",
    summary:
      "From explainable, to actionable, to reviewable. FermatMind delivers judgment protocols, not label outputs.",
    items: [
      {
        number: "BAY-01",
        title: "High-resolution measurement",
        description:
          "Replace coarse personality labels with a 30-facet scan matrix so the system sees readable structure before it names anything.",
        footnotePrimary: "FACETS: 30",
        footnoteSecondary: "SCAN_DEPTH: HIGH",
        type: "measurement",
      },
      {
        number: "BAY-02",
        title: "Norm reference system",
        description:
          "A calibrated Gaussian slice keeps every score positioned against a large reference set, so interpretation stays relative and stable.",
        footnotePrimary: "NORM_SET: 100K+",
        footnoteSecondary: "Z-SCORE: ACTIVE",
        type: "norm",
      },
      {
        number: "BAY-03",
        title: "Scenario mapping engine",
        description:
          "Trait signals do not stop at description. They are routed into partner-fit, risk-load, and decision contexts that can actually be used.",
        footnotePrimary: "SCENARIO_ROUTER",
        footnoteSecondary: "ACTIONABLE_OUTPUTS",
        type: "mapping",
      },
    ],
  },
  zh: {
    entryLabel: "[ ENTERING CORE PROTOCOL ZONE ]",
    kicker: "THE FERMAT PROTOCOLS / CORE ARCHITECTURE",
    title: "三大架构协议",
    subtitle: "这不是三套不同的卖点，而是同一套测量系统得以成立的底层结构。",
    summary: "从可解释，到可执行，再到可复盘。费马测试交付的不是结果标签，而是判断协议。",
    items: [
      {
        number: "BAY-01",
        title: "高分辨率测量",
        description: "以 30-Facet 分面矩阵替代粗颗粒人格标签，让系统先看到结构，再命名结果。",
        footnotePrimary: "FACETS: 30",
        footnoteSecondary: "SCAN_DEPTH: HIGH",
        type: "measurement",
      },
      {
        number: "BAY-02",
        title: "常模锚定系统",
        description: "通过大规模常模参照与高斯定位切片，把结果放回动态坐标，而不是孤立地解释一个分数。",
        footnotePrimary: "NORM_SET: 100K+",
        footnoteSecondary: "Z-SCORE: ACTIVE",
        type: "norm",
      },
      {
        number: "BAY-03",
        title: "场景映射引擎",
        description: "系统不止于特质描述，而是把结构结果映射进真实任务与判断情境，形成可执行输出。",
        footnotePrimary: "SCENARIO_ROUTER",
        footnoteSecondary: "ACTIONABLE_OUTPUTS",
        type: "mapping",
      },
    ],
  },
} as const;

export function ValuePropsSection({ locale }: { locale: Locale }) {
  const copy = PROTOCOLS[locale];

  return (
    <section data-testid="home-value-props-section" className="fm-home-core">
      <div className="fm-home-core-entryline">
        <span className="fm-home-core-entryline-rule" aria-hidden />
        <span className="fm-home-core-entryline-label">{copy.entryLabel}</span>
      </div>

      <Container className="fm-home-core-shell max-w-[84rem] px-5 md:px-8 lg:px-10">
        <div className="fm-home-core-head">
          <p className="fm-home-core-kicker m-0">{copy.kicker}</p>
          <h2 className="fm-home-core-title m-0">{copy.title}</h2>
          <p className="fm-home-core-subtitle m-0">{copy.subtitle}</p>
        </div>

        <div className="fm-home-core-machine">
          <div className="fm-home-core-machine-head">
            <span>RACK_STATUS: SEALED</span>
            <span>CORE_ARCHITECTURE: LIVE</span>
          </div>

          <div className="fm-home-core-bays">
            {copy.items.map((item, index) => (
              <article key={item.number} className="fm-home-core-bay" style={{ ["--bay-index" as string]: index }}>
                <div className="fm-home-core-bay-top">
                  <div className="fm-home-core-bay-heading">
                    <span className="fm-home-core-bay-number">{item.number}</span>
                    <h3 className="fm-home-core-bay-title m-0">{item.title}</h3>
                  </div>
                  <div className="fm-home-core-bay-tags">
                    <span>{item.footnotePrimary}</span>
                    <span>{item.footnoteSecondary}</span>
                  </div>
                </div>

                <p className="fm-home-core-bay-copy m-0">{item.description}</p>
                <ProtocolVisual type={item.type} locale={locale} />
              </article>
            ))}
          </div>
        </div>

        <p className="fm-home-core-summary m-0">{copy.summary}</p>
      </Container>
    </section>
  );
}
