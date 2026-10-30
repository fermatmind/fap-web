import { isCareFeelings20ConfigurationValid } from "./careFeelings20";
import { isNakshatra27ConfigurationValid } from "./nakshatra27";
import { isWetonStory35ConfigurationValid } from "./wetonStory35";
import { isBpi21ConfigurationValid } from "./bpi21";
import { isSuddenFear20ConfigurationValid } from "./suddenFear20";
import { isUnwantedActions20ConfigurationValid } from "./unwantedActions20";
import { isFocusContext16ConfigurationValid } from "./focusContext16";
import { isWrittenLanguage20ConfigurationValid } from "./writtenLanguage20";
import { isNumberContext20ConfigurationValid } from "./numberContext20";
import { isSocialContext20ConfigurationValid } from "./socialContext20";
import { isHealthWorry21ConfigurationValid } from "./healthWorry21";
import { isSleepExperiences20ConfigurationValid } from "./sleepExperiences20";
import { isBereavement16ConfigurationValid } from "./bereavement16";
import { isSupportReflection18ConfigurationValid } from "./supportReflection18";
import { isConnectionCheckIn21ConfigurationValid } from "./connectionCheckIn21";
import { isPressureActions12ConfigurationValid } from "./pressureActions12";
import { isTraumaResponse20ConfigurationValid } from "./traumaResponse20";
import { isDistributedWork24ConfigurationValid, recordDistributedWork24 } from "./distributedWork24";
import { isWrittenCoordinationConfigurationValid } from "./writtenCoordination";
import { isWorkRole12ConfigurationValid, recordWorkRole12 } from "./workRole12";
import { isSbti31ConfigurationValid } from "./sbti31";
import { isTipi10ConfigurationValid, scoreTipi10Questionnaire } from "./tipi10";
import { isCritical30ConfigurationValid } from "./critical30";
import { isReasoning18ConfigurationValid } from "./reasoning18";
import { isMattering10ConfigurationValid } from "./mattering10";
import { isTechnical30ConfigurationValid } from "./technical30";
import { isDvmsq18ConfigurationValid } from "./dvmsq18";
import { isSynes15ConfigurationValid } from "./synes15";
import { isAfqt32ConfigurationValid } from "./afqt32";
import { isAnger20ConfigurationValid } from "./anger20";
import { isSens16ConfigurationValid } from "./sens16";
import { isImagery12ConfigurationValid } from "./imagery12";
import { isImposter20ConfigurationValid } from "./imposter20";
import { isCatQ25ConfigurationValid } from "./catq25";
import { isMostLeastConfigurationValid } from "@/lib/questionnaires/mostLeast";
import { isCareerMatchConfigurationValid } from "./careerMatch";
import { isLoveType16ConfigurationValid, scoreLoveType16Questionnaire } from "./loveType16";
import { isFds32ConfigurationValid, scoreFds32Questionnaire } from "./fds32";
import { isMentalAgeConfigurationValid, scoreMentalAgeQuestionnaire } from "./mentalAge";
import { isMiniOrientationConfigurationValid, recordMiniOrientationQuestionnaire } from "./miniOrientation";
import { isStressReflection4ConfigurationValid, scoreStressReflection4Questionnaire } from "./stressReflection4";
import { isMiniConflictConfigurationValid, scoreMiniConflictQuestionnaire } from "./miniConflict";
import { isFourAxesConfigurationValid, scoreFourAxesQuestionnaire } from "./fourAxes";
import { isMiniShadowConfigurationValid, scoreMiniShadowQuestionnaire } from "./miniShadow";
import { isPreparationActions20ConfigurationValid, scorePreparationActions20Questionnaire } from "./preparationActions20";
import { isMiniVirtuesConfigurationValid, scoreMiniVirtuesQuestionnaire } from "./miniVirtues";
import { isEuphoriaConfigurationValid } from "./euphoria";
import { isMiniCopingConfigurationValid, scoreMiniCopingQuestionnaire } from "./miniCoping";
import { isMiniHabitConfigurationValid, scoreMiniHabitQuestionnaire } from "./miniHabit";
import { isMiniIntimacyConfigurationValid, scoreMiniIntimacyQuestionnaire } from "./miniIntimacy";
import { isNatalChartConfigurationValid } from "./natalChart";
import { isMiniBreakupConfigurationValid, scoreMiniBreakupQuestionnaire } from "./miniBreakup";
import { isHoldingBack35ConfigurationValid, scoreHoldingBack35Questionnaire } from "./holdingBack35";
import { isFscrs22ConfigurationValid, scoreFscrs22Questionnaire } from "./fscrs22";
import { isParentingPracticesConfigurationValid, scoreParentingPracticesQuestionnaire } from "./parentingPractices";
import { isSpq92ConfigurationValid, scoreSpq92Questionnaire } from "./spq92";
import { isAdexi14ConfigurationValid, scoreAdexi14Questionnaire } from "./adexi14";
import { isMiniFrictionConfigurationValid, scoreMiniFrictionQuestionnaire } from "./miniFriction";
import { isCtl41ConfigurationValid, scoreCtl41Questionnaire } from "./ctl41";
import { isPtq15ConfigurationValid, scorePtq15Questionnaire } from "./ptq15";
import { isInteractionPairsConfigurationValid, scoreInteractionPairsQuestionnaire } from "./interactionPairs";
import { isSkillsEvidenceConfigurationValid, scoreSkillsEvidenceQuestionnaire } from "./skillsEvidence";
import { isSapsConfigurationValid, scoreSapsQuestionnaire } from "./saps";
import { isScs26ConfigurationValid, scoreScs26Questionnaire } from "./scs26";
import { isCbiConfigurationValid, scoreCbiQuestionnaire } from "./cbi";
import { isRosenbergConfigurationValid, scoreRosenbergQuestionnaire } from "./rosenberg";
import { isPoliticalCoordinatesConfigurationValid, scorePoliticalCoordinatesQuestionnaire } from "./politicalCoordinates";
import { isDataEntryConfigurationValid } from "./dataEntry";
import { isSecsConfigurationValid, scoreSecsQuestionnaire } from "./secs";
import { isPairedDimensionsConfigurationValid, scorePairedDimensionsQuestionnaire } from "./pairedDimensions";
import { isTypingConfigurationValid } from "./typing";
import { isEightValuesConfigurationValid, scoreEightValuesQuestionnaire } from "./eightValues";
import { isPracticeConfigurationValid, scorePracticeQuestionnaire } from "./practice";
import { isTenKeyConfigurationValid } from "./tenKey";
import { isCompassConfigurationValid, scoreCompassQuestionnaire } from "./compass";
import { isOptimismConfigurationValid, scoreOptimismQuestionnaire } from "./optimism";
import type { Questionnaire, QuestionnaireAnswers } from "./types";
import { isAttachmentConfigurationValid, scoreAttachmentQuestionnaire } from "./attachment";
import { isAffectionConfigurationValid, scoreAffectionQuestionnaire } from "./affection";
import { isAlignmentConfigurationValid, scoreAlignmentQuestionnaire } from "./alignment";
import { isExtraversionConfigurationValid, scoreExtraversionQuestionnaire } from "./extraversion";

