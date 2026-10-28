import type { Questionnaire, Text } from "@/lib/questionnaires/types";
import type { InteractionPairsResult } from "@/lib/questionnaires/interactionPairs";

export type MiniCopingQuestionnaire = Omit<Questionnaire, "kind"> & { kind: "mini-coping"; instructions: Text; resultHeading: Text };
export type MiniCopingResult = InteractionPairsResult;
export const copingPairDefinitions = [
  { id: "EXPLORATION_EVALUATION", poleIds: ["EXPLORATION", "CAUTIOUS_EVALUATION"], profileId: "trying-and-assessing", sections: ["scope", "trying", "evaluating", "counts", "coexist", "context", "observation", "limits"] },
  { id: "PROCESSING_STYLE", poleIds: ["EXPRESSIVE_PROCESSING", "PRIVATE_PROCESSING"], profileId: "expressing-and-processing-privately", sections: ["scope", "expressing", "private", "counts", "sequence", "conditions", "observation", "limits"] },
  { id: "ADAPTATION_FOLLOW_THROUGH", poleIds: ["FLEXIBLE_ADAPTATION", "STRUCTURED_FOLLOW_THROUGH"], profileId: "adapting-and-keeping-structure", sections: ["scope", "adjusting", "structure", "counts", "together", "conditions", "observation", "limits"] },
  { id: "TIME_FOCUS", poleIds: ["PRESENT_FOCUS", "FUTURE_PLANNING"], profileId: "present-needs-and-future-plans", sections: ["scope", "present", "future", "counts", "together", "conditions", "observation", "limits"] },
] as const;
const methods = ["source", "form", "counts", "ties", "context", "limits", "privacy", "reading"];
const plain = (value: unknown): value is Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};
const bilingual = (value: unknown): value is Text => plain(value)
  && typeof value.en === "string" && value.en.trim().length > 0
  && typeof value.zh === "string" && value.zh.trim().length > 0;
const dense = (value: unknown, length: number, test: (entry: unknown, index: number) => boolean): boolean =>
  Array.isArray(value) && value.length === length && Array.from(value).every(test);

/** Original four-by-six choices; the existing paired result wire shape carries raw counts only. */
export function isMiniCopingConfigurationValid(quiz: unknown): quiz is MiniCopingQuestionnaire {
  if (!plain(quiz) || quiz.kind !== "mini-coping" || quiz.slug !== "coping-rhythm-test" || quiz.code !== "PSYCHOLOGICAL_AGE"
    || typeof quiz.version !== "string" || !quiz.version.trim()
    || !bilingual(quiz.title) || !bilingual(quiz.seoTitle) || !bilingual(quiz.description)
    || !bilingual(quiz.introduction) || !bilingual(quiz.instructions) || !bilingual(quiz.resultHeading) || !plain(quiz.source)
    || quiz.source.kind !== "fermatmind_original_mini_coping_rhythm_24"
    || quiz.source.formCode !== "psychological_age_paired_choice_24"
    || quiz.source.itemBankVersion !== "coping_rhythm_original_0.1.0_fm_en_working_v1"
    || quiz.source.scoringVersion !== "four6_pair_counts_all24_ties_no_age_v1"
    || quiz.source.resultContentVersion !== "coping_rhythm_four_pairs_full8_v1"
    || quiz.source.psychometricValidationCompleted !== false) return false;
  const poles = copingPairDefinitions.flatMap(d => [...d.poleIds]);
  return dense(quiz.directions, 8, (d, i) => plain(d) && d.id === poles[i] && d.comparisons === 6 && bilingual(d.title))
    && dense(quiz.questions, 24, (q, i) => {
      if (!plain(q) || q.id !== `AGE_RHYTHM_PC_${String(i + 1).padStart(3, "0")}` || !bilingual(q.prompt)
        || q.reverse !== undefined || q.correctOptionId !== undefined) return false;
      const pair = copingPairDefinitions[Math.floor(i / 6)].poleIds;
      const expected = i % 2 === 0 ? pair : [pair[1], pair[0]];
      return dense(q.options, 2, (o, j) => plain(o) && o.id === (j === 0 ? "A" : "B")
        && o.directionId === expected[j] && o.score === undefined && bilingual(o.label));
    })
    && dense(quiz.profiles, 4, (p, i) => {
      const d = copingPairDefinitions[i];
      return plain(p) && p.id === d.profileId && bilingual(p.title) && bilingual(p.headline)
        && bilingual(p.summary) && bilingual(p.scoreReading) && plain(p.seo) && bilingual(p.seo.title) && bilingual(p.seo.description)
        && dense(p.directionIds, 2, (id, j) => id === d.poleIds[j])
        && dense(p.sections, 8, (s, j) => plain(s) && s.id === d.profileId + "-" + d.sections[j]
          && bilingual(s.title) && dense(s.paragraphs, 2, bilingual));
    })
    && dense(quiz.guide, 8, (s, i) => plain(s) && s.id === methods[i] && bilingual(s.title) && dense(s.paragraphs, 2, bilingual))
    && dense(quiz.faq, 8, f => plain(f) && bilingual(f.question) && bilingual(f.answer));
}

export function scoreMiniCopingQuestionnaire(quiz: unknown, answers: unknown): MiniCopingResult {
  if (!isMiniCopingConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!plain(answers) || Object.getOwnPropertySymbols(answers).length) return { status: "invalid", answered: 0 };
  const entries = Object.getOwnPropertyDescriptors(answers);
  if (Object.values(entries).some(d => !Object.hasOwn(d, "value") || !d.enumerable)) return { status: "invalid", answered: 0 };
  const questions = new Map(quiz.questions.map(q => [q.id, q]));
  const counts: Record<string, number> = Object.fromEntries(quiz.directions.map(d => [d.id, 0]));
  let answered = 0;
  for (const [id, descriptor] of Object.entries(entries)) {
    const value: unknown = descriptor.value;
    if (typeof value !== "string" || (value !== "A" && value !== "B")) return { status: "invalid", answered };
    const option = questions.get(id)?.options.find(o => o.id === value);
    if (!option) return { status: "invalid", answered };
    counts[option.directionId]++;
    answered++;
  }
  if (answered !== 24) return { status: "incomplete", answered };
  return { status: "complete", answered: 24, interactionPairs: copingPairDefinitions.map(d => {
    const maximum = Math.max(...d.poleIds.map(id => counts[id]));
    return { id: d.id, counts: Object.fromEntries(d.poleIds.map(id => [id, counts[id]])),
      leaders: d.poleIds.filter(id => counts[id] === maximum).sort(), profileId: d.profileId };
  }) };
}
