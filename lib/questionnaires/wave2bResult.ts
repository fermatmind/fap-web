import type { DisplayLocale } from "@/lib/i18n/locales";
import type { scoreQuestionnaire } from "./scoring";
import type { Questionnaire, Text } from "./types";
import { eightValuesPairs } from "./eightValues";
import { honorMetricCopy, scalePosition, type HonorMetric, type HonorResultMetrics } from "./honorResultMetrics";

type Complete = Extract<ReturnType<typeof scoreQuestionnaire>, { status: "complete" }>;
export type HonorMatch = { id: string; name: string };
export type MetricCard = { matches: HonorMatch[]; readingId: string; metrics: HonorResultMetrics };
type RatedMetric = HonorMetric & { score: number };

export const wave2bPracticeBands = ["review", "building", "strong", "perfect"] as const;

export function wave2bPracticeBand(correct: number, total: number) {
  if (correct === total) return "perfect";
  if (correct / total >= .75) return "strong";
  if (correct / total >= .5) return "building";
  return "review";
}

const shortTitles: Record<string, [string, string, string]> = {
  "8-values-political": ["8 Values 政治价值观", "8 Values 政治價值觀", "8 Values"],
  "moral-alignment": ["道德阵营", "道德陣營", "Moral Alignment"],
  "love-languages": ["五种爱的语言", "五種愛的語言", "Love Languages"],
  "people-pleaser": ["讨好型人格", "討好型人格", "People-Pleasing"],
  "introvert-extrovert": ["内向还是外向", "內向還是外向", "Introvert or Extrovert"],
  "optimism-pessimism": ["乐观与悲观性", "樂觀與悲觀性", "Optimism & Pessimism"],
  "logical-reasoning": ["逻辑与演绎推理", "邏輯與演繹推理", "Logical Reasoning"],
};

export function wave2bShortTitle(quiz: Questionnaire, locale: DisplayLocale, localize: (text: Text) => string) {
  const titles = shortTitles[quiz.slug];
  return titles?.[locale === "en" ? 2 : locale === "zh-TW" ? 1 : 0] ?? localize(quiz.title);
}