export type DirectionalResult = {
  status: "incomplete" | "invalid" | "unavailable";
  answered: number;
} | {
  status: "complete";
  answered: number;
  counts: Record<string, number>;
  leaders: string[];
  profileId: string;
};
const object = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === "object"
  && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
const key = (ids: string[]) => [...ids].sort().join("|");

export function isDirectionalConfigurationValid(quiz: Questionnaire): boolean {
  if (quiz.kind !== "directional" || !quiz.questions.length || quiz.directions.length < 2) return false;
  const directions = new Set(quiz.directions.map(d => d.id));
  if (directions.size !== quiz.directions.length || new Set(quiz.questions.map(q => q.id)).size !== quiz.questions.length) return false;
  const exposure = Object.fromEntries(quiz.directions.map(d => [d.id, 0]));
  for (const question of quiz.questions) {
    if (question.options.length !== 2 || new Set(question.options.map(o => o.id)).size !== 2 || new Set(question.options.map(o => o.directionId)).size !== 2) return false;
    for (const option of question.options) {
      if (!directions.has(option.directionId)) return false;
      exposure[option.directionId]++;
    }
  }
  if (quiz.directions.some(d => exposure[d.id] !== d.comparisons)) return false;
  const combinations = quiz.profiles.map(p => key(p.directionIds));
  return new Set(quiz.profiles.map(p => p.id)).size === quiz.profiles.length
    && new Set(combinations).size === quiz.profiles.length
    && quiz.profiles.every(p => p.directionIds.length > 0 && new Set(p.directionIds).size === p.directionIds.length && p.directionIds.every(id => directions.has(id)));
}

