"use client";

import { useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n/locales";
import type { HomeResultPreview } from "@/lib/marketing/homepageContent";
import { cn } from "@/lib/utils";

type ToneKey = HomeResultPreview["tone"];

type ResultsPreviewShowcaseProps = {
  locale: Locale;
  previews: HomeResultPreview[];
};

const RESULTS_COPY = {
  zh: {
    reportLabel: "结果概览",
    reportMeta: "结构 / 场景 / 下一步",
    mainByTone: {
      traits: {
        title: "特质结构如何影响判断",
        body: "把稳定倾向、判断节奏和协作偏好压进一张报告首页。",
        cards: [
          { label: "结构画像", value: "稳定倾向的主次关系更清楚" },
          { label: "场景线索", value: "知道哪些环境更容易放大优势" },
          { label: "下一步建议", value: "先从最该验证的方向继续" },
        ],
      },
      career: {
        title: "哪里更容易放大优势",
        body: "把学习、职业和协作放进同一张场景图。",
        cards: [
          { label: "结构画像", value: "看见哪些特质正在主导判断方式" },
          { label: "场景线索", value: "把学习、职业、协作分开判断" },
          { label: "下一步建议", value: "先继续最值得验证的一条路径" },
        ],
      },
      state: {
        title: "下一步从哪里开始更值",
        body: "把要看、要谈、要验证的动作收成起步顺序。",
        cards: [
          { label: "结构画像", value: "保留影响决策的核心结构" },
          { label: "场景线索", value: "先把使用情境缩到最相关的几类" },
          { label: "下一步建议", value: "给出三条最值钱的起步动作" },
        ],
      },
    },
    sceneCard: {
      title: "场景映射",
      body: "学习 / 职业 / 协作中的典型表现",
      lines: [
        "学习时更依赖结构清晰、反馈及时的环境。",
        "职业判断更适合先比较路径，再讨论角色匹配。",
        "协作场景里，分工边界越清楚，表现越稳定。",
      ],
    },
    nextCard: {
      title: "下一步",
      body: "先看什么、先讨论什么、先验证什么",
      steps: [
        "先看最强与最弱的结构差异。",
        "先讨论哪一种情境最值得继续投入。",
        "先验证一个最小行动，而不是一次做完。",
      ],
    },
  },
  en: {
    reportLabel: "Result overview",
    reportMeta: "Structure / Scenarios / Next steps",
    mainByTone: {
      traits: {
        title: "How structure changes judgment",
        body: "Stable tendencies, judgment rhythm, and collaboration cues sit inside one report surface.",
        cards: [
          { label: "Structure profile", value: "The dominant and secondary patterns become easier to discuss" },
          { label: "Scenario cues", value: "The environments that amplify strengths stand out faster" },
          { label: "Next step", value: "Keep moving with the first path worth validating" },
        ],
      },
      career: {
        title: "Where strengths scale more easily",
        body: "Learning, career, and collaboration sit inside one scenario map.",
        cards: [
          { label: "Structure profile", value: "See which traits are leading the way judgment happens" },
          { label: "Scenario cues", value: "Read learning, career, and collaboration separately" },
          { label: "Next step", value: "Carry forward the path worth testing first" },
        ],
      },
      state: {
        title: "Where the next move should start",
        body: "What to review, discuss, and verify gets compressed into a starting sequence.",
        cards: [
          { label: "Structure profile", value: "Keep only the core structure that changes decisions" },
          { label: "Scenario cues", value: "Narrow the use context to the most relevant few" },
          { label: "Next step", value: "Start with three actions that actually move the decision" },
        ],
      },
    },
    sceneCard: {
      title: "Scenario mapping",
      body: "Typical patterns across learning, career, and collaboration",
      lines: [
        "Learning goes better with clearer structure and faster feedback loops.",
        "Career judgment starts by comparing paths before locking into a role.",
        "Collaboration improves when ownership and boundaries are explicit.",
      ],
    },
    nextCard: {
      title: "Next steps",
      body: "What to review, what to discuss, what to verify",
      steps: [
        "Review the strongest and weakest structural differences first.",
        "Discuss which situation is worth deeper attention now.",
        "Verify one small move before scaling the decision.",
      ],
    },
  },
} as const;

function TraitsVisual({ metrics, locale }: { metrics: string[]; locale: Locale }) {
  return (
    <div className="fm-home-results-surface fm-home-results-surface--traits" aria-hidden>
      <div className="fm-home-results-surface-header">
        <span>{locale === "zh" ? "结构总览" : "Structure view"}</span>
        <span>{locale === "zh" ? "标准参照" : "Normed reference"}</span>
      </div>
      <div className="fm-home-results-surface-grid">
        <svg viewBox="0 0 220 180" className="fm-home-results-radar" role="presentation">
          <polygon points="110,18 176,56 176,124 110,162 44,124 44,56" className="fm-home-results-radar-ring is-outer" />
          <polygon points="110,42 160,69 160,111 110,138 60,111 60,69" className="fm-home-results-radar-ring" />
          <polygon points="110,64 143,82 143,98 110,116 77,98 77,82" className="fm-home-results-radar-ring" />
          <polygon points="110,28 171,61 157,124 110,144 74,110 70,60" className="fm-home-results-radar-shape" />
        </svg>

        <div className="fm-home-results-metric-stack">
          {metrics.map((metric, index) => (
            <div key={metric} className="fm-home-results-metric-row">
              <span>{metric}</span>
              <i className={cn(index === 0 && "is-long", index === 1 && "is-mid", index === 2 && "is-short")} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScenarioVisual({ metrics, locale }: { metrics: string[]; locale: Locale }) {
  const notes =
    locale === "zh"
      ? ["需要清晰反馈", "更看重路径感", "依赖分工边界"]
      : ["Needs clearer feedback", "Responds to path clarity", "Depends on role boundaries"];

  return (
    <div className="fm-home-results-surface fm-home-results-surface--scenario" aria-hidden>
      <div className="fm-home-results-surface-header">
        <span>{locale === "zh" ? "场景映射" : "Scenario map"}</span>
        <span>{locale === "zh" ? "典型表现" : "Observed pattern"}</span>
      </div>
      <div className="fm-home-results-scenario-stack">
        {metrics.map((metric, index) => (
          <div key={metric} className="fm-home-results-scenario-row">
            <div>
              <strong>{metric}</strong>
              <p>{notes[index]}</p>
            </div>
            <span className={cn("fm-home-results-scenario-meter", index === 0 && "is-long", index === 1 && "is-mid", index === 2 && "is-short")} />
          </div>
        ))}
      </div>
    </div>
  );
}

function NextStepsVisual({ metrics, locale }: { metrics: string[]; locale: Locale }) {
  const details =
    locale === "zh"
      ? ["先看最强与最弱的结构差异", "先对齐最关键的使用情境", "先验证一个最小行动"]
      : ["Review the strongest and weakest differences first", "Align on the most relevant use context", "Validate one smallest useful move"];

  return (
    <div className="fm-home-results-surface fm-home-results-surface--steps" aria-hidden>
      <div className="fm-home-results-surface-header">
        <span>{locale === "zh" ? "行动顺序" : "Action order"}</span>
        <span>{locale === "zh" ? "开始判断" : "Start judging"}</span>
      </div>
      <div className="fm-home-results-steps-stack">
        {metrics.map((metric, index) => (
          <div key={metric} className="fm-home-results-step-row">
            <span className="fm-home-results-step-index">0{index + 1}</span>
            <div>
              <strong>{metric}</strong>
              <p>{details[index]}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ResultsPreviewShowcase({ locale, previews }: ResultsPreviewShowcaseProps) {
  const [activeTone, setActiveTone] = useState<ToneKey>(previews[0]?.tone ?? "traits");
  const copy = RESULTS_COPY[locale];

  const activePreview = useMemo(
    () => previews.find((preview) => preview.tone === activeTone) ?? previews[0],
    [activeTone, previews]
  );

  if (!activePreview) {
    return null;
  }

  const activeCopy = copy.mainByTone[activePreview.tone];

  return (
    <div className="fm-home-results-showcase">
      <article className="fm-home-results-main-card">
        <div className="fm-home-results-main-header">
          <div className="fm-home-results-main-copy">
            <p className="fm-home-results-overline">{copy.reportLabel}</p>
            <h3 className="fm-home-results-main-title">{activeCopy.title}</h3>
            <p className="fm-home-results-main-body">{activeCopy.body}</p>
          </div>

          <div className="fm-home-results-tablist" aria-label={copy.reportMeta}>
            {previews.map((preview) => {
              const isActive = preview.tone === activeTone;
              return (
                <button
                  key={preview.tone}
                  type="button"
                  aria-pressed={isActive}
                  className={cn("fm-home-results-tab", isActive && "is-active")}
                  onMouseEnter={() => setActiveTone(preview.tone)}
                  onFocus={() => setActiveTone(preview.tone)}
                  onClick={() => setActiveTone(preview.tone)}
                >
                  {preview.title}
                </button>
              );
            })}
          </div>
        </div>

        <div className="fm-home-results-main-grid">
          <div className="fm-home-results-visual-shell">
            {activePreview.tone === "traits" ? <TraitsVisual metrics={activePreview.metrics} locale={locale} /> : null}
            {activePreview.tone === "career" ? <ScenarioVisual metrics={activePreview.metrics} locale={locale} /> : null}
            {activePreview.tone === "state" ? <NextStepsVisual metrics={activePreview.metrics} locale={locale} /> : null}
          </div>

          <div className="fm-home-results-insight-stack">
            {activeCopy.cards.map((card) => (
              <div key={card.label} className="fm-home-results-insight-card">
                <p>{card.label}</p>
                <strong>{card.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </article>

      <div className="fm-home-results-side-column">
        <article className="fm-home-results-side-card">
          <div className="fm-home-results-side-copy">
            <p className="fm-home-results-side-kicker">{copy.sceneCard.title}</p>
            <h3>{copy.sceneCard.body}</h3>
          </div>
          <div className="fm-home-results-quote-stack">
            {copy.sceneCard.lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </article>

        <article className="fm-home-results-side-card">
          <div className="fm-home-results-side-copy">
            <p className="fm-home-results-side-kicker">{copy.nextCard.title}</p>
            <h3>{copy.nextCard.body}</h3>
          </div>
          <ol className="fm-home-results-next-list">
            {copy.nextCard.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </article>
      </div>
    </div>
  );
}
