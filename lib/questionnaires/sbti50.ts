import type { Questionnaire, Text } from "./types";

export const SBTI50_THEME_IDS = [
  "self-critic", "initiator", "caregiver", "social-adapter", "detached-observer",
  "pause-taker", "action-starter", "pressure-speaker", "contingency-planner", "lightener",
  "expressive-styler", "easygoing", "resource-keeper", "risk-watcher", "quiet-observer",
  "venting-fixer", "appreciator", "improviser", "giver", "reflective-thinker",
  "independent-walker", "romantic-connector", "surprised-commentator", "atmosphere-seeker", "low-battery-rebuilder",
] as const;
export type Sbti50Theme = typeof SBTI50_THEME_IDS[number];
export type Sbti50Questionnaire = Omit<Questionnaire, "kind" | "instructions" | "resultHeading"> & {
  kind: "sbti50"; instructions: Text; resultHeading: Text;
};
export type Sbti50Result =
  | { status: "unavailable" | "invalid" | "incomplete"; answered: number }
  | { status: "complete"; answered: 50; counts: Record<Sbti50Theme, number>; highestCount: number; leadingThemes: Sbti50Theme[] };

const pairs = [1, 7].flatMap(offset => SBTI50_THEME_IDS.map((_, index) => [index, (index + offset) % 25]));
const scheduledPairs = Array.from({ length: 50 }, (_, index) => pairs[index * 17 % 50]);
const plain = (value: unknown): value is Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};
const bilingual = (value: unknown): value is Text => plain(value)
  && typeof value.en === "string" && value.en.trim().length > 0
  && typeof value.zh === "string" && value.zh.trim().length > 0;
const dense = (value: unknown, length: number, check: (entry: unknown, index: number) => boolean): boolean =>
  Array.isArray(value) && value.length === length && Array.from(value).every(check);
const sections = (value: unknown, length: number): boolean => dense(value, length, section => plain(section)
  && typeof section.id === "string" && section.id.length > 0 && bilingual(section.title)
  && dense(section.paragraphs, 2, bilingual));

export function isSbti50ConfigurationValid(quiz: unknown): quiz is Sbti50Questionnaire {
  if (!plain(quiz) || quiz.kind !== "sbti50" || quiz.slug !== "sbti-test" || quiz.code !== "FM_SBTI50_WEB_REPAIR"
    || quiz.version !== "fm_sbti50_web_repair_v1" || quiz.minutes !== 8
    || !bilingual(quiz.title) || !bilingual(quiz.seoTitle) || !bilingual(quiz.description)
    || !bilingual(quiz.instructions) || !bilingual(quiz.introduction) || !bilingual(quiz.resultHeading)
    || !plain(quiz.source) || quiz.source.kind !== "owned_mini_sbti25_themes_new_web50"
    || quiz.source.formCode !== "fm_sbti50_web_repair_v1"
    || quiz.source.itemBankVersion !== "fifty_original_pairs_bilingual_v1"
    || quiz.source.scoringVersion !== "one_choice_one_count_all50_all25_ties_v1"
    || quiz.source.resultContentVersion !== "twentyfive_full6_web_repair_v1"
    || quiz.source.psychometricValidationCompleted !== false) return false;
  return dense(quiz.directions, 25, (direction, index) => plain(direction)
    && direction.id === SBTI50_THEME_IDS[index] && direction.itemCount === 4 && bilingual(direction.title))
    && dense(quiz.questions, 50, (question, index) => plain(question)
      && question.id === `SBTI50_${String(index + 1).padStart(3, "0")}` && question.reverse === false && bilingual(question.prompt)
      && dense(question.options, 2, (option, position) => plain(option)
        && option.id === (position === 0 ? "A" : "B") && option.score === 1 && bilingual(option.label)
        && option.directionId === SBTI50_THEME_IDS[scheduledPairs[index][position]]))
    && dense(quiz.profiles, 25, (profile, index) => plain(profile) && profile.id === SBTI50_THEME_IDS[index]
      && dense(profile.directionIds, 1, id => id === SBTI50_THEME_IDS[index])
      && bilingual(profile.title) && bilingual(profile.headline) && bilingual(profile.summary) && bilingual(profile.scoreReading)
      && plain(profile.seo) && bilingual(profile.seo.title) && bilingual(profile.seo.description)
      && sections(profile.sections, 6))
    && sections(quiz.guide, 5)
    && dense(quiz.faq, 8, faq => plain(faq) && bilingual(faq.question) && bilingual(faq.answer));
}

export function scoreSbti50(quiz: unknown, answers: unknown): Sbti50Result {
  if (!isSbti50ConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!plain(answers) || Object.getOwnPropertySymbols(answers).length) return { status: "invalid", answered: 0 };
  const descriptors = Object.getOwnPropertyDescriptors(answers);
  if (Object.values(descriptors).some(descriptor => !Object.hasOwn(descriptor, "value") || !descriptor.enumerable)) return { status: "invalid", answered: 0 };
  const questions = new Map(quiz.questions.map(question => [question.id, question]));
  const counts = Object.fromEntries(SBTI50_THEME_IDS.map(id => [id, 0])) as Record<Sbti50Theme, number>;
  let answered = 0;
  for (const [id, descriptor] of Object.entries(descriptors)) {
    const question = questions.get(id), choice: unknown = descriptor.value;
    if (!question || (choice !== "A" && choice !== "B")) return { status: "invalid", answered };
    const option = question.options[choice === "A" ? 0 : 1];
    counts[option.directionId as Sbti50Theme]++;
    answered++;
  }
  if (answered !== 50) return { status: "incomplete", answered };
  const highestCount = Math.max(...Object.values(counts));
  return { status: "complete", answered: 50, counts, highestCount,
    leadingThemes: SBTI50_THEME_IDS.filter(id => counts[id] === highestCount) };
}