export function scoreDirectionalQuestionnaire(quiz: Questionnaire, answers: unknown): DirectionalResult {
  if (!isDirectionalConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!object(answers)) return { status: "invalid", answered: 0 };
  const questions = new Map(quiz.questions.map(q => [q.id, q]));
  const counts = Object.fromEntries(quiz.directions.map(d => [d.id, 0]));
  let answered = 0;
  for (const [id, value] of Object.entries(answers)) {
    const option = questions.get(id)?.options.find(o => o.id === value);
    if (!option) return { status: "invalid", answered };
    counts[option.directionId]++;
    answered++;
  }
  // Partial counts never produce a ranked or interpreted result.
  if (answered !== quiz.questions.length) return { status: "incomplete", answered };
  const highest = Math.max(...Object.values(counts));
  const leaders = quiz.directions.filter(d => counts[d.id] === highest).map(d => d.id);
  const profile = quiz.profiles.find(p => key(p.directionIds) === key(leaders));
  return profile ? { status: "complete", answered, counts, leaders, profileId: profile.id } : { status: "unavailable", answered };
}

export type FacetScore = { sum: number; rated: number; total: number; mean: number | null };
export type FacetResult = { status: "incomplete" | "invalid" | "unavailable"; answered: number } | {
  status: "complete"; answered: number; facets: Record<string, FacetScore>;
};

export function isLikertConfigurationValid(quiz: Questionnaire): boolean {
  if (quiz.kind !== "likert" || !quiz.instructions || !quiz.questions.length || !quiz.directions.length
    || !Number.isInteger(quiz.minimumRatedItems) || quiz.minimumRatedItems! < 1) return false;
  const ids = new Set(quiz.directions.map(d => d.id));
  if (ids.size !== quiz.directions.length || new Set(quiz.questions.map(q => q.id)).size !== quiz.questions.length) return false;
  const exposure = Object.fromEntries(quiz.directions.map(d => [d.id, 0]));
  for (const question of quiz.questions) {
    if (typeof question.reverse !== "boolean" || question.options.length !== 6
      || new Set(question.options.map(o => o.id)).size !== 6
      || new Set(question.options.map(o => o.directionId)).size !== 1) return false;
    const id = question.options[0].directionId;
    if (!ids.has(id)) return false;
    for (const option of question.options) {
      if (option.id === "na" ? option.score !== null
        : !/^[1-5]$/.test(option.id) || option.score !== Number(option.id)) return false;
    }
    exposure[id]++;
  }
  return quiz.directions.every(d => Number.isInteger(d.itemCount) && d.itemCount! >= quiz.minimumRatedItems! && exposure[d.id] === d.itemCount)
    && quiz.profiles.length === quiz.directions.length
    && new Set(quiz.profiles.map(p => p.id)).size === quiz.profiles.length
    && quiz.directions.every(d => quiz.profiles.filter(p => p.directionIds.length === 1 && p.directionIds[0] === d.id).length === 1);
}

