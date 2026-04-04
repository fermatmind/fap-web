import type { Locale } from "@/lib/i18n/locales";
import type { HomeResultPreview } from "@/lib/marketing/homepageContent";
import { cn } from "@/lib/utils";

type ResultsPreviewShowcaseProps = {
  locale: Locale;
  previews: HomeResultPreview[];
};

const RESULTS_COPY = {
  zh: {
    reportLabel: "结果首页",
    summaryTitle: "结构画像会先把真正影响判断的部分拉到前面。",
    summaryBody: "你看到的不是结论口号，而是结构、结论与行动顺序被整理后的第一屏。",
    reportSummaryLabel: "判断摘要",
    reportSummaryValue: "偏好结构清楚，场景反应稳定，适合先比较路径再做定向投入。",
    reportConclusionLabel: "关键结论",
    reportConclusionValue: "先看主导维度，再看场景差异，最后决定下一步验证动作。",
    structureMeta: "Structure profile",
    structureLine: "把主导特质、差异强度和判断重心放到同一个结果首页里。",
    scenarioTitle: "场景线索",
    scenarioBody: "学习、职业、协作分别呈现。",
    scenarioLines: [
      "更适合反馈清楚、结构明确的学习环境。",
      "职业判断宜先比较路径，再决定角色匹配。",
      "协作表现依赖边界是否足够清楚。",
    ],
    nextTitle: "下一步",
    nextBody: "先看什么，先讨论什么，先验证什么。",
    nextSteps: [
      "先读最强与最弱的结构差异。",
      "先对齐最相关的使用情境。",
      "先验证一个最小行动，而不是一次做完。",
    ],
  },
  en: {
    reportLabel: "Result front page",
    summaryTitle: "The structural profile pulls the decision-relevant parts to the front first.",
    summaryBody: "What comes back is not a slogan. It is the first screen of structure, conclusion, and next action already arranged for use.",
    reportSummaryLabel: "Judgment summary",
    reportSummaryValue: "Clear preference structure, stable scenario response, and a better fit for comparing paths before committing deeply.",
    reportConclusionLabel: "Key conclusion",
    reportConclusionValue: "Read the dominant axes first, then the scenario differences, then choose the next move worth validating.",
    structureMeta: "Structure profile",
    structureLine: "Dominant traits, difference strength, and decision center sit on the same report front page.",
    scenarioTitle: "Scenario cues",
    scenarioBody: "Learning, career, and collaboration read separately.",
    scenarioLines: [
      "Learning goes better with clearer structure and faster feedback.",
      "Career judgment starts by comparing paths before locking into a role.",
      "Collaboration improves when boundaries are explicit.",
    ],
    nextTitle: "Next step",
    nextBody: "What to review, discuss, and verify next.",
    nextSteps: [
      "Review the strongest and weakest structural differences first.",
      "Align on the use context that matters most now.",
      "Validate one small move before trying to decide everything.",
    ],
  },
} as const;

