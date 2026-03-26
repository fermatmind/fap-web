import { Container } from "@/components/layout/Container";
import type { Locale } from "@/lib/i18n/locales";

type IconProps = {
  className?: string;
};

function MatrixIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="7" y="7" width="34" height="34" rx="6" stroke="currentColor" strokeWidth="1.8" />
      <path d="M18 7V41M30 7V41M7 18H41M7 30H41" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="18" cy="18" r="2.2" fill="currentColor" />
      <circle cx="30" cy="30" r="2.2" fill="currentColor" />
      <circle cx="30" cy="18" r="2.2" fill="currentColor" />
    </svg>
  );
}

function NormIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M8 37H40" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 37C17 37 18 29 24 29C30 29 31 11 36 11" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="28" cy="22" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M28 8V40" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 4" />
    </svg>
  );
}

function ScenarioIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M10 14H18V22H10V14ZM20 26H28V34H20V26ZM30 14H38V22H30V14Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M18 18H24V30M24 18H30" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="24" cy="18" r="2.2" fill="currentColor" />
      <circle cx="24" cy="30" r="2.2" fill="currentColor" />
    </svg>
  );
}

const PROTOCOLS = {
  en: {
    kicker: "The Fermat Protocols",
    title: "The Fermat Protocols",
    subtitle:
      "Three protocol pillars for decision-grade self-knowledge. Methodology, precision, and sovereignty are treated as operating constraints, not marketing claims.",
    items: [
      {
        number: "01",
        title: "High-resolution measurement",
        description:
          "A 30-facet matrix that goes beyond coarse labels. The output is a readable structure, not a personality sticker.",
        footnote: "Facets: 30",
        Icon: MatrixIcon,
      },
      {
        number: "02",
        title: "Norm-referenced precision",
        description:
          "100,000+ reference samples keep each result grounded in relative position instead of isolated scores or intuition.",
        footnote: "Norm set: 100k+",
        Icon: NormIcon,
      },
      {
        number: "03",
        title: "Scenario mapping engine",
        description:
          "Trait signals are translated into partner fit, career transition risk, and high-pressure decision contexts you can actually use.",
        footnote: "Protocol: Scenario mapping",
        Icon: ScenarioIcon,
      },
    ],
  },
  zh: {
    kicker: "三大架构协议",
    title: "三大架构协议",
    subtitle: "Methodology、Precision、Sovereignty 被当成系统约束，而不是营销形容词。费马协议，不把结果停留在标签层。",
    items: [
      {
        number: "01",
        title: "高分辨率测量",
        description: "30-Facet 分面矩阵，不停留在粗标签模型。输出的不是标签，而是可细读的特质结构。",
        footnote: "Facets: 30",
        Icon: MatrixIcon,
      },
      {
        number: "02",
        title: "常模锚定系统",
        description: "100,000+ 样本常模参照，结果不是孤立分数，而是坐标校准。让判断回到相对位置，而非绝对幻觉。",
        footnote: "Norm set: 100k+",
        Icon: NormIcon,
      },
      {
        number: "03",
        title: "场景映射引擎",
        description: "将特质直接映射至真实场景：合伙拟合、职业转型风险、高压决策逻辑。让数据成为可执行的认知资产。",
        footnote: "Protocol: Scenario mapping",
        Icon: ScenarioIcon,
      },
    ],
  },
} as const;

export function ValuePropsSection({ locale }: { locale: Locale }) {
  const copy = PROTOCOLS[locale];

  return (
    <section
      data-testid="home-value-props-section"
      className="fm-home-value-props relative z-10 pb-[var(--fm-space-14)] pt-[var(--fm-space-8)] md:pb-[var(--fm-space-16)] md:pt-[var(--fm-space-12)]"
    >
      <Container className="space-y-[var(--fm-space-6)]">
        <div className="mx-auto max-w-[48rem] space-y-3 text-center">
          <p className="fm-home-section-kicker m-0">{copy.kicker}</p>
          <h2 className="m-0 text-[clamp(2rem,4vw,3rem)] font-semibold tracking-[-0.045em] text-[#10161f]">
            {copy.title}
          </h2>
          <p className="m-0 text-[0.98rem] leading-7 text-[#53606e] md:text-[1.04rem]">{copy.subtitle}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
          {copy.items.map((item) => {
            const Icon = item.Icon;

            return (
              <article key={item.number} className="fm-home-proof-card fm-home-protocol-card group">
                <div className="flex h-full flex-col gap-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3">
                      <p className="m-0 font-mono text-[0.78rem] uppercase tracking-[0.22em] text-[#7d8796]">
                        {item.number}
                      </p>
                      <h3 className="m-0 text-[1.28rem] font-semibold leading-tight tracking-[-0.03em] text-[#0b0f14]">
                        {item.title}
                      </h3>
                    </div>

                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-[0.95rem] border border-[#d4d8df] bg-[#eef1f5] text-[#0b0f14]">
                      <Icon className="h-6 w-6" />
                    </span>
                  </div>

                  <p className="m-0 text-sm leading-7 text-[#4f5c69]">{item.description}</p>

                  <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#d7dce3] pt-4">
                    <span className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-[#697381]">
                      {item.footnote}
                    </span>
                    <span className="fm-home-protocol-accent" aria-hidden />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