export function scoreLikertQuestionnaire(quiz: Questionnaire, answers: unknown): FacetResult {
  if (!isLikertConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!object(answers)) return { status: "invalid", answered: 0 };
  const questions = new Map(quiz.questions.map(q => [q.id, q]));
  const facets: Record<string, FacetScore> = Object.fromEntries(quiz.directions.map(d => [d.id, { sum: 0, rated: 0, total: d.itemCount!, mean: null }]));
  let answered = 0;
  for (const [id, value] of Object.entries(answers)) {
    const question = questions.get(id), option = question?.options.find(o => o.id === value);
    if (!question || !option) return { status: "invalid", answered };
    const score = option.score;
    if (typeof score === "number") {
      const facet = facets[option.directionId];
      facet.sum += question.reverse ? 6 - score : score;
      facet.rated++;
    }
    answered++;
  }
  if (answered !== quiz.questions.length) return { status: "incomplete", answered };
  for (const facet of Object.values(facets)) {
    if (facet.rated >= quiz.minimumRatedItems!) facet.mean = Math.round(facet.sum / facet.rated * 10) / 10;
  }
  return { status: "complete", answered, facets };
}

export type ArchetypeResult = { status: "incomplete" | "invalid" | "unavailable"; answered: number } | {
  status: "complete"; answered: number; counts: Record<string, number>; profileIds: string[];
};

export function isArchetypeConfigurationValid(quiz: Questionnaire): boolean {
  if (quiz.kind !== "archetype" || !quiz.instructions || !quiz.questions.length || quiz.directions.length < 2) return false;
  const ids = new Set(quiz.directions.map(d => d.id));
  if (ids.size !== quiz.directions.length || new Set(quiz.questions.map(q => q.id)).size !== quiz.questions.length) return false;
  const exposure = Object.fromEntries(quiz.directions.map(d => [d.id, 0]));
  for (const question of quiz.questions) {
    if (question.options.length !== 4 || new Set(question.options.map(o => o.id)).size !== 4
      || new Set(question.options.map(o => o.directionId)).size !== 4) return false;
    for (const option of question.options) {
      if (!ids.has(option.directionId) || option.score !== undefined) return false;
      exposure[option.directionId]++;
    }
  }
  const comparisons = quiz.directions[0].comparisons;
  return Number.isInteger(comparisons) && comparisons! > 0
    && quiz.directions.every(d => d.comparisons === comparisons && exposure[d.id] === comparisons)
    && quiz.profiles.length === quiz.directions.length
    && new Set(quiz.profiles.map(p => p.id)).size === quiz.profiles.length
    && quiz.directions.every(d => quiz.profiles.filter(p => p.directionIds.length === 1 && p.directionIds[0] === d.id).length === 1);
}

export function scoreArchetypeQuestionnaire(quiz: Questionnaire, answers: unknown): ArchetypeResult {
  if (!isArchetypeConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!object(answers)) return { status: "invalid", answered: 0 };
  const questions = new Map(quiz.questions.map(q => [q.id, q]));
  const counts = Object.fromEntries(quiz.directions.map(d => [d.id, 0]));
  let answered = 0;
  for (const [id, value] of Object.entries(answers)) {
    const option = questions.get(id)?.options.find(o => o.id === value);
    if (!option) return { status: "invalid", answered };
    counts[option.directionId]++; answered++;
  }
  if (answered !== quiz.questions.length) return { status: "incomplete", answered };
  const highest = Math.max(...Object.values(counts));
  return { status: "complete", answered, counts, profileIds: quiz.profiles.filter(p => counts[p.directionIds[0]] === highest).map(p => p.id) };
}

