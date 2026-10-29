import type { Questionnaire, Text } from "./types";

export const distributedWorkDefinitions = [
  { id: "handover", profileId: "handover-reading" },
  { id: "visibility", profileId: "visibility-reading" },
  { id: "blockers", profileId: "blockers-reading" },
  { id: "time-windows", profileId: "time-windows-reading" },
] as const;
export type DistributedWorkDomain = typeof distributedWorkDefinitions[number]["id"];
export const distributedWorkSkipLabel: Text = {
  en: "Neither / both equally / no relevant instance / cannot compare / prefer not to answer",
  zh: "两项都不符合／同样符合／没有相关实例／无法比较／不愿回答",
};
const pairs: readonly (readonly [DistributedWorkDomain, DistributedWorkDomain])[] = [
  ["handover", "visibility"], ["handover", "blockers"], ["handover", "time-windows"],
  ["visibility", "blockers"], ["visibility", "time-windows"], ["blockers", "time-windows"],
];
export type DistributedWorkResult = { status: "unavailable" | "invalid" | "incomplete"; answered: number } | {
  status: "complete";
  answered: 24;
  distributedWork: { id: DistributedWorkDomain; profileId: string; selected: number; otherSelected: number; unscored: number; appearances: 12 }[];
};
const object = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object"
  && [Object.prototype, null].includes(Object.getPrototypeOf(v));
const text = (v: unknown): v is Text => object(v) && typeof v.en === "string" && Boolean(v.en.trim())
  && typeof v.zh === "string" && Boolean(v.zh.trim());

/** Closed original cross-theme comparisons, without independent trait scores or a familiarity trap. */
export function isDistributedWork24ConfigurationValid(quiz: Questionnaire): boolean {
  if (!object(quiz) || quiz.kind !== "distributed-work24" || quiz.slug !== "distributed-work-choices"
    || quiz.code !== "FM_DISTRIBUTED_WORK_CHOICES24" || quiz.version !== "fm_distributed_work24_choices_v1"
    || !object(quiz.source) || quiz.source.kind !== "fermatmind_original_distributed_work_relative_choices"
    || quiz.source.formCode !== quiz.version || quiz.source.itemBankVersion !== "original24_bilingual_balanced_tradeoff_pairs_v1"
    || quiz.source.scoringVersion !== "four_twelve_appearance_selected_other_unscored_counts_v1"
    || quiz.source.resultContentVersion !== "four_full_bilingual_distributed_work_readings_v1"
    || quiz.source.itemBankSha256 !== "dae434af8f77db95e513d951560cdc6a4cf40e12ab39e5bad958f0818b51ac9d"
    || quiz.source.resultContentSha256 !== "0f5dffea2005e563470ee1c5140a5f37876d1878ede96b1db890c45e1ae305f0"
    || quiz.source.psychometricValidationCompleted !== false || quiz.minimumRatedItems !== undefined
    || !text(quiz.title) || !text(quiz.instructions) || !Array.isArray(quiz.questions) || quiz.questions.length !== 24
    || !Array.isArray(quiz.directions) || quiz.directions.length !== 4
    || !Array.isArray(quiz.profiles) || quiz.profiles.length !== 4) return false;
  if (!Array.from(quiz.directions).every((d, i) => object(d) && d.id === distributedWorkDefinitions[i].id
    && d.comparisons === 12 && text(d.title))) return false;
  for (const [i, q] of quiz.questions.entries()) {
    if (!object(q) || q.id !== `DWC_${String(i + 1).padStart(2, "0")}` || !text(q.prompt)
      || q.reverse !== undefined || q.correctOptionId !== undefined || q.explanation !== undefined
      || !Array.isArray(q.options) || q.options.length !== 3) return false;
    const pair = pairs[i % 6], expected = Math.floor(i / 6) % 2 ? [pair[1], pair[0]] : pair;
    if (!Array.from(q.options).every((o, j) => object(o) && o.id === ["A", "B", "skip"][j]
      && o.directionId === (j === 2 ? "unscored" : expected[j]) && o.score === undefined && text(o.label)
      && (j !== 2 || (o.label.en === distributedWorkSkipLabel.en && o.label.zh === distributedWorkSkipLabel.zh)))) return false;
  }
  if (!Array.from(quiz.profiles).every((p, i) => object(p) && p.id === distributedWorkDefinitions[i].profileId
    && Array.isArray(p.directionIds) && p.directionIds.length === 1 && p.directionIds[0] === distributedWorkDefinitions[i].id
    && text(p.title) && text(p.headline) && text(p.summary) && text(p.scoreReading) && object(p.seo)
    && text(p.seo.title) && text(p.seo.description) && Array.isArray(p.sections) && p.sections.length === 7
    && Array.from(p.sections).every((s, j) => object(s) && s.id === `section-${j + 1}` && text(s.title)
      && Array.isArray(s.paragraphs) && s.paragraphs.length === 2 && Array.from(s.paragraphs).every(text)))) return false;
  return Array.isArray(quiz.references) && quiz.references.length === 1 && object(quiz.references[0])
    && text(quiz.references[0].title) && quiz.references[0].url === "https://handbook.gitlab.com/handbook/company/culture/all-remote/meetings/";
}

export function recordDistributedWork24(quiz: Questionnaire, answers: unknown): DistributedWorkResult {
  if (!isDistributedWork24ConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!object(answers)) return { status: "invalid", answered: 0 };
  const questions = new Map(quiz.questions.map(q => [q.id, q]));
  let answered = 0;
  for (const [id, value] of Object.entries(answers)) {
    if (!questions.has(id) || !["A", "B", "skip"].some(allowed => allowed === value)) return { status: "invalid", answered };
    answered++;
  }
  if (answered !== 24) return { status: "incomplete", answered };
  return { status: "complete", answered: 24, distributedWork: distributedWorkDefinitions.map(d => {
    let selected = 0, otherSelected = 0, unscored = 0;
    for (const q of quiz.questions) {
      if (!q.options.slice(0, 2).some(o => o.directionId === d.id)) continue;
      const value = answers[q.id];
      if (value === "skip") unscored++;
      else if (q.options.find(o => o.id === value)!.directionId === d.id) selected++;
      else otherSelected++;
    }
    return { ...d, selected, otherSelected, unscored, appearances: 12 };
  }) };
}