export function wave2bCardData(quiz: Questionnaire, result: Complete, locale: DisplayLocale, localize: (text: Text) => string): MetricCard | undefined {
  const copy = honorMetricCopy[locale];
  const directionName = (id: string) => localize(quiz.directions.find(direction => direction.id === id)!.title);
  const profiles = (ids: string[]) => ids.map(id => ({ id, name: localize(quiz.profiles.find(profile => profile.id === id)!.title) }));
  const row = (id: string, label: string, value: string, score: number, min: number, max: number): RatedMetric =>
    ({ id, label, value, score, position: scalePosition(score, min, max) });
  const meanRows = (scores: Record<string, { mean: number | null }>, min = 1, max = 5) =>
    quiz.directions.flatMap(({ id }) => {
      const mean = scores[id]?.mean;
      return mean == null ? [] : [row(id, directionName(id), `${mean.toFixed(1)} / ${max}`, mean, min, max)];
    });
  const dimensions = (rows: HonorMetric[], matches: HonorMatch[] = [], readingId = "", label: string = copy.dimensions, tied = false, tieLabel?: string): MetricCard => ({
    matches: matches.length ? matches : [{ id: rows.length ? "overview" : "missing", name: rows.length ? copy.axes : copy.missing }],
    readingId: readingId || (rows.length ? "overview" : "missing"),
    metrics: { kind: "dimensions", label, rows: rows.slice(0, 3), tied, tieLabel },
  });

  if ("practice" in result) {
    const { correct, total } = result.practice;
    const value = correct / total * 100;
    return {
      matches: [{ id: "correct", name: `${correct}/${total}` }],
      readingId: wave2bPracticeBand(correct, total),
      metrics: { kind: "practice", label: copy.practice, tied: false, scale: { value, min: 0, max: 100, display: `${correct} / ${total} · ${Math.round(value)}%`, ticks: [0, 25, 50, 75, 100] } },
    };
  }
  if ("scaleProfileIds" in result || "outlookProfileIds" in result) {
    const extraversion = "scaleProfileIds" in result;
    const matches = profiles(extraversion ? result.scaleProfileIds : result.outlookProfileIds);
    return {
      matches: matches.length ? matches : [{ id: "missing", name: copy.missing }],
      readingId: matches.length > 1 ? "boundary" : matches[0]?.id ?? "missing",
      metrics: { kind: "scalar", label: copy.scalar, tied: matches.length > 1, scale: result.total === null ? undefined : {
        value: result.total, min: 10, max: 50, display: `${result.total} / 50`, ticks: extraversion ? [10, 20, 30, 40, 50] : [10, 18, 26, 34, 42, 50],
      } },
    };
  }
  if ("alignmentIds" in result) {
    const matches = profiles(result.alignmentIds);
    const total = quiz.questions.length / 2;
    const rows = [["lawful", "chaotic"], ["good", "evil"]].map(([positive, negative]) =>
      row(positive, `${directionName(positive)} / ${directionName(negative)}`,
        `${result.counts[positive]} / ${result.counts[negative]}`, result.counts[positive], 0, total));
    return dimensions(rows, matches, matches.length === 1 ? matches[0].id : "tied", copy.dimensions, matches.length > 1);
  }
  if ("eightValuesAxes" in result) {
    // Keep the axes separate, as in the full report. No cross-axis winner.
    const rows = eightValuesPairs.map(({ axis, positive, negative }) => {
      const { percentage, complement } = result.eightValuesAxes[axis];
      const names = profiles([positive, negative]);
      return row(axis, names.map(match => match.name).join(" / "), `${percentage.toFixed(1)} / ${complement.toFixed(1)}%`, percentage, 0, 100);
    });
    return dimensions(rows, [{ id: "overview", name: copy.fourAxes }]);
  }
  if ("politicalCoordinates" in result) {
    const { economic, social } = result.politicalCoordinates;
    const matches = profiles(result.politicalCoordinateProfileIds);
    const rows = ([[economic, "x", copy.eastWest], [social, "y", copy.northSouth]] as const).flatMap(([axis, id, label]) => {
      if (axis.difference === null) return [];
      const value = axis.difference;
      return [row(id, label, value > 0 ? `+${value}` : String(value), value, -18, 18)];
    });
    return dimensions(rows, matches, matches.length === 1 ? matches[0].id : matches.length > 1 ? "tied" : rows.length ? "partial" : "missing", copy.dimensions, matches.length > 1);
  }
  if ("attachmentAxes" in result) return dimensions(meanRows(result.attachmentAxes));
  if ("secsDomains" in result) return dimensions(meanRows(result.secsDomains, 0, 100));
  if ("pairedDimensions" in result) {
    const matches = profiles(result.pairedProfileIds);
    const rows = result.pairedDimensions.map(axis => {
      const [first, second] = quiz.pairedDimensions!.find(dimension => dimension.id === axis.id)!.poleIds;
      return row(axis.id, localize(quiz.pairedDimensions!.find(dimension => dimension.id === axis.id)!.title),
        `${axis.counts[first]} / ${axis.counts[second]}`, axis.counts[first], 0, 12);
    });
    return dimensions(rows, matches, "overview");
  }
  if ("affectionFacets" in result) {
    // A higher rated item does not assign an affection type. Keep giving and receiving distinct.
    const rows = meanRows(result.affectionFacets);
    const top = (prefix: string) => {
      const group = rows.filter(metric => metric.id.startsWith(prefix)).sort((a, b) => b.score - a.score);
      return group.filter(metric => metric.score === group[0]?.score);
    };
    const giving = top("giving_"), receiving = top("receiving_");
    const leading = [giving[0], receiving[0], ...giving.slice(1), ...receiving.slice(1)].filter(metric => metric !== undefined);
    const tied = giving.length > 1 || receiving.length > 1;
    const names = tied ? [giving, receiving].filter(group => group.length > 1).flat().map(metric => ({ id: metric.id, name: metric.label }))
      : leading.length ? [{ id: "overview", name: copy.affection }] : [];
    return dimensions(leading, names, leading.length ? "overview" : "missing", copy.dimensions, tied, copy.affectionTie);
  }
  if ("facets" in result) {
    const rows = meanRows(result.facets);
    if (quiz.kind === "parenting-practices") return dimensions(rows);
    rows.sort((a, b) => b.score - a.score);
    const leaders = rows.filter(metric => metric.score === rows[0]?.score);
    const matches = leaders.map(metric => ({ id: metric.id, name: metric.label }));
    return dimensions(rows, matches, matches.length === 1 ? matches[0].id : matches.length > 1 ? "tied" : "missing",
      rows.length ? copy.peaks : copy.dimensions, matches.length > 1);
  }
}
