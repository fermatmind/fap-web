import Link from "next/link";
import { Container } from "@/components/layout/Container";
import type { Locale } from "@/lib/i18n/locales";
import { localizedPath } from "@/lib/i18n/locales";

export type HomeHighlightedCard =
  | {
      kind: "live";
      slug: string;
      title: string;
      description: string;
      category: string;
      tags: string[];
      questionsCount: number;
      timeMinutes: number;
      footnote: string;
    }
  | {
      kind: "coming_soon";
      id: string;
      title: string;
      description: string;
    };

const SECTION_COPY = {
  en: {
    kicker: "Decision Entry Matrix",
    title: "Decision Entry Matrix",
    subtitle:
      "This is not about choosing a fun test. It is about choosing the right judgment module for the decision you are actually making.",
    cta: "[ ACTIVATE_PROTOCOL ]",
    bandwidth: "Bandwidth",
    nodeActive: "NODE_SCAN_ACTIVE",
    rackMeta: ["RACK_STATUS: ACTIVE", "GRID: 3 X 2", "MODULES: 6"],
  },
  zh: {
    kicker: "决策入口矩阵",
    title: "决策入口矩阵",
    subtitle: "不是选择一个“好玩的测试”，而是进入一个更适合当前问题的判断模块。",
    cta: "[ ACTIVATE_PROTOCOL ]",
    bandwidth: "带宽",
    nodeActive: "NODE_SCAN_ACTIVE",
    rackMeta: ["RACK_STATUS: ACTIVE", "GRID: 3 X 2", "MODULES: 6"],
  },
} as const;

const CARD_SYSTEM_META = {
  "mbti-personality-test-16-personality-types": {
    typeCode: "MBTI",
    modeCode: "ROLE-FIT",
    protocolCode: "TEAM_ROLE_ROUTER",
    slotCode: "R1-C1",
    complexity: 3,
    signalLabel: {
      en: "Collaboration role routing",
      zh: "协作角色路由",
    },
    question: {
      en: "Which collaboration role should you trust when team dynamics and role ownership start to blur?",
      zh: "当团队角色与分工开始模糊时，你更适合承担怎样的位置？",
    },
  },
  "big-five-personality-test-ocean-model": {
    typeCode: "OCEAN",
    modeCode: "LONG-TERM",
    protocolCode: "TRAIT_COORDINATE_LOCK",
    slotCode: "R1-C2",
    complexity: 4,
    signalLabel: {
      en: "Long-horizon trait coordinates",
      zh: "长期特质坐标",
    },
    question: {
      en: "Which stable traits should anchor long-term education and career decisions before you commit to a path?",
      zh: "当你在做长期教育与职业规划时，哪些稳定特质更值得作为底层坐标？",
    },
  },
  "clinical-depression-anxiety-assessment-professional-edition": {
    typeCode: "CLINICAL",
    modeCode: "RISK-SCAN",
    protocolCode: "PRESSURE_PRIORITY_SCAN",
    slotCode: "R1-C3",
    complexity: 4,
    signalLabel: {
      en: "Pressure and risk calibration",
      zh: "压力与风险校准",
    },
    question: {
      en: "When pressure rises, which emotional and support risks should be judged first instead of guessed at?",
      zh: "当压力持续升高时，情绪风险与支持优先级应当先看哪里？",
    },
  },
  "depression-screening-test-standard-edition": {
    typeCode: "BASELINE",
    modeCode: "STATE-CHECK",
    protocolCode: "RECENT_BASELINE_CHECK",
    slotCode: "R2-C1",
    complexity: 2,
    signalLabel: {
      en: "Recent state calibration",
      zh: "近期状态校准",
    },
    question: {
      en: "Has your recent emotional baseline shifted far enough that extra support should be considered now?",
      zh: "近期情绪基线是否已经偏移到需要额外支持的程度？",
    },
  },
  "iq-test-intelligence-quotient-assessment": {
    typeCode: "REASONING",
    modeCode: "COGNITION",
    protocolCode: "ABSTRACT_REASONING_CHECK",
    slotCode: "R2-C2",
    complexity: 3,
    signalLabel: {
      en: "Pattern and reasoning load",
      zh: "模式与推理负载",
    },
    question: {
      en: "Does your current pattern recognition and abstract reasoning strength match the difficulty of the path ahead?",
      zh: "当前的模式识别与抽象推理能力，是否足以支撑你面前的学习或岗位难度？",
    },
  },
  "eq-test-emotional-intelligence-assessment": {
    typeCode: "REGULATION",
    modeCode: "RELATION",
    protocolCode: "RELATION_REGULATION_CHECK",
    slotCode: "R2-C3",
    complexity: 3,
    signalLabel: {
      en: "Emotion and relationship regulation",
      zh: "情绪与关系调度",
    },
    question: {
      en: "Can your current self-awareness and relationship regulation capacity sustain higher-stakes collaboration?",
      zh: "你的自我觉察与关系调节能力，是否足以支撑更复杂的协作情境？",
    },
  },
} as const;