export const isQuestionnaireConfigurationValid = (quiz: Questionnaire) => quiz.kind === "care-feelings20" ? isCareFeelings20ConfigurationValid(quiz) : quiz.kind === "social-context20" ? isSocialContext20ConfigurationValid(quiz) : quiz.kind === "number-context20" ? isNumberContext20ConfigurationValid(quiz) : quiz.kind === "written-language20" ? isWrittenLanguage20ConfigurationValid(quiz) : quiz.kind === "nakshatra27" ? isNakshatra27ConfigurationValid(quiz) : quiz.kind === "focus-context16" ? isFocusContext16ConfigurationValid(quiz) : quiz.kind === "unwanted-actions20" ? isUnwantedActions20ConfigurationValid(quiz) : quiz.kind === "sudden-fear20" ? isSuddenFear20ConfigurationValid(quiz) : quiz.kind === "weton-story35" ? isWetonStory35ConfigurationValid(quiz) : quiz.kind === "health-worries21" ? isHealthWorry21ConfigurationValid(quiz) : quiz.kind === "sleep-experiences20" ? isSleepExperiences20ConfigurationValid(quiz) : quiz.kind === "bpi21" ? isBpi21ConfigurationValid(quiz) : quiz.kind === "bereavement16" ? isBereavement16ConfigurationValid(quiz) : quiz.kind === "support-reflection18" ? isSupportReflection18ConfigurationValid(quiz) : quiz.kind === "connection-checkin21" ? isConnectionCheckIn21ConfigurationValid(quiz) : quiz.kind === "pressure-actions12" ? isPressureActions12ConfigurationValid(quiz) : quiz.kind === "trauma-response20" ? isTraumaResponse20ConfigurationValid(quiz) : quiz.kind === "written-coordination" ? isWrittenCoordinationConfigurationValid(quiz) : quiz.kind === "distributed-work24" ? isDistributedWork24ConfigurationValid(quiz) : quiz.kind === "work-role12" ? isWorkRole12ConfigurationValid(quiz) : quiz.kind === "sbti31" ? isSbti31ConfigurationValid(quiz) : quiz.kind === "tipi10" ? isTipi10ConfigurationValid(quiz) : quiz.kind === "critical30" ? isCritical30ConfigurationValid(quiz) : quiz.kind === "reasoning18" ? isReasoning18ConfigurationValid(quiz) : quiz.kind === "mattering10" ? isMattering10ConfigurationValid(quiz) : quiz.kind === "technical30" ? isTechnical30ConfigurationValid(quiz) : quiz.kind === "afqt32" ? isAfqt32ConfigurationValid(quiz) : quiz.kind === "anger20" ? isAnger20ConfigurationValid(quiz) : quiz.kind === "sens16" ? isSens16ConfigurationValid(quiz) : quiz.kind === "dvmsq18" ? isDvmsq18ConfigurationValid(quiz) : quiz.kind === "synes15" ? isSynes15ConfigurationValid(quiz) : quiz.kind === "imagery12" ? isImagery12ConfigurationValid(quiz) : quiz.kind === "imposter20" ? isImposter20ConfigurationValid(quiz) : quiz.kind === "catq25" ? isCatQ25ConfigurationValid(quiz) : quiz.kind === "most-least" ? isMostLeastConfigurationValid(quiz) : quiz.kind === "career-theme-compare" ? isCareerMatchConfigurationValid(quiz) : quiz.kind === "love-type16" ? isLoveType16ConfigurationValid(quiz) : quiz.kind === "fds32" ? isFds32ConfigurationValid(quiz) : quiz.kind === "mental-age" ? isMentalAgeConfigurationValid(quiz) : quiz.kind === "mini-orientation" ? isMiniOrientationConfigurationValid(quiz) : quiz.kind === "stress-reflection4" ? isStressReflection4ConfigurationValid(quiz) : quiz.kind === "mini-conflict" ? isMiniConflictConfigurationValid(quiz) : quiz.kind === "four-axes" ? isFourAxesConfigurationValid(quiz) : (quiz.kind === "mini-virtues" || quiz.slug === "seven-sins-virtues-test") ? isMiniVirtuesConfigurationValid(quiz) : quiz.slug === "euphoria-character-quiz" ? isEuphoriaConfigurationValid(quiz) : quiz.kind === "mini-shadow" ? isMiniShadowConfigurationValid(quiz) : quiz.kind === "preparation-actions20" ? isPreparationActions20ConfigurationValid(quiz) : quiz.kind === "mini-coping" ? isMiniCopingConfigurationValid(quiz) : quiz.kind === "mini-habit" ? isMiniHabitConfigurationValid(quiz) : quiz.kind === "mini-intimacy" ? isMiniIntimacyConfigurationValid(quiz) : quiz.kind === "natal-chart" ? isNatalChartConfigurationValid(quiz) : quiz.kind === "mini-breakup" ? isMiniBreakupConfigurationValid(quiz) : quiz.kind === "holding-back35" ? isHoldingBack35ConfigurationValid(quiz) : quiz.kind === "fscrs22" ? isFscrs22ConfigurationValid(quiz) : quiz.kind === "parenting-practices" ? isParentingPracticesConfigurationValid(quiz) : quiz.kind === "spq92" ? isSpq92ConfigurationValid(quiz) : quiz.kind === "adexi14" ? isAdexi14ConfigurationValid(quiz) : quiz.kind === "mini-friction" ? isMiniFrictionConfigurationValid(quiz) : quiz.kind === "ctl41" ? isCtl41ConfigurationValid(quiz) : quiz.kind === "ptq15" ? isPtq15ConfigurationValid(quiz) : quiz.kind === "interaction-pairs" ? isInteractionPairsConfigurationValid(quiz) : quiz.kind === "skills-evidence" ? isSkillsEvidenceConfigurationValid(quiz) : quiz.kind === "saps" ? isSapsConfigurationValid(quiz) : quiz.kind === "scs26" ? isScs26ConfigurationValid(quiz) : quiz.kind === "cbi" ? isCbiConfigurationValid(quiz) : quiz.kind === "rosenberg" ? isRosenbergConfigurationValid(quiz) : quiz.kind === "political-coordinates" ? isPoliticalCoordinatesConfigurationValid(quiz) : quiz.kind === "data-entry" ? isDataEntryConfigurationValid(quiz) : quiz.kind === "secs" ? isSecsConfigurationValid(quiz) : quiz.kind === "paired-dimensions" ? isPairedDimensionsConfigurationValid(quiz) : quiz.kind === "typing" ? isTypingConfigurationValid(quiz) : quiz.kind === "eight-values" ? isEightValuesConfigurationValid(quiz) : quiz.kind === "ten-key" ? isTenKeyConfigurationValid(quiz) : quiz.kind === "practice" ? isPracticeConfigurationValid(quiz) : quiz.kind === "compass" ? isCompassConfigurationValid(quiz) : quiz.kind === "optimism" ? isOptimismConfigurationValid(quiz) : quiz.kind === "attachment" ? isAttachmentConfigurationValid(quiz) : quiz.kind === "affection" ? isAffectionConfigurationValid(quiz) : quiz.kind === "extraversion" ? isExtraversionConfigurationValid(quiz) : quiz.kind === "alignment" ? isAlignmentConfigurationValid(quiz) : quiz.kind === "likert"
  ? isLikertConfigurationValid(quiz) : quiz.kind === "archetype" ? isArchetypeConfigurationValid(quiz) : isDirectionalConfigurationValid(quiz);
