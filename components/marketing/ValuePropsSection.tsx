import { Container } from "@/components/layout/Container";
import type { Locale } from "@/lib/i18n/locales";

const FACET_NODES = Array.from({ length: 30 }, (_, index) => index);
const NORM_TICKS = ["-2σ", "-1σ", "M", "+1σ", "+2σ"];
const SCENARIO_CONNECTIONS = [
  {
    label: "Learning",
    target: { en: "Learning strategy", zh: "学习策略" },
  },
  {
    label: "Career",
    target: { en: "Career direction", zh: "职业方向" },
  },
  {
    label: "Teamwork",
    target: { en: "Collaboration style", zh: "协作风格" },
  },
  {
    label: "Pressure",
    target: { en: "Support priority", zh: "支持优先级" },
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
      head: locale === "zh" ? "30 分面结构视图" : "30-facet structure view",
      meta: locale === "zh" ? "用于细化特质理解" : "Built for granular understanding",
      readoutA: locale === "zh" ? "保持分面可见" : "Facet visibility retained",
      readoutB: locale === "zh" ? "支持复盘与讨论" : "Supports review and discussion",
    },
    norm: {
      head: locale === "zh" ? "常模参照曲线" : "Norm-referenced curve",
      meta: locale === "zh" ? "提供相对语境" : "Provides relative context",
    },
    mapping: {
      head: locale === "zh" ? "场景解释路径" : "Scenario interpretation paths",
      meta: locale === "zh" ? "连接真实决策问题" : "Connected to real decisions",
      readoutA: locale === "zh" ? "学习 / 职业 / 协作" : "Learning / Career / Teamwork",
      readoutB: locale === "zh" ? "输出可执行建议" : "Actionable recommendations",
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
          <span>{locale === "zh" ? "基于常模语境" : "Norm-referenced context"}</span>
          <span>{locale === "zh" ? "避免孤立解读" : "Avoid isolated interpretation"}</span>
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
    entryLabel: "How FermatMind works",
    kicker: "Method overview",
    title: "From assessment to decision support",
    subtitle:
      "The product is built as one coherent workflow: structured measurement, norm context, and scenario interpretation.",
    summary:
      "You get results that are interpretable, discussable, and reviewable. They support decisions without claiming certainty.",
    items: [
      {
        number: "Step 1",
        title: "Structured measurement",
        description:
          "Use 30 facets to preserve nuance before drawing conclusions, so interpretation is based on structure rather than one coarse label.",
        footnotePrimary: "30 facets",
        footnoteSecondary: "Granular profile",
        type: "measurement",
      },
      {
        number: "Step 2",
        title: "Norm-referenced context",
        description:
          "Place scores in relative context against a larger reference set, which helps avoid over-interpreting one absolute number.",
        footnotePrimary: "Norm context",
        footnoteSecondary: "Relative interpretation",
        type: "norm",
      },
      {
        number: "Step 3",
        title: "Scenario interpretation",
        description:
          "Translate trait signals into practical scenarios such as learning direction, collaboration style, and career decisions.",
        footnotePrimary: "Decision scenarios",
        footnoteSecondary: "Actionable outputs",
        type: "mapping",
      },
    ],
  },
  zh: {
    entryLabel: "FermatMind 的工作方式",
    kicker: "方法说明",
    title: "从测评到决策支持",
    subtitle: "产品采用同一套连续流程：结构化测量、常模语境、场景解释。",
    summary: "结果强调可解释、可讨论、可复盘，用于支持判断，而不是替代判断。",
    items: [
      {
        number: "步骤 1",
        title: "结构化测量",
        description: "用 30 个分面保留细节，再进入解释阶段，避免被单一标签过度简化。",
        footnotePrimary: "30 个分面",
        footnoteSecondary: "细粒度画像",
        type: "measurement",
      },
      {
        number: "步骤 2",
        title: "常模参照语境",
        description: "把结果放回相对语境，降低对单个绝对分数的误读风险。",
        footnotePrimary: "常模语境",
        footnoteSecondary: "相对解释",
        type: "norm",
      },
      {
        number: "步骤 3",
        title: "场景化解释",
        description: "把结构结果连接到学习、职业与协作等真实问题，形成可执行的下一步建议。",
        footnotePrimary: "决策场景",
        footnoteSecondary: "可执行输出",
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
            <span>{locale === "zh" ? "结构化流程" : "Structured workflow"}</span>
            <span>{locale === "zh" ? "从测量到解释" : "From measurement to interpretation"}</span>
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