function renderComplexityBars(level: number) {
  return Array.from({ length: 5 }, (_, index) => index < level);
}

export function HighlightedTestsSection({
  locale,
  cards,
}: {
  locale: Locale;
  cards: HomeHighlightedCard[];
}) {
  const withLocale = (path: string) => localizedPath(path, locale);
  const copy = SECTION_COPY[locale];

  return (
    <section
      id="home-highlighted-tests-section"
      data-testid="home-highlighted-tests-section"
      className="fm-home-tests relative py-[var(--fm-section-y-lg)] text-[var(--fm-text)]"
    >
      <Container className="relative z-10">
        <div className="fm-home-matrix-shell mx-auto max-w-[80rem] px-[var(--fm-space-4)] pb-[var(--fm-space-8)] pt-[var(--fm-space-9)] md:px-[var(--fm-space-6)] md:pb-[var(--fm-space-9)] md:pt-[var(--fm-space-10)]">
          <div className="mx-auto max-w-[46rem] space-y-3 text-center">
            <p className="fm-home-section-kicker m-0">{copy.kicker}</p>
            <h2 className="m-0 text-[clamp(2rem,4vw,3rem)] font-semibold tracking-[-0.045em] text-[#0b0f14]">
              {copy.title}
            </h2>
            <p className="m-0 text-[0.98rem] leading-7 text-[#55616e] md:text-[1.04rem]">{copy.subtitle}</p>
          </div>

          <div className="fm-home-matrix-head-meta" aria-hidden>
            {copy.rackMeta.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>

          <div className="fm-home-matrix-grid mt-[var(--fm-space-7)]">
            {cards.map((card) => {
              if (card.kind !== "live") {
                return null;
              }

              const systemMeta = CARD_SYSTEM_META[card.slug as keyof typeof CARD_SYSTEM_META];
              const complexityBars = renderComplexityBars(systemMeta?.complexity ?? 3);

              return (
                <article key={card.slug} className="fm-home-test-card group flex h-full flex-col">
                  <div className="fm-home-test-slot-status">
                      <span>{`TYPE: ${systemMeta?.typeCode ?? "CORE"}`}</span>
                      <span>{`MODE: ${systemMeta?.modeCode ?? "SCAN"}`}</span>
                      <span>{`ITEMS: ${card.questionsCount}`}</span>
                  </div>

                  <div className="fm-home-test-card-body mt-4 space-y-4">
                    <div className="fm-home-test-card-head">
                      <p className="fm-home-test-signal-label m-0">
                        {systemMeta?.signalLabel[locale] ?? card.category}
                      </p>
                      <span className="fm-home-test-slot-id">{systemMeta?.slotCode ?? "R1-C1"}</span>
                    </div>

                    <Link
                      href={withLocale(`/tests/${card.slug}`)}
                      title={card.title}
                      className="fm-home-test-card-title inline-flex text-[1.5rem] font-semibold leading-tight tracking-[-0.04em] text-[#0b0f14] transition hover:text-[#0b0f14]"
                    >
                      {card.title}
                    </Link>
                    <p className="fm-home-test-card-question m-0">
                      {systemMeta?.question[locale] ?? card.description}
                    </p>
                    <p className="fm-home-test-card-signals m-0">{`SIGNALS / ${card.tags.join(" / ")}`}</p>
                  </div>

                  <div className="fm-home-test-slot-ruler mt-5">
                    <span className="fm-home-test-slot-ruler-label">{copy.bandwidth}</span>
                    <div className="fm-home-test-slot-ruler-bars" aria-hidden>
                      {complexityBars.map((isActive, index) => (
                        <span
                          key={`${card.slug}-complexity-${index}`}
                          className={`fm-home-test-slot-ruler-bar${isActive ? " is-active" : ""}`}
                        />
                      ))}
                    </div>
                    <span className="fm-home-test-slot-ruler-mode">{`TIME ${card.timeMinutes} MIN`}</span>
                  </div>

                  <div className="fm-home-test-card-footer mt-auto flex items-center justify-between gap-3 border-t border-[#d0d5dc] pt-4">
                    <div className="fm-home-test-card-meta font-mono text-[0.66rem] uppercase tracking-[0.16em] text-[#6d7682]">
                      <span>{`PROTOCOL: ${systemMeta?.protocolCode ?? "CORE_SCAN"}`}</span>
                      <span className="mx-2 text-[#9ea6b1]">{"//"}</span>
                      <span>{`SLOT: ${systemMeta?.slotCode ?? "R1-C1"}`}</span>
                    </div>

                    <Link
                      href={withLocale(`/tests/${card.slug}/take`)}
                      className="fm-home-test-card-cta inline-flex items-center gap-2 text-[0.76rem] font-semibold text-[#0b0f14]"
                    >
                      {copy.cta}
                    </Link>
                  </div>

                  <div className="fm-home-test-slot-coordinate" aria-hidden>
                    <span>{copy.nodeActive}</span>
                    <span>{`[ ${systemMeta?.slotCode ?? "R1-C1"} ]`}</span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