function StructureVisual({ metrics, locale }: { metrics: string[]; locale: Locale }) {
  return (
    <div className="fm-home-results-report">
      <div className="fm-home-results-report-topline">
        <span />
        <span />
        <span />
      </div>

      <div className="fm-home-results-report-grid">
        <div className="fm-home-results-report-graphic">
          <svg viewBox="0 0 260 220" className="fm-home-results-radar" role="presentation">
            <polygon points="130,18 208,62 208,146 130,192 52,146 52,62" className="fm-home-results-radar-ring is-outer" />
            <polygon points="130,48 188,79 188,129 130,160 72,129 72,79" className="fm-home-results-radar-ring" />
            <polygon points="130,73 166,93 166,115 130,136 94,115 94,93" className="fm-home-results-radar-ring" />
            <polygon points="130,33 196,68 182,142 130,170 81,126 84,72" className="fm-home-results-radar-shape" />
          </svg>
          <div className="fm-home-results-axis-legend">
            {metrics.map((metric, index) => (
              <div key={metric} className="fm-home-results-axis-row">
                <span>{metric}</span>
                <i className={cn(index === 0 && "is-long", index === 1 && "is-mid", index === 2 && "is-short")} />
              </div>
            ))}
          </div>
        </div>

        <div className="fm-home-results-report-copy">
          <div className="fm-home-results-report-stat">
            <label>{locale === "zh" ? "结构摘要" : "Structure summary"}</label>
            <strong>
              {locale === "zh"
                ? "主导维度清楚，场景敏感度高，判断风格偏向先收敛再投入。"
                : "Dominant axes are clear, sensitivity to context is high, and the judgment style narrows before committing."}
            </strong>
          </div>

          <div className="fm-home-results-report-note">
            <span>{locale === "zh" ? "结果首页" : "Front page"}</span>
            <p>
              {locale === "zh"
                ? "结构图、维度差异、结论摘要和后续动作落在同一屏。"
                : "Structure graph, axis differences, conclusion, and next action live on the same screen."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ResultsPreviewShowcase({ locale, previews }: ResultsPreviewShowcaseProps) {
  const copy = RESULTS_COPY[locale];
  const structure = previews[0];
  const scenario = previews[1];
  const next = previews[2];

  if (!structure || !scenario || !next) {
    return null;
  }

  return (
    <div className="fm-home-results-showcase">
      <article className="fm-home-results-main-card">
        <div className="fm-home-results-main-header">
          <div className="fm-home-results-main-copy">
            <p className="fm-home-results-overline">{copy.reportLabel}</p>
            <h3 className="fm-home-results-main-title">{copy.summaryTitle}</h3>
            <p className="fm-home-results-main-body">{copy.summaryBody}</p>
          </div>

          <div className="fm-home-results-main-summary">
            <div className="fm-home-results-summary-block">
              <span>{copy.reportSummaryLabel}</span>
              <strong>{copy.reportSummaryValue}</strong>
            </div>
            <div className="fm-home-results-summary-block">
              <span>{copy.reportConclusionLabel}</span>
              <strong>{copy.reportConclusionValue}</strong>
            </div>
          </div>
        </div>

        <div className="fm-home-results-main-grid">
          <StructureVisual metrics={structure.metrics} locale={locale} />

          <div className="fm-home-results-main-side">
            <div className="fm-home-results-insight-card fm-home-results-insight-card--lead">
              <p>{copy.structureMeta}</p>
              <strong>{copy.structureLine}</strong>
            </div>
            <div className="fm-home-results-insight-list">
              {structure.metrics.map((metric, index) => (
                <div key={metric} className="fm-home-results-insight-row">
                  <span className="fm-home-results-step-index">0{index + 1}</span>
                  <div>
                    <strong>{metric}</strong>
                    <p>
                      {index === 0
                        ? locale === "zh"
                          ? "先看判断重心。"
                          : "Read the decision center first."
                        : index === 1
                          ? locale === "zh"
                            ? "再看差异强度。"
                            : "Then read strength of difference."
                          : locale === "zh"
                            ? "最后看环境反应。"
                            : "Finish with environment response."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </article>

      <div className="fm-home-results-side-column">
        <article className="fm-home-results-side-card">
          <div className="fm-home-results-side-copy">
            <p className="fm-home-results-side-kicker">{copy.scenarioTitle}</p>
            <h3>{copy.scenarioBody}</h3>
          </div>
          <div className="fm-home-results-side-list">
            {scenario.metrics.map((metric, index) => (
              <div key={metric} className="fm-home-results-side-list-row">
                <strong>{metric}</strong>
                <p>{copy.scenarioLines[index]}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="fm-home-results-side-card">
          <div className="fm-home-results-side-copy">
            <p className="fm-home-results-side-kicker">{copy.nextTitle}</p>
            <h3>{copy.nextBody}</h3>
          </div>
          <ol className="fm-home-results-next-list">
            {copy.nextSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </article>
      </div>
    </div>
  );
}
