import type { Locale } from "@/lib/i18n/locales";
import type { ArchetypeResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import styles from "./QuestionnaireResultPresentation.module.css";

type CompleteResult = Extract<ArchetypeResult, { status: "complete" }>;

function ChoiceRadar({ quiz, result }: { quiz: Questionnaire; result: Extract<ArchetypeResult, { status: "complete" }> }) {
  const point = (i: number, ratio: number) => {
    const a = (i * 2 * Math.PI / quiz.directions.length) - Math.PI / 2;
    return [100 + 81 * ratio * Math.cos(a), 100 + 81 * ratio * Math.sin(a)].join(",");
  };
  return <svg viewBox="0 0 200 200" className={styles.choiceRadar} aria-hidden="true">
    {[0.25, 0.5, 0.75, 1].map(ratio => <polygon key={ratio} points={quiz.directions.map((_, i) => point(i, ratio)).join(" ")} />)}
    {quiz.directions.map(({ id }, i) => <polyline key={id} points={`100,100 ${point(i, 1)}`} />)}
    <polygon data-choice-radar-shape points={quiz.directions.map((d, i) => point(i, d.comparisons ? result.counts[d.id] / d.comparisons : 0)).join(" ")} />
    {quiz.directions.map(({ id }, i) => {
      const [x, y] = point(i, 1.13).split(",");
      return <text key={id} x={x} y={y} textAnchor="middle" dominantBaseline="central">{i + 1}</text>;
    })}
  </svg>;
}

export function QuestionnaireArchetypeChoiceChart({ quiz, result, locale, copy, showRadar, placement, sampleId }: {
  quiz: Questionnaire;
  result: CompleteResult;
  locale: Locale;
  copy: (text: string) => string;
  showRadar?: boolean;
  placement?: "before" | "between" | "after";
  sampleId?: string;
}) {
  const zh = locale === "zh";
  const matched = result.profileIds.map(id => quiz.profiles.find(profile => profile.id === id)!);
  const leadingDirections = new Set(matched.flatMap(profile => profile.directionIds));
  const countsId = sampleId ? `${sampleId}-counts` : "choice-counts";
  const CountHeading = sampleId ? "h4" : "h3";
  return <section className={styles.choiceChart} id={countsId} aria-labelledby={`${countsId}-title`}>
    <CountHeading id={`${countsId}-title`}>{sampleId ? (zh ? copy("示例选择次数") : "Sample choice counts") : (zh ? copy("本次选择次数") : "Choice counts for this attempt")}</CountHeading>
    <div className={showRadar && !sampleId ? styles.choiceRadarLayout : undefined}>
      {showRadar && !sampleId && <ChoiceRadar quiz={quiz} result={result} />}
      <dl className={styles.choiceRows}>{quiz.directions.map((direction, index) => <div key={direction.id} className={styles.choiceRow} data-archetype-count={direction.id} data-matched={leadingDirections.has(direction.id) || undefined}>
        <dt>{showRadar && !sampleId && <span className={styles.choiceIndex} aria-hidden="true">{index + 1}</span>}{direction.title[locale]}</dt><dd>{result.counts[direction.id]} / {direction.comparisons}</dd>
        {placement && typeof direction.comparisons === "number" && direction.comparisons > 0 && <dd aria-hidden="true" className={styles.choiceTrack}>
          <div style={{ width: `${result.counts[direction.id] / direction.comparisons * 100}%` }} />
        </dd>}
      </div>)}</dl>
    </div>
    <p className="text-sm leading-6">{zh ? copy("分母是这一类选项出现的次数。所有最高计数都保留。计数占比不是相似度，也不是人群排名。") : "The denominator is how often those options appeared. Every highest count is kept. The fraction chosen is neither a similarity score nor a population rank."}</p>
  </section>;
}