export const scoreQuestionnaire = (quiz: Questionnaire, answers: unknown) => quiz.kind === "care-feelings20" ? { status: "unavailable", answered: 0 } as const : quiz.kind === "social-context20" ? { status: "unavailable", answered: 0 } as const : quiz.kind === "number-context20" ? { status: "unavailable", answered: 0 } as const : quiz.kind === "written-language20" ? { status: "unavailable", answered: 0 } as const : quiz.kind === "nakshatra27" ? { status: "unavailable", answered: 0 } as const : quiz.kind === "focus-context16" ? { status: "unavailable", answered: 0 } as const : quiz.kind === "unwanted-actions20" ? { status: "unavailable", answered: 0 } as const : quiz.kind === "sudden-fear20" ? { status: "unavailable", answered: 0 } as const : quiz.kind === "weton-story35" ? { status: "unavailable", answered: 0 } as const : quiz.kind === "health-worries21" ? { status: "unavailable", answered: 0 } as const : quiz.kind === "sleep-experiences20" ? { status: "unavailable", answered: 0 } as const : quiz.kind === "bpi21" ? { status: "unavailable", answered: 0 } as const : quiz.kind === "bereavement16" ? { status: "unavailable", answered: 0 } as const : quiz.kind === "support-reflection18" ? { status: "unavailable", answered: 0 } as const : quiz.kind === "connection-checkin21" ? { status: "unavailable", answered: 0 } as const : quiz.kind === "pressure-actions12" ? { status: "unavailable", answered: 0 } as const : quiz.kind === "trauma-response20" ? { status: "unavailable", answered: 0 } as const : quiz.kind === "written-coordination" ? { status: "unavailable", answered: 0 } as const : quiz.kind === "distributed-work24" ? recordDistributedWork24(quiz, answers) : quiz.kind === "work-role12" ? recordWorkRole12(quiz, answers) : quiz.kind === "sbti31" ? { status: "unavailable", answered: 0 } as const : quiz.kind === "tipi10" ? scoreTipi10Questionnaire(quiz, answers) : quiz.kind === "critical30" ? { status: "unavailable", answered: 0 } as const : quiz.kind === "reasoning18" ? { status: "unavailable", answered: 0 } as const : quiz.kind === "mattering10" ? { status: "unavailable", answered: 0 } as const : quiz.kind === "technical30" ? { status: "unavailable", answered: 0 } as const : quiz.kind === "afqt32" ? { status: "unavailable", answered: 0 } as const : quiz.kind === "anger20" ? { status: "unavailable", answered: 0 } as const : quiz.kind === "sens16" ? { status: "unavailable", answered: 0 } as const : quiz.kind === "dvmsq18" ? { status: "unavailable", answered: 0 } as const : quiz.kind === "synes15" ? { status: "unavailable", answered: 0 } as const : quiz.kind === "imagery12" ? { status: "unavailable", answered: 0 } as const : quiz.kind === "imposter20" ? { status: "unavailable", answered: 0 } as const : quiz.kind === "catq25" ? { status: "unavailable", answered: 0 } as const : quiz.kind === "most-least" ? { status: "unavailable", answered: 0 } as const : quiz.kind === "career-theme-compare" ? { status: "unavailable", answered: 0 } as const : quiz.kind === "love-type16" ? scoreLoveType16Questionnaire(quiz, answers) : quiz.kind === "fds32" ? scoreFds32Questionnaire(quiz, answers) : quiz.kind === "mental-age" ? scoreMentalAgeQuestionnaire(quiz, answers) : quiz.kind === "mini-orientation" ? recordMiniOrientationQuestionnaire(quiz, answers) : quiz.kind === "stress-reflection4" ? scoreStressReflection4Questionnaire(quiz, answers) : quiz.kind === "mini-conflict" ? scoreMiniConflictQuestionnaire(quiz, answers) : quiz.kind === "four-axes" ? scoreFourAxesQuestionnaire(quiz, answers) : (quiz.kind === "mini-virtues" || quiz.slug === "seven-sins-virtues-test") ? scoreMiniVirtuesQuestionnaire(quiz, answers) : quiz.slug === "euphoria-character-quiz" ? (isEuphoriaConfigurationValid(quiz) ? scoreArchetypeQuestionnaire(quiz, answers) : { status: "unavailable", answered: 0 } as const) : quiz.kind === "mini-shadow" ? scoreMiniShadowQuestionnaire(quiz, answers) : quiz.kind === "preparation-actions20" ? scorePreparationActions20Questionnaire(quiz, answers) : quiz.kind === "mini-coping" ? scoreMiniCopingQuestionnaire(quiz, answers) : quiz.kind === "mini-habit" ? scoreMiniHabitQuestionnaire(quiz, answers) : quiz.kind === "mini-intimacy" ? scoreMiniIntimacyQuestionnaire(quiz, answers) : quiz.kind === "natal-chart" ? { status: "unavailable", answered: 0 } as const : quiz.kind === "mini-breakup" ? scoreMiniBreakupQuestionnaire(quiz, answers) : quiz.kind === "holding-back35" ? scoreHoldingBack35Questionnaire(quiz, answers) : quiz.kind === "fscrs22" ? scoreFscrs22Questionnaire(quiz, answers) : quiz.kind === "parenting-practices" ? scoreParentingPracticesQuestionnaire(quiz, answers) : quiz.kind === "spq92" ? scoreSpq92Questionnaire(quiz, answers) : quiz.kind === "adexi14" ? scoreAdexi14Questionnaire(quiz, answers) : quiz.kind === "mini-friction" ? scoreMiniFrictionQuestionnaire(quiz, answers) : quiz.kind === "ctl41" ? scoreCtl41Questionnaire(quiz, answers) : quiz.kind === "ptq15" ? scorePtq15Questionnaire(quiz, answers) : quiz.kind === "interaction-pairs" ? scoreInteractionPairsQuestionnaire(quiz, answers) : quiz.kind === "skills-evidence" ? scoreSkillsEvidenceQuestionnaire(quiz, answers) : quiz.kind === "saps" ? scoreSapsQuestionnaire(quiz, answers) : quiz.kind === "scs26" ? scoreScs26Questionnaire(quiz, answers) : quiz.kind === "cbi" ? scoreCbiQuestionnaire(quiz, answers) : quiz.kind === "rosenberg" ? scoreRosenbergQuestionnaire(quiz, answers) : quiz.kind === "political-coordinates" ? scorePoliticalCoordinatesQuestionnaire(quiz, answers) : quiz.kind === "data-entry" ? { status: "unavailable", answered: 0 } as const : quiz.kind === "secs" ? scoreSecsQuestionnaire(quiz, answers) : quiz.kind === "paired-dimensions" ? scorePairedDimensionsQuestionnaire(quiz, answers) : quiz.kind === "typing" ? { status: "unavailable", answered: 0 } as const : quiz.kind === "eight-values" ? scoreEightValuesQuestionnaire(quiz, answers) : quiz.kind === "ten-key" ? { status: "unavailable", answered: 0 } as const : quiz.kind === "practice" ? scorePracticeQuestionnaire(quiz, answers) : quiz.kind === "compass" ? scoreCompassQuestionnaire(quiz, answers) : quiz.kind === "optimism" ? scoreOptimismQuestionnaire(quiz, answers) : quiz.kind === "attachment" ? scoreAttachmentQuestionnaire(quiz, answers) : quiz.kind === "affection" ? scoreAffectionQuestionnaire(quiz, answers) : quiz.kind === "extraversion" ? scoreExtraversionQuestionnaire(quiz, answers) : quiz.kind === "alignment" ? scoreAlignmentQuestionnaire(quiz, answers) : quiz.kind === "likert"
  ? scoreLikertQuestionnaire(quiz, answers) : quiz.kind === "archetype" ? scoreArchetypeQuestionnaire(quiz, answers) : scoreDirectionalQuestionnaire(quiz, answers);

