import type { DisplayLocale } from "@/lib/i18n/locales";
import { honorMetricCopy, scalePosition, type HonorMetric } from "./honorResultMetrics";
import { interactionPairDefinitions } from "./interactionPairs";
import type { scoreMostLeast } from "./mostLeast";
import type { scoreQuestionnaire } from "./scoring";
import type { Questionnaire, Text } from "./types";
import { wave2bPracticeBand, type MetricCard } from "./wave2bResult";
import type { Wave3cReadingId } from "./wave3cHonorCopy";
import { wave3cVariant } from "./wave3cScope";

type Complete = Extract<ReturnType<typeof scoreQuestionnaire> | ReturnType<typeof scoreMostLeast>, { status: "complete" }>;
export type Wave3cScore = Complete | { practice: { correct: number; total: number }; section?: Text; fields?: boolean };
type Rated = HonorMetric & { score: number };
export type Wave3cCardData = Omit<MetricCard, "readingId"> & { readingId: Wave3cReadingId; fields?: boolean };

// These reports use a common 1–5 scale to compare preferences or recurring patterns.
const compareFacets = new Set([
  "learning-style", "procrastinator-type-test",
]);

export function wave3cCardData(quiz: Questionnaire, result: Wave3cScore, locale: DisplayLocale, localize: (text: Text) => string): Wave3cCardData | undefined {
  const variant = wave3cVariant(quiz.slug);
  if (!variant) return;
  const copy = honorMetricCopy[locale];
  const directions = Object.fromEntries(quiz.directions.map(direction => [direction.id, localize(direction.title)]));
  const profileName = (id: string) => localize(quiz.profiles.find(profile => profile.id === id)!.title);
  const row = (id: string, score: number, min: number, max: number, value: string, label = directions[id]): Rated =>
    ({ id, label, value, position: scalePosition(score, min, max), score });
  const dimensions = (rows: Rated[], ids: string[] = [], tied = ids.length > 1, isProfile = false): Wave3cCardData => {
    const readingId = tied ? "tied" : rows.length ? "overview" : "missing";
    const matches = ids.map(id => ({ id, name: isProfile ? profileName(id) : directions[id] }));
    return {
      matches: matches.length ? matches : [{ id: readingId, name: rows.length ? copy.axes : copy.missing }],
      readingId,
      metrics: { kind: "dimensions", label: ids.length && !isProfile ? copy.peaks : copy.dimensions, rows: rows.slice(0, 3), tied },
    };
  };
  const scalar = (id: string, value: number | null, ticks: number[], label: string = copy.scalar, display?: string): Wave3cCardData => ({
    matches: [{ id, name: directions[id] }],
    readingId: value === null ? "missing" : "overview",
    metrics: { kind: "scalar", label, tied: false, scale: value === null ? undefined : {
      value, min: ticks[0], max: ticks[ticks.length - 1], display: display ?? `${value.toFixed(1)} / ${ticks[ticks.length - 1]}`, ticks,
    } },
  });

  if ("practice" in result) {
    const { correct, total } = result.practice;
    const value = total ? correct / total * 100 : null;
    const fields = "fields" in result && result.fields;
    const metricLabel = "section" in result && result.section ? localize(result.section) : copy.practice;
    return {
      matches: [{ id: "correct", name: value === null ? copy.missing : `${correct}/${total}` }],
      readingId: value === null ? "missing" : wave2bPracticeBand(correct, total), fields,
      metrics: { kind: "practice", label: metricLabel, tied: false, scale: value === null ? undefined : {
        value, min: 0, max: 100, display: `${correct} / ${total} · ${Math.round(value)}%`, ticks: [0, 25, 50, 75, 100],
      } },
    };
  }
  if ("preparationActions20" in result) {
    // The reports have five separate means, no aggregate or readiness bands.
    const { id, mean } = result.preparationActions20.domains[0];
    const label = { zh: "首项行动阶段", "zh-TW": "首項行動階段", en: "First action area" }[locale];
    return scalar(id, mean, [0, 1, 2, 3], label);
  }
  if ("facets" in result) {
    if (variant.shell === "scalar") {
      const { id } = quiz.directions[0];
      const facet = result.facets[id];
      if (["empathy", "locus-of-control", "social-intelligence-test"].includes(quiz.slug)) {
        const max = facet.total * 5;
        const total = facet.rated === facet.total ? facet.sum : null;
        return scalar(id, total, [1, 2, 3, 4, 5].map(value => value * facet.total), copy.scalar, `${total} / ${max}`);
      }
      return scalar(id, facet.mean, [1, 2, 3, 4, 5]);
    }
    const precision = quiz.kind === "mini-habit" ? 4 : ["libertarian", "grit-test"].includes(quiz.slug) ? 2 : 1;
    const rows = quiz.directions.flatMap(({ id }) => {
      const { mean, sum, rated } = result.facets[id];
      const value = mean === null ? null : sum / rated;
      return value === null ? [] : [row(id, value, 1, 5, `${value.toFixed(precision)} / 5`)];
    });
    if (!compareFacets.has(quiz.slug)) return dimensions(rows);
    rows.sort((a, b) => b.score - a.score);
    return dimensions(rows, rows.filter(({ score }) => score === rows[0]?.score).map(({ id }) => id));
  }
  if ("tipi10" in result) {
    return dimensions(quiz.directions.flatMap(({ id }) => {
      const score = result.tipi10[id as keyof typeof result.tipi10];
      return score ? [row(id, score.mean, 1, 7, `${score.mean.toFixed(1)} / 7`)] : [];
    }));
  }
  if ("axes" in result) {
    return dimensions(Object.entries(result.axes).map(([id, axis]) => row(id, axis.highPercent, 0, 100, `${axis.lowPercent.toFixed(1)}% / ${axis.highPercent.toFixed(1)}%`)));
  }
  if ("interactionPairs" in result) {
    const rows = result.interactionPairs.map(pair => {
      const [a, b] = interactionPairDefinitions.find(axis => axis.id === pair.id)!.poleIds;
      return row(pair.id, pair.counts[a], 0, 6, `${pair.counts[a]} / ${pair.counts[b]}`, `${directions[a]} / ${directions[b]}`);
    });
    return dimensions(rows, [], result.interactionPairs.some(pair => pair.leaders.length > 1));
  }
  if ("compassProfileIds" in result) {
    const rows = quiz.directions.map(({ id }) => row(id, result.counts[id], 0, result.answered, String(result.counts[id])));
    rows.sort((a, b) => b.score - a.score);
    return dimensions(rows, result.compassProfileIds, result.leaders.length > 1, true);
  }
  if ("counts" in result && quiz.kind === "most-least") {
    const counts = result.counts as Extract<ReturnType<typeof scoreMostLeast>, { status: "complete" }>["counts"];
    return dimensions(quiz.directions.map(({ id }) => {
      const { most, least, difference } = counts[id];
      return row(id, difference, -8, 8, `${most} / ${least}`);
    }));
  }
}