export function readQuestionnaireDraft(quiz: Questionnaire, raw: string | null, now = Date.now()): QuestionnaireAnswers | null {
  if (!raw || quiz.kind === "afqt32" || quiz.kind === "anger20" || quiz.kind === "sens16" || quiz.kind === "dvmsq18" || quiz.kind === "synes15" || quiz.kind === "imagery12" || quiz.kind === "imposter20" || quiz.kind === "catq25" || quiz.kind === "most-least" || quiz.kind === "mini-orientation" || quiz.kind === "stress-reflection4" || quiz.kind === "four-axes" || quiz.kind === "natal-chart" || quiz.kind === "fscrs22" || quiz.kind === "typing" || quiz.kind === "data-entry") return null;
  try {
    const draft: unknown = JSON.parse(raw);
    if (!object(draft) || draft.version !== quiz.version || typeof draft.savedAt !== "number" || !Number.isFinite(draft.savedAt)) return null;
    const age = now - draft.savedAt;
    if (age < 0 || age >= 24 * 60 * 60 * 1000 || !object(draft.answers)) return null;
    const result = scoreQuestionnaire(quiz, draft.answers);
    return result.status === "complete" || result.status === "incomplete" ? draft.answers as QuestionnaireAnswers : null;
  } catch { return null; }
}
