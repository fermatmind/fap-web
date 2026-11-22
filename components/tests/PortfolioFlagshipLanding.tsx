import Link from "next/link";
import temperament from "@/lib/entertainment/flagship/temperament.json";
import { temperamentPresentation } from "@/lib/entertainment/flagship/temperament-config";
import ponyRoles from "@/lib/entertainment/flagship/my-little-pony-character-quiz.json";
import { ponyRolePresentation } from "@/lib/entertainment/flagship/pony-role-config";
import moralDilemma from "@/lib/entertainment/flagship/moral-dilemma-test.json";
import { moralDilemmaPresentation } from "@/lib/entertainment/flagship/moral-dilemma-config";
import harryPotter from "@/lib/entertainment/flagship/harry-potter-character.json";
import { harryPotterPresentation } from "@/lib/entertainment/flagship/harry-potter-config";
import flowerRoles from "@/lib/entertainment/flagship/flower.json";
import { flowerPresentation } from "@/lib/entertainment/flagship/flower-config";
import strangerThings from "@/lib/entertainment/flagship/stranger-things.json";
import { strangerThingsPresentation } from "@/lib/entertainment/flagship/stranger-things-config";
import connectionIdeals from "@/lib/entertainment/flagship/connection-ideals.json";
import { connectionRolePresentation } from "@/lib/entertainment/flagship/connection-role-config";
import twilightRole from "@/lib/entertainment/flagship/twilight-character.json";
import { twilightRolePresentation } from "@/lib/entertainment/flagship/twilight-role-config";
import pastLifeStory from "@/lib/entertainment/flagship/past-life.json";
import { pastLifeStoryPresentation } from "@/lib/entertainment/flagship/past-life-story-config";
import hazbinRole from "@/lib/entertainment/flagship/hazbin-hotel-character-quiz.json";
import { hazbinRolePresentation } from "@/lib/entertainment/flagship/hazbin-role-config";
import aestheticCore from "@/lib/entertainment/flagship/aesthetic-core-test.json";
import { aestheticCorePresentation } from "@/lib/entertainment/flagship/aesthetic-core-config";
import elemental from "@/lib/entertainment/flagship/what-element-am-i.json";
import { elementalPresentation } from "@/lib/entertainment/flagship/elemental-config";
import Image from "next/image";
import { temperamentCurrentEntryCopy } from "@/components/questionnaires/TemperamentLandingEditorial";
import moralAlignment from "@/lib/entertainment/flagship/moral-alignment.json";
import { alignmentPresentation, alignmentSamples } from "@/lib/entertainment/flagship/alignment-config";
import { moralAlignmentCurrentEntryCopy } from "@/components/questionnaires/MoralAlignmentLandingEditorial";
import logicalPractice from "@/lib/entertainment/flagship/logical-reasoning.json";
import { logicalPracticePresentation } from "@/lib/entertainment/flagship/logical-reasoning-config";
import conservatism from "@/lib/entertainment/flagship/conservatism.json";
import abstractPractice from "@/lib/entertainment/flagship/abstract-reasoning.json";
import { abstractPracticePresentation } from "@/lib/entertainment/flagship/abstract-reasoning-config";
import situationalJudgement from "@/lib/entertainment/flagship/situational-judgement.json";
import { situationalJudgementPresentation } from "@/lib/entertainment/flagship/situational-judgement-config";
import problemSolving from "@/lib/entertainment/flagship/problem-solving-critical-thinking.json";
import { problemSolvingPresentation } from "@/lib/entertainment/flagship/problem-solving-critical-thinking-config";
import optimism from "@/lib/entertainment/flagship/optimism-pessimism.json";
import { optimismPresentation, optimismSamples, optimismSpectrum } from "@/lib/entertainment/flagship/optimism-config";
import { scoreOptimismQuestionnaire } from "@/lib/questionnaires/optimism";
import dataEntry from "@/lib/entertainment/flagship/data-entry.json";
import { dataEntryPresentation, dataEntrySamples, dataEntrySampleHeading } from "@/lib/entertainment/flagship/data-entry-config";
import numberSeries from "@/lib/entertainment/flagship/number-series.json";
import { numberSeriesPresentation } from "@/lib/entertainment/flagship/number-series-config";
import freudianPersonality from "@/lib/entertainment/flagship/freudian-personality.json";
import { freudianPersonalityConfig } from "@/lib/entertainment/flagship/freudian-personality-config";
import { currentStandaloneGuidePrivacy } from "@/lib/entertainment/flagship/standalone-guide-privacy";
import numericalPractice from "@/lib/entertainment/flagship/numerical-reasoning.json";
import { numericalPracticePresentation } from "@/lib/entertainment/flagship/numerical-reasoning-config";
import hexaco from "@/lib/entertainment/flagship/hexaco.json";
import { hexacoConfig } from "@/lib/entertainment/flagship/hexaco-config";
import germanPractice from "@/lib/entertainment/flagship/german-proficiency.json";
import { germanPracticePresentation } from "@/lib/entertainment/flagship/german-proficiency-config";
import englishPractice from "@/lib/entertainment/flagship/english-proficiency.json";
import { englishPracticePresentation } from "@/lib/entertainment/flagship/english-proficiency-config";
import computerLiteracy from "@/lib/entertainment/flagship/computer-literacy.json";
import { computerLiteracyPresentation } from "@/lib/entertainment/flagship/computer-literacy-config";
import aptitudePractice from "@/lib/entertainment/flagship/aptitude-test.json";
import { aptitudePracticePresentation } from "@/lib/entertainment/flagship/aptitude-test-config";
import values from "@/lib/entertainment/flagship/values.json";
import { valuesPresentation, valuesSamples } from "@/lib/entertainment/flagship/values-config";
import { QuestionnaireMfq2Attribution } from "@/components/questionnaires/QuestionnaireMfq2Attribution";
import moralitySix from "@/lib/entertainment/flagship/morality-6.json";
import { moralitySixConfig } from "@/lib/entertainment/flagship/morality-six-config";
import { frictionCurrentEntryCopy } from "@/components/questionnaires/FrictionLandingEditorial";
import { musicCurrentEntryCopy } from "@/components/questionnaires/MusicLandingEditorial";
import politicalCoordinates from "@/lib/entertainment/flagship/political-coordinates.json";
import { politicalCoordinatesPresentation, politicalCoordinateSamples, politicalChoiceNote, politicalCoordinatesCurrentGuideCopy, conservatismPresentation, conservatismSamples, conservatismChoiceNote } from "@/lib/entertainment/flagship/policy-samples";
import musicTaste from "@/lib/entertainment/flagship/music-taste-test.json";
import { musicTasteConfig } from "@/lib/entertainment/flagship/music-taste-config";
import difficultPerson from "@/lib/entertainment/flagship/difficult-person-test.json";
import { difficultPersonConfig } from "@/lib/entertainment/flagship/difficult-person-config";
import wholesomePartner from "@/lib/entertainment/flagship/wholesome-partner.json";
import { wholesomePartnerConfig } from "@/lib/entertainment/flagship/wholesome-partner-config";
import relationshipCommitment from "@/lib/entertainment/flagship/relationship-commitment.json";
import { relationshipCommitmentConfig } from "@/lib/entertainment/flagship/relationship-commitment-config";
import communicationAdaptability from "@/lib/entertainment/flagship/communication-adaptability.json";
import { communicationAdaptabilityPresentation } from "@/lib/entertainment/flagship/communication-adaptability-config";
import humorStyle from "@/lib/entertainment/flagship/humor-style-test.json";
import { humorStyleConfig } from "@/lib/entertainment/flagship/humor-style-config";
import relationshipValues from "@/lib/entertainment/flagship/relationship-values.json";
import { relationshipValuesCounts, relationshipValuesCountPresentation } from "@/lib/entertainment/flagship/relationship-values-config";
import lovePersonality from "@/lib/entertainment/flagship/love-personality.json";
import { lovePersonalityCounts, lovePersonalityCountPresentation } from "@/lib/entertainment/flagship/love-personality-counts-config";
import attachmentStyles from "@/lib/entertainment/flagship/attachment-styles.json";
import { attachmentStylesConfig } from "@/lib/entertainment/flagship/attachment-styles-config";
import responseColor from "@/lib/entertainment/flagship/response-color.json";
import { responseColorCounts, responseColorCountPresentation } from "@/lib/entertainment/flagship/response-color-counts-config";
import socialBattery from "@/lib/entertainment/flagship/social-battery-test.json";
import { socialBatteryConfig } from "@/lib/entertainment/flagship/social-battery-config";
import parentingStyle from "@/lib/entertainment/flagship/parenting-style.json";
import parentingStyleScoringData from "@/lib/questionnaires/data/parenting-style.json";
import { parentingStyleConfig } from "@/lib/entertainment/flagship/parenting-style-config";
import apologyLanguage from "@/lib/entertainment/flagship/apology-language.json";
import { apologyLanguageConfig } from "@/lib/entertainment/flagship/apology-language-config";
import loveFight from "@/lib/entertainment/flagship/love-fight-style.json";
import { loveFightConfig } from "@/lib/entertainment/flagship/love-fight-config";
import loveLanguages from "@/lib/entertainment/flagship/love-languages.json";
import { loveLanguagesConfig } from "@/lib/entertainment/flagship/love-languages-config";
import likablePerson from "@/lib/entertainment/flagship/likable-person-test.json";
import relationshipPreferences from "@/lib/entertainment/flagship/relationship-preferences.json";
import { likableCounts, likableCountPresentation } from "@/lib/entertainment/flagship/likable-counts-config";
import { relationshipCounts, relationshipCountPresentation } from "@/lib/entertainment/flagship/relationship-counts-config";
import { countSamples } from "@/lib/entertainment/flagship/comparison-samples";
import { likableCurrentEntryCopy } from "@/components/questionnaires/LikableLandingEditorial";
import conflictStyles from "@/lib/entertainment/flagship/conflict-styles.json";
import { conflictStylesConfig } from "@/lib/entertainment/flagship/conflict-styles-config";
import intimacyValues from "@/lib/entertainment/flagship/intimacy-values.json";
import { intimacyValuesPresentation, intimacyValuesSamples, intimacyValuesSampleAnswers } from "@/lib/entertainment/flagship/intimacy-values-config";
import friendshipCompatibility from "@/lib/entertainment/flagship/friendship-compatibility.json";
import { friendshipCompatibilityPresentation, friendshipCompatibilitySamples, friendshipCompatibilitySampleAnswers } from "@/lib/entertainment/flagship/friendship-compatibility-config";
import peoplePleaser from "@/lib/entertainment/flagship/people-pleaser.json";
import { peoplePleaserPresentation, peoplePleaserSamples, peoplePleaserSampleAnswers } from "@/lib/entertainment/flagship/people-pleaser-config";
import { peoplePleaserCurrentEntryCopy } from "@/components/questionnaires/PeoplePleaserLandingEditorial";
import { QuestionnairePpsAttribution } from "@/components/questionnaires/QuestionnairePpsAttribution";
import communicationStyle from "@/lib/entertainment/flagship/communication-style.json";
import { communicationStylePresentation, communicationStyleSamples, communicationStyleSampleAnswers } from "@/lib/entertainment/flagship/communication-style-config";
import { communicationCurrentEntryCopy } from "@/components/questionnaires/CommunicationLandingEditorial";
import rizz from "@/lib/entertainment/flagship/rizz-test.json";
import { rizzPresentation, rizzSamples, rizzSampleAnswers } from "@/lib/entertainment/flagship/rizz-config";
import loveType from "@/lib/entertainment/flagship/love-type-16.json";
import loveTypeScoringData from "@/lib/questionnaires/data/love-type-16.json";
import { loveTypePresentation, loveTypeSamples } from "@/lib/entertainment/flagship/love-type-config";
import { LOVE_TYPE16_AXES, scoreLoveType16Questionnaire } from "@/lib/questionnaires/loveType16";
import characterStrengths from "@/lib/entertainment/flagship/character-strengths.json";
import { strengthsPresentation, strengthsSampleAnswers, strengthsSampleAxes, strengthsSamples } from "@/lib/entertainment/flagship/strengths-config";
import { strengthsCurrentEntryCopy } from "@/components/questionnaires/StrengthsLandingEditorial";
import { hogwartsCurrentEntryCopy } from "@/components/questionnaires/HogwartsLandingEditorial";
import { aestheticCurrentEntryCopy } from "@/components/questionnaires/AestheticLandingEditorial";
import { getInkblotStimulus } from "@/lib/questionnaires/inkblotStimuli";
import inkblot from "@/lib/entertainment/flagship/inkblot-personality-quiz.json";
import { inkblotPresentation, inkblotSampleDescription } from "@/lib/entertainment/flagship/inkblot-config";
import dexter from "@/lib/entertainment/flagship/dexter.json";
import { dexterPresentation } from "@/lib/entertainment/flagship/dexter-config";
import barbieRole from "@/lib/entertainment/flagship/barbie-character.json";
import { barbieRolePresentation } from "@/lib/entertainment/flagship/barbie-role-config";
import heroAcademia from "@/lib/entertainment/flagship/my-hero-academia-character-quiz.json";
import { heroAcademiaPresentation } from "@/lib/entertainment/flagship/hero-academia-config";
import jujutsuKaisen from "@/lib/entertainment/flagship/jujutsu-kaisen-character.json";
import { jujutsuKaisenPresentation } from "@/lib/entertainment/flagship/jujutsu-kaisen-config";
import gossipGirl from "@/lib/entertainment/flagship/gossip-girl.json";
import { gossipGirlPresentation } from "@/lib/entertainment/flagship/gossip-girl-config";
import gilmoreGirls from "@/lib/entertainment/flagship/gilmore-girls.json";
import { gilmoreGirlsPresentation } from "@/lib/entertainment/flagship/gilmore-girls-config";
import blueLock from "@/lib/entertainment/flagship/blue-lock.json";
import { blueLockPresentation } from "@/lib/entertainment/flagship/blue-lock-config";
import gameOfThrones from "@/lib/entertainment/flagship/game-of-thrones.json";
import { gameOfThronesPresentation } from "@/lib/entertainment/flagship/game-of-thrones-config";
import digitalCircus from "@/lib/entertainment/flagship/amazing-digital-circus.json";
import { digitalCircusPresentation } from "@/lib/entertainment/flagship/digital-circus-config";
import tarotMajor from "@/lib/entertainment/flagship/which-tarot-card-are-you.json";
import { tarotMajorPresentation } from "@/lib/entertainment/flagship/tarot-major-config";
import dndClass from "@/lib/entertainment/flagship/dungeons-dragons-class.json";
import { dndClassPresentation } from "@/lib/entertainment/flagship/dnd-class-config";
import greekGod from "@/lib/entertainment/flagship/greek-god.json";
import { greekGodPresentation } from "@/lib/entertainment/flagship/greek-god-config";
import wojak from "@/lib/entertainment/flagship/wojak.json";
import { wojakPresentation } from "@/lib/entertainment/flagship/wojak-config";
import mythicalCreature from "@/lib/entertainment/flagship/mythical-creature.json";
import { mythicalCreaturePresentation } from "@/lib/entertainment/flagship/mythical-creature-config";
import { mythicalCreatureSections } from "@/components/questionnaires/MythicalCreatureLandingEditorial";
import hogwarts from "@/lib/entertainment/flagship/hogwarts-house-quiz.json";
import { hogwartsPresentation } from "@/lib/entertainment/flagship/hogwarts-config";
import spiritAnimal from "@/lib/entertainment/flagship/spirit-animal.json";
import { spiritAnimalPresentation } from "@/lib/entertainment/flagship/spirit-animal-config";
import { spiritAnimalSections } from "@/components/questionnaires/SpiritAnimalLandingEditorial";
import superpower from "@/lib/entertainment/flagship/superpower-test.json";
import { superpowerPresentation } from "@/lib/entertainment/flagship/superpower-config";
import { superpowerSections } from "@/components/questionnaires/SuperpowerLandingEditorial";
import innerChild from "@/lib/entertainment/flagship/inner-child-personality-test.json";
import { innerChildPresentation } from "@/lib/entertainment/flagship/inner-child-config";
import wordSkills from "@/lib/entertainment/flagship/word-skills.json";
import { wordSkillsPresentation, wordSkillsRelated, wordSkillsRelatedPaths, wordSkillsSamples } from "@/lib/entertainment/flagship/word-skills-config";
import { practiceSampleAnswers } from "@/lib/entertainment/flagship/practice-samples";
import { scorePracticeQuestionnaire } from "@/lib/questionnaires/practice";
import maleArchetype from "@/lib/entertainment/flagship/male-archetype-test.json";
import { maleArchetypePresentation } from "@/lib/entertainment/flagship/male-archetype-config";
import { maleRoleLandingSections } from "@/components/questionnaires/MaleRoleLandingEditorial";
import eightValues from "@/lib/entertainment/flagship/8-values-political.json";
import { eightValuesPresentation, eightValuesSamples } from "@/lib/entertainment/flagship/eight-values-config";
import { eightValuesPairs, scoreEightValuesQuestionnaire } from "@/lib/questionnaires/eightValues";
import { PortfolioAxisBarSamples, type AxisSample } from "./PortfolioAxisBarSamples";
import type { ComponentType, ReactNode } from "react";
import { discExamples, discFreeAccess, discPresentation } from "@/lib/entertainment/flagship/disc-config";
import disc from "@/lib/entertainment/flagship/disc.json";
import { PortfolioSpectrumSamples } from "./PortfolioSpectrumSamples";
import { extraversionExamples, extraversionPresentation } from "@/lib/entertainment/flagship/extraversion-config";
import { scoreExtraversionQuestionnaire } from "@/lib/questionnaires/extraversion";
import extraversion from "@/lib/entertainment/flagship/introvert-extrovert.json";
import { dogBreedPresentation } from "@/lib/entertainment/flagship/dog-breed-config";
import { dogBreedSections } from "@/components/questionnaires/DogBreedLandingEditorial";
import { archetypeEditorial } from "@/lib/i18n/zh-TW/archetypeQuestionnaires";
import dogBreed from "@/lib/entertainment/flagship/what-dog-breed-am-i.json";
import { MoonPhaseExamples } from "@/components/questionnaires/MoonPhaseExamples";
import { DiscCitations } from "@/components/questionnaires/DiscLandingEditorial";
import { derePresentation } from "@/lib/entertainment/flagship/dere-config";
import dereType from "@/lib/entertainment/flagship/tsundere-dere-type.json";
import { moonPresentation } from "@/lib/entertainment/flagship/moon-config";
import { moonPhaseImage } from "@/lib/questionnaires/moonPhasePresentation";
import moonPhase from "@/lib/entertainment/flagship/moon-phase.json";
import { PhilosopherResultExamples } from "@/components/questionnaires/PhilosopherResultExamples";
import { philosopherPresentation } from "@/lib/entertainment/flagship/philosopher-config";
import { AdultAgePreferencesExamples } from "@/components/questionnaires/AdultAgePreferencesExamples";
import { adultAgeExamples, adultAgePresentation } from "@/lib/entertainment/flagship/adult-age-config";
import { scoreDirectionalQuestionnaire, scoreLikertQuestionnaire } from "@/lib/questionnaires/basicScoring";
import { scoreAttachmentQuestionnaire } from "@/lib/questionnaires/attachment";
import { scoreAffectionQuestionnaire } from "@/lib/questionnaires/affection";
import { scoreParentingPracticesQuestionnaire } from "@/lib/questionnaires/parentingPractices";
import { PortfolioRadarSamples } from "./PortfolioRadarSamples";
import { AuraColorResultExamples } from "@/components/questionnaires/AuraColorResultExamples";
import { CharacterLandingSamples } from "./CharacterLandingSamples";
import { ExploreChoicePreview } from "./ExploreLandingSamples";
import { ExploreLandingSchema } from "./ExploreLandingSchema";
import { TestExploreTemplate } from "./TestExploreTemplate";
import { displayNavigationPath } from "@/lib/i18n/traditionalRoutes";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import philosopher from "@/lib/entertainment/flagship/philosopher-personality-test.json";
import adultAge from "@/lib/entertainment/flagship/adult-age-preferences.json";
import auraColor from "@/lib/entertainment/flagship/aura-color.json";
import layout from "./test-explore-template.module.css";

type LandingCopy = {
  facts: string;
  intro: string;
  deliverables: readonly (readonly string[])[];
  interpretations: readonly (readonly string[])[];
  profiles: Record<string, readonly string[]>;
  faq: readonly (readonly string[])[];
  formula: string;
  boundary: string;
};

type DirectionalExample = { id: string; answers: string | readonly string[]; labels: Record<DisplayLocale, string> };
type FacetExamples = {
  decimals?: number;
  axes?: readonly string[];
  showRated?: boolean;
  cases: readonly { id: string; labels: Record<DisplayLocale, string> }[];
  answers: (quiz: Questionnaire, id: string) => QuestionnaireAnswers;
};
type FlagshipConfig = {
  copy: Record<DisplayLocale, LandingCopy>;
  workedExampleId?: string;
  related?: typeof wordSkillsRelated;
  relatedPaths?: readonly string[];
  questionStimulus?: (questionId: string, locale: DisplayLocale) => { src: string; alt: string } | undefined;
  omitGuideIds?: readonly string[];
  visibleGuideIds?: readonly string[];
  methodContent?: (quiz: Questionnaire, locale: DisplayLocale, key: Locale) => ReactNode;
  guideCopy?: (paragraph: string, locale: DisplayLocale) => string;
  additionalGuide?: (locale: DisplayLocale) => Questionnaire["guide"];
  extraReferences?: (locale: DisplayLocale) => Questionnaire["references"];
  referencePrefix?: string;
  Attribution?: ComponentType<{ locale: Locale; traditional?: boolean }>;
  notice?: Record<DisplayLocale, string>;
  freeAccessDescription?: Record<DisplayLocale, string>;
  sampleReport?: Record<DisplayLocale, string>;
  WorkedExamples?: ComponentType<{ quiz: Questionnaire; locale: Locale; displayLocale?: DisplayLocale }>;
} & (
  | { slot: "C"; sampleIds: readonly string[]; imageExtension?: string; imagePath?: (id: string) => string; presentation?: { [L in DisplayLocale]: Partial<(typeof philosopherPresentation)[L]> } }
  | { slot: "B"; facets: FacetExamples; presentation: typeof strengthsPresentation }
  | { slot: "B"; charts: (quiz: Questionnaire, locale: DisplayLocale, key: Locale) => readonly AxisSample[];
      note: (quiz: Questionnaire, question: Questionnaire["questions"][number], option: Questionnaire["questions"][number]["options"][number],
        locale: DisplayLocale, key: Locale) => string; presentation: typeof likableCountPresentation }
  | { slot: "B"; counts: readonly DirectionalExample[]; presentation: typeof likableCountPresentation }
  | { slot: "B"; practice: true | readonly DirectionalExample[]; presentation: typeof wordSkillsPresentation }
  | { slot: "B"; paired: "eight-values"; presentation: typeof eightValuesPresentation }
  | { slot: "B"; paired: "love-type"; presentation: typeof loveTypePresentation }
  | { slot: "B"; examples: readonly DirectionalExample[]; presentation: typeof adultAgePresentation }
  | { slot: "A"; optimism: true; presentation: typeof optimismPresentation }
  | { slot: "A"; examples: typeof extraversionExamples; presentation: typeof extraversionPresentation }
);

const noDraftNotice = {
  zh: "这份测试不保存答题进度。刷新、切换语言或离开后，需要重新开始。",
  "zh-TW": "這份測驗不會儲存作答進度。重新整理、切換語言或離開後，會從第一題開始。",
  en: "This quiz does not save your progress. If you refresh, switch languages, or leave, you start over.",
};

const catalog: Record<string, FlagshipConfig> = {
  "temperament": { slot: "C", copy: temperament, sampleIds: ["sanguine", "choleric", "phlegmatic"],
    imagePath: id => `/images/quiz-portraits/temperament-symbols/${id}.webp`, presentation: temperamentPresentation },
  "my-little-pony-character-quiz": { slot: "C", copy: ponyRoles, sampleIds: ["twilight-sparkle", "rainbow-dash", "fluttershy"],
    imagePath: id => `/images/quiz-portraits/pony-role-symbols/${id}.webp`, presentation: ponyRolePresentation },
  "moral-dilemma-test": { slot: "C", copy: moralDilemma, sampleIds: ["consequences", "principles", "care"],
    imagePath: id => `/images/quiz-portraits/dilemma-question-symbols/${id}.webp`, presentation: moralDilemmaPresentation },
  "moral-alignment": { slot: "B", copy: moralAlignment, presentation: alignmentPresentation, charts: alignmentSamples,
    note: (quiz, _question, option, locale, key) => ui[locale].chosen(quiz.directions.find(direction => direction.id === option.directionId)!.title[key]),
    notice: noDraftNotice },
  "logical-reasoning": { slot: "B", copy: logicalPractice, practice: true, presentation: logicalPracticePresentation },
  "conservatism": { slot: "B", copy: conservatism, presentation: conservatismPresentation, charts: conservatismSamples, note: conservatismChoiceNote,
    guideCopy: currentStandaloneGuidePrivacy, visibleGuideIds: ["facet-scoring", "facet-reading", "facet-comparison"] },
  "abstract-reasoning": { slot: "B", copy: abstractPractice, practice: true, presentation: abstractPracticePresentation, visibleGuideIds: ["counts"] },
  "situational-judgement": { slot: "B", copy: situationalJudgement, practice: true, presentation: situationalJudgementPresentation },
  "problem-solving-critical-thinking": { slot: "B", copy: problemSolving, practice: true, presentation: problemSolvingPresentation },
  "optimism-pessimism": { slot: "A", copy: optimism, optimism: true, presentation: optimismPresentation },
  "data-entry": { slot: "B", copy: dataEntry, presentation: dataEntryPresentation, charts: dataEntrySamples,
    note: () => "",
    methodContent: (quiz, locale, key) => <div className="grid gap-3">
      <h3>{dataEntrySampleHeading(locale)}</h3>
      {quiz.dataEntry?.rounds.map(round => <section key={round.id}>
        <h4>{round.title[key]}</h4>
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {round.fields.map((field, index) => <div key={field.id} className="min-w-0 rounded-lg border bg-white p-3 [overflow-wrap:anywhere]">
            <dt className="text-sm font-semibold">{field.title[key]}</dt>
            <dd className="font-mono">{round.records[0].values[index]}</dd>
          </div>)}
        </dl>
      </section>)}
    </div> },
  "number-series": { slot: "B", copy: numberSeries, practice: true, presentation: numberSeriesPresentation, visibleGuideIds: ["scoring"] },
  "freudian-personality": { slot: "B", copy: freudianPersonality, ...freudianPersonalityConfig, guideCopy: currentStandaloneGuidePrivacy,
    visibleGuideIds: ["facet-scoring", "facet-reading", "facet-comparison"] },
  "numerical-reasoning": { slot: "B", copy: numericalPractice, practice: true, presentation: numericalPracticePresentation },
  "hexaco": { slot: "B", copy: hexaco, ...hexacoConfig, guideCopy: currentStandaloneGuidePrivacy,
    visibleGuideIds: ["facet-scoring", "facet-reading", "facet-comparison"] },
  "german-proficiency": { slot: "B", copy: germanPractice, practice: true, presentation: germanPracticePresentation, visibleGuideIds: ["practice-count"] },
  "english-proficiency": { slot: "B", copy: englishPractice, practice: true, presentation: englishPracticePresentation },
  "computer-literacy": { slot: "B", copy: computerLiteracy, practice: true, presentation: computerLiteracyPresentation },
  "aptitude-test": { slot: "B", copy: aptitudePractice, practice: true, presentation: aptitudePracticePresentation },
  "harry-potter-character": { slot: "C", copy: harryPotter, sampleIds: ["harry-potter", "hermione-granger", "luna-lovegood"],
    imagePath: id => `/images/quiz-portraits/hp-role-symbols/${id}.webp`, presentation: harryPotterPresentation },
  "values": { slot: "B", copy: values, presentation: valuesPresentation, charts: valuesSamples,
    note: (_quiz, _question, option, locale) => typeof option.score === "number"
      ? valuesPresentation[locale].answerScore(option.score) : valuesPresentation[locale].unscored },
  "flower": { slot: "C", copy: flowerRoles, sampleIds: ["rose", "sunflower", "lavender"],
    imagePath: id => `/images/quiz-portraits/flower-symbols/${id}.webp`, presentation: flowerPresentation,
    notice: { en: "This question page does not save progress.", zh: "当前答题页不提供进度保存。", "zh-TW": "作答頁不會儲存答題進度。" } },
  "stranger-things": { slot: "C", copy: strangerThings, sampleIds: ["eleven", "mike-wheeler", "dustin-henderson"],
    imagePath: id => `/images/quiz-portraits/stranger-things-symbols/${id}.webp`, presentation: strangerThingsPresentation },
  "morality-6": { slot: "B", copy: moralitySix, ...moralitySixConfig, facets: { ...moralitySixConfig.facets, decimals: 2 }, Attribution: QuestionnaireMfq2Attribution,
    visibleGuideIds: ["facet-scoring", "facet-reading", "facet-comparison"] },
  "political-coordinates": { slot: "B", copy: politicalCoordinates, presentation: politicalCoordinatesPresentation,
    visibleGuideIds: ["two-axes", "display-bands", "meaning-limits"], guideCopy: politicalCoordinatesCurrentGuideCopy,
    charts: politicalCoordinateSamples, note: (quiz, _question, option, locale, key) => politicalChoiceNote(quiz, option.directionId, locale, key) },
  "music-taste-test": { slot: "B", copy: musicTaste, ...musicTasteConfig },
  "difficult-person-test": { slot: "B", copy: difficultPerson, ...difficultPersonConfig },
  "wholesome-partner": { slot: "B", copy: wholesomePartner, ...wholesomePartnerConfig },
  "relationship-commitment": { slot: "B", copy: relationshipCommitment, ...relationshipCommitmentConfig },
  "communication-adaptability": { slot: "B", copy: communicationAdaptability, practice: true, presentation: communicationAdaptabilityPresentation,
    visibleGuideIds: ["practice-key", "practice-close"] },
  "humor-style-test": { slot: "B", copy: humorStyle, ...humorStyleConfig },
  "relationship-values": { slot: "B", copy: relationshipValues, counts: relationshipValuesCounts, presentation: relationshipValuesCountPresentation,
    visibleGuideIds: ["low-direction-explanation", "raw-wins-explanation", "ties-explanation"] },
  "love-personality": { slot: "B", copy: lovePersonality, counts: lovePersonalityCounts, presentation: lovePersonalityCountPresentation },
  "attachment-styles": { slot: "B", copy: attachmentStyles, ...attachmentStylesConfig, notice: noDraftNotice },
  "response-color": { slot: "B", copy: responseColor, counts: responseColorCounts, presentation: responseColorCountPresentation },
  "social-battery-test": { slot: "B", copy: socialBattery, ...socialBatteryConfig },
  "parenting-style": { slot: "B", copy: parentingStyle, ...parentingStyleConfig },
  "apology-language": { slot: "B", copy: apologyLanguage, ...apologyLanguageConfig,
    visibleGuideIds: ["facet-scoring", "facet-reading", "facet-comparison"] },
  "love-fight-style": { slot: "B", copy: loveFight, ...loveFightConfig,
    visibleGuideIds: ["facet-scoring", "facet-reading", "facet-comparison"] },
  "love-languages": { slot: "B", copy: loveLanguages, ...loveLanguagesConfig },
  "connection-ideals": { slot: "C", copy: connectionIdeals, sampleIds: ["shared-spark", "steady-presence", "easy-companionship"],
    imagePath: id => `/images/quiz-portraits/connection-ideal-symbols/${id}.webp`, presentation: connectionRolePresentation },
  "likable-person-test": { slot: "B", copy: likablePerson, counts: likableCounts, presentation: likableCountPresentation, notice: noDraftNotice },
  "relationship-preferences": { slot: "B", copy: relationshipPreferences, counts: relationshipCounts, presentation: relationshipCountPresentation,
    visibleGuideIds: ["low-direction-explanation", "raw-wins-explanation", "ties-explanation"] },
  "conflict-styles": { slot: "B", copy: conflictStyles, ...conflictStylesConfig },
  "intimacy-values": { slot: "B", copy: intimacyValues, presentation: intimacyValuesPresentation,
    facets: { cases: intimacyValuesSamples, answers: intimacyValuesSampleAnswers, showRated: true } },
  "friendship-compatibility": { slot: "B", copy: friendshipCompatibility, presentation: friendshipCompatibilityPresentation,
    facets: { cases: friendshipCompatibilitySamples, answers: friendshipCompatibilitySampleAnswers, showRated: true } },
  "people-pleaser": { slot: "B", copy: peoplePleaser, presentation: peoplePleaserPresentation,
    facets: { cases: peoplePleaserSamples, answers: peoplePleaserSampleAnswers, showRated: true },
    notice: noDraftNotice, Attribution: QuestionnairePpsAttribution },
  "communication-style": { slot: "B", copy: communicationStyle, presentation: communicationStylePresentation,
    facets: { cases: communicationStyleSamples, answers: communicationStyleSampleAnswers, showRated: true },
    notice: noDraftNotice },
  "rizz-test": { slot: "B", copy: rizz, presentation: rizzPresentation,
    facets: { cases: rizzSamples, answers: rizzSampleAnswers, showRated: true } },
  "love-type-16": { slot: "B", paired: "love-type", copy: loveType, presentation: loveTypePresentation },
  "twilight-character": { slot: "C", copy: twilightRole, sampleIds: ["bella-swan", "alice-cullen", "emmett-cullen"],
    imagePath: id => `/images/quiz-portraits/twilight-role-symbols/${id}.webp`, presentation: twilightRolePresentation },
  "past-life": { slot: "C", copy: pastLifeStory, sampleIds: ["scribe", "printer", "chartmaker"],
    imagePath: id => `/images/quiz-portraits/past-life-story-symbols/${id}.webp`, presentation: pastLifeStoryPresentation },
  "hazbin-hotel-character-quiz": { slot: "C", copy: hazbinRole, sampleIds: ["charlie", "vaggie", "niffty"],
    imagePath: id => `/images/quiz-portraits/hazbin-role-symbols/${id}.webp`, presentation: hazbinRolePresentation },
  "character-strengths": { slot: "B", copy: characterStrengths, presentation: strengthsPresentation,
    facets: { axes: strengthsSampleAxes, cases: strengthsSamples, answers: strengthsSampleAnswers },
    notice: { zh: "这份测试不保存答题进度。刷新、切换语言或离开后，需要重新开始。",
      "zh-TW": "這份測驗不會儲存作答進度。重新整理、切換語言或離開後，會從第一題開始。",
      en: "This quiz does not save your progress. If you refresh, switch languages, or leave, you start over." } },
  "aesthetic-core-test": { slot: "C", copy: aestheticCore, sampleIds: ["cottagecore", "dark-academia", "cyberpunk"],
    imagePath: id => `/images/quiz-portraits/aesthetic-core-symbols/${id}.webp`, presentation: aestheticCorePresentation },
  "what-element-am-i": { slot: "C", copy: elemental, sampleIds: ["fire", "water", "earth"],
    imagePath: id => `/images/quiz-portraits/elemental-symbols/${id}.webp`, presentation: elementalPresentation },
  "inkblot-personality-quiz": { slot: "C", copy: inkblot, sampleIds: ["whole-form", "edge-detail", "contrast-noticing"],
    imagePath: id => `/images/quiz-portraits/inkblot-observation-symbols/${id}.webp`, presentation: inkblotPresentation,
    questionStimulus: (questionId, locale) => {
      const stimulus = getInkblotStimulus(questionId);
      return stimulus && { src: stimulus.src, alt: inkblotSampleDescription[locale] };
    } },
  "dexter": { slot: "C", copy: dexter, sampleIds: ["dexter-morgan", "debra-morgan", "james-doakes"],
    imagePath: id => `/images/quiz-portraits/dexter-editorial-symbols/${id}.webp`, presentation: dexterPresentation },
  "barbie-character": { slot: "C", copy: barbieRole, sampleIds: ["barbie", "weird-barbie", "allan"],
    imagePath: id => `/images/quiz-portraits/barbie-role-symbols/${id}.webp`, presentation: barbieRolePresentation },
  "my-hero-academia-character-quiz": { slot: "C", copy: heroAcademia, sampleIds: ["izuku-midoriya", "shoto-todoroki", "ochaco-uraraka"],
    imagePath: id => `/images/quiz-portraits/hero-academia-symbols/${id}.webp`, presentation: heroAcademiaPresentation },
  "jujutsu-kaisen-character": { slot: "C", copy: jujutsuKaisen, sampleIds: ["yuji-itadori", "satoru-gojo", "maki-zenin"],
    imagePath: id => `/images/quiz-portraits/jujutsu-kaisen-symbols/${id}.webp`, presentation: jujutsuKaisenPresentation },
  "gossip-girl": { slot: "C", copy: gossipGirl, sampleIds: ["serena", "blair", "jenny"],
    imagePath: id => `/images/quiz-portraits/gossip-girl-symbols/${id}.webp`, presentation: gossipGirlPresentation },
  "gilmore-girls": { slot: "C", copy: gilmoreGirls, sampleIds: ["lorelai-gilmore", "rory-gilmore", "paris-geller"],
    imagePath: id => `/images/quiz-portraits/gilmore-girls-symbols/${id}.webp`, presentation: gilmoreGirlsPresentation },
  "blue-lock": { slot: "C", copy: blueLock, sampleIds: ["isagi", "bachira", "chigiri"],
    imagePath: id => `/images/quiz-portraits/blue-lock-symbols/${id}.webp`, presentation: blueLockPresentation },
  "game-of-thrones": { slot: "C", copy: gameOfThrones, sampleIds: ["jon-snow", "arya-stark", "sansa-stark"],
    imagePath: id => `/images/quiz-portraits/thrones-role-symbols/${id}.webp`, presentation: gameOfThronesPresentation },
  "amazing-digital-circus": { slot: "C", copy: digitalCircus, sampleIds: ["pomni", "jax", "zooble"],
    imagePath: id => `/images/quiz-portraits/digital-circus-symbols/${id}.webp`, presentation: digitalCircusPresentation },
  "aura-color": { slot: "C", copy: auraColor, sampleIds: ["red", "green", "indigo"], imageExtension: "png",
    workedExampleId: "aura-examples", WorkedExamples: AuraColorResultExamples },
  "adult-age-preferences": { slot: "B", copy: adultAge, examples: adultAgeExamples, presentation: adultAgePresentation,
    workedExampleId: "age-result-examples", WorkedExamples: AdultAgePreferencesExamples },
  "philosopher-personality-test": { slot: "C", copy: philosopher, sampleIds: ["socrates", "confucius", "simone-de-beauvoir"],
    imageExtension: "svg", presentation: philosopherPresentation, workedExampleId: "philosopher-examples", WorkedExamples: PhilosopherResultExamples },
  "moon-phase": { slot: "C", copy: moonPhase, sampleIds: ["new-moon", "full-moon", "waning-crescent"],
    imagePath: moonPhaseImage, presentation: moonPresentation, workedExampleId: "moon-phase-examples", WorkedExamples: MoonPhaseExamples },
  "tsundere-dere-type": { slot: "C", copy: dereType, sampleIds: ["tsundere", "kuudere", "deredere"],
    imagePath: id => `/images/quiz-portraits/dere-original-symbols/${id}.png`, presentation: derePresentation, omitGuideIds: ["privacy"],
    notice: { zh: "这份测试不保存答题进度。刷新、切换语言或离开测试后，需要重新开始。",
      "zh-TW": "這份測驗不會儲存作答進度。重新整理、切換語言或離開後，會從第一題開始。",
      en: "This quiz does not save your progress. If you refresh, switch languages, or leave, you start over." } },
  "what-dog-breed-am-i": { slot: "C", copy: dogBreed, sampleIds: ["golden-retriever", "border-collie", "husky"],
    imagePath: id => `/images/quiz-portraits/dog-breed-symbols/${id}.png`, presentation: dogBreedPresentation,
    additionalGuide: locale => locale === "zh-TW" ? archetypeEditorial("what-dog-breed-am-i", "sections", dogBreedSections) : dogBreedSections,
    referencePrefix: "dog-breed",
    extraReferences: locale => [{ title: {
      en: "Morrill et al. (2022) · Ancestry-inclusive dog genomics challenges popular breed stereotypes",
      zh: locale === "zh-TW" ? "Morrill 等（2022）· 犬類祖源與犬種刻板印象研究" : "Morrill 等（2022）· 犬类祖源与犬种刻板印象研究",
    }, url: "https://pubmed.ncbi.nlm.nih.gov/35482869/" }] },
  "introvert-extrovert": { slot: "A", copy: extraversion, examples: extraversionExamples, presentation: extraversionPresentation,
    notice: { zh: "这份测试不保存答题进度。刷新、切换语言或离开后，需要重新开始。",
      "zh-TW": "這份測驗不會儲存作答進度。重新整理、切換語言或離開後，會從第一題開始。",
      en: "This quiz does not save your progress. If you refresh, switch languages, or leave, you start over." } },
  "which-tarot-card-are-you": { slot: "C", copy: tarotMajor, sampleIds: ["fool", "magician", "hermit"],
    imagePath: id => `/images/quiz-portraits/tarot-major-symbols/${id}.webp`, presentation: tarotMajorPresentation },
  "dungeons-dragons-class": { slot: "C", copy: dndClass, sampleIds: ["wizard", "sorcerer", "bard"],
    imagePath: id => `/images/quiz-portraits/dnd-role-symbols/${id}.webp`, presentation: dndClassPresentation },
  "greek-god": { slot: "C", copy: greekGod, sampleIds: ["zeus", "athena", "ares"],
    imagePath: id => `/images/quiz-portraits/greek-god-symbols/${id}.webp`, presentation: greekGodPresentation },
  wojak: { slot: "C", copy: wojak, sampleIds: ["feels-guy", "bloomer", "doomer"],
    imagePath: id => `/images/quiz-portraits/wojak-original-symbols/${id}.webp`, presentation: wojakPresentation },
  "mythical-creature": { slot: "C", copy: mythicalCreature, sampleIds: ["dragon", "unicorn", "mermaid"],
    imagePath: id => `/images/quiz-portraits/mythical-creature-symbols/${id}.webp`, presentation: mythicalCreaturePresentation,
    additionalGuide: locale => locale === "zh-TW" ? archetypeEditorial("mythical-creature", "sections", mythicalCreatureSections) : mythicalCreatureSections,
    extraReferences: locale => [{ title: { en: "American Museum of Natural History · Unicorn imagery across traditions",
      zh: locale === "zh-TW" ? "美國自然歷史博物館 · 獨角獸的不同文化形象" : "美国自然历史博物馆 · 独角兽的不同文化形象",
    }, url: "https://www.amnh.org/explore/ology/ology-cards/279-unicorn?view=modal" }] },
  "hogwarts-house-quiz": { slot: "C", copy: hogwarts, sampleIds: ["gryffindor", "ravenclaw", "slytherin"],
    imagePath: id => `/images/quiz-portraits/four-house-symbols/${id}.webp`, presentation: hogwartsPresentation },
  "spirit-animal": { slot: "C", copy: spiritAnimal, sampleIds: ["wolf", "dolphin", "otter"],
    imagePath: id => `/images/quiz-portraits/spirit-animal-symbols/${id}.webp`, presentation: spiritAnimalPresentation,
    additionalGuide: locale => locale === "zh-TW" ? archetypeEditorial("spirit-animal", "sections", spiritAnimalSections) : spiritAnimalSections,
    extraReferences: locale => [{ title: { en: "National Museum of the American Indian · Honoring Animal Relatives",
      zh: locale === "zh-TW" ? "美國印第安人國家博物館 · Honoring Animal Relatives" : "美国印第安人国家博物馆 · Honoring Animal Relatives",
    }, url: "https://americanindian.si.edu/nk360/informational/native-american-spirit-animal" }] },
  "superpower-test": { slot: "C", copy: superpower, sampleIds: ["telepathy", "flight", "time-control"],
    imagePath: id => `/images/quiz-portraits/superpower-symbols/${id}.webp`, presentation: superpowerPresentation,
    referencePrefix: "superpower",
    additionalGuide: locale => locale === "zh-TW" ? archetypeEditorial("superpower-test", "sections", superpowerSections) : superpowerSections,
    extraReferences: locale => [{ title: { en: "Eyal et al. (2018) · Perspective mistaking",
      zh: locale === "zh-TW" ? "Eyal 等（2018）· 獲取視角與設想視角的實驗研究" : "Eyal 等（2018）· 获取视角与设想视角的实验研究",
    }, url: "https://pubmed.ncbi.nlm.nih.gov/29620401/" }] },
  "inner-child-personality-test": { slot: "C", copy: innerChild, sampleIds: ["wonder-explorer", "independent-maker", "quiet-imaginer"],
    imagePath: id => `/images/quiz-portraits/inner-child-symbols/${id}.webp`, presentation: innerChildPresentation },
  "word-skills": { slot: "B", practice: wordSkillsSamples, copy: wordSkills, presentation: wordSkillsPresentation,
    related: wordSkillsRelated, relatedPaths: wordSkillsRelatedPaths },
  "male-archetype-test": { slot: "C", copy: maleArchetype, sampleIds: ["king", "warrior", "magician"],
    imagePath: id => `/images/quiz-portraits/four-roles-symbols/${id}.webp`, presentation: maleArchetypePresentation,
    additionalGuide: locale => {
      const background = maleRoleLandingSections.filter(section => section.id === "male-role-background");
      return locale === "zh-TW" ? archetypeEditorial("male-archetype-test", "sections", maleRoleLandingSections).filter(section => section.id === "male-role-background") : background;
    } },
  "8-values-political": { slot: "B", paired: "eight-values", copy: eightValues, presentation: eightValuesPresentation },
  disc: { slot: "B", copy: disc, examples: discExamples, presentation: discPresentation, freeAccessDescription: discFreeAccess,
    sampleReport: { zh: "查看完整报告示例", "zh-TW": "查看完整報告範例", en: "View a sample full report" },
    notice: { zh: "当前答题页不提供进度保存。", "zh-TW": "目前的作答頁面不會儲存進度。", en: "This question page does not save progress." } },
};

export const hasPortfolioFlagship = (slug: string) => Object.hasOwn(catalog, slug);

const ui = {
  en: {
    start: "Start test", endStart: "Take the aura color quiz", stylesLink: "Browse all seven aura color meanings", sampleLink: "See sample results", headline: "Original symbolic quiz · Full results free", guideFree: "Every guide is free to read before you take the quiz.", benefitsTitle: "What you’ll see after answering",
    stylesTitle: "Explore the seven color guides", scene: "Where you might see it", friction: "Something to watch for",
    exploreTitle: "Explore what interests you next", compareTitle: "Which test fits your question?",
    columns: ["Test", "What it explores", "Questions and time", "What you’ll get"],
    faqTitle: "Frequently asked questions", method: "How the result is calculated", guide: "Read the result guide",
    sample: "Illustrative color results", question: "Try one question", interpretation: "Three ways to read the result",
    trust: "21 questions · About 7 minutes · Free · No sign-up", boundary: "Sources, privacy and interpretation limits",
    current: ["Choices about everyday expression", "21 questions · about 7 minutes", "Seven counts and all highest matches"],
    related: [
      ["Big Five personality test", "Explore broader patterns such as openness to new experiences.", "Explore the Big Five", "90 or 120 questions", "Five trait scores"],
      ["Emotional intelligence test", "Reflect on noticing and responding to emotions in everyday situations.", "Explore emotional intelligence", "60 questions", "Emotional-intelligence self-reflection"],
      ["MBTI personality test", "Explore preferences for taking in information and making decisions.", "Explore MBTI preferences", "93 or 144 questions", "A four-letter type and preference explanation"],
    ],
    chosen: (direction: string) => `This choice adds one to the count for ${direction}.`,
  },
  zh: {
    start: "开始测试", endStart: "开始光环颜色测试", stylesLink: "浏览七种光环颜色的含义", sampleLink: "先看结果示例", headline: "原创象征测验 · 完整结果免费", guideFree: "每份指南都有具体例子，做题前就能免费阅读。", benefitsTitle: "答完后，你会看到什么",
    stylesTitle: "七种颜色结果指南", scene: "你可能在哪遇到它", friction: "值得留意",
    exploreTitle: "想继续了解什么？", compareTitle: "哪项测评适合现在的你？",
    columns: ["测试", "关注的问题", "题量与用时", "可看到的结果"],
    faqTitle: "常见问题", method: "光环颜色怎样计算", guide: "阅读结果指南",
    sample: "颜色结果示例", question: "试做一道题", interpretation: "结果可以从这三个角度读",
    trust: "21 题 · 约 7 分钟 · 免费 · 免注册", boundary: "展开来源、隐私与解读边界",
    current: ["日常表达方式", "21 题 · 约 7 分钟", "七项次数及所有最高结果"],
    related: [
      ["大五人格测试", "如果你想知道自己在更多情境下是否也愿意尝新，可以看看大五人格的开放性。", "了解大五人格", "90 或 120 题", "五项连续特质"],
      ["情商测试", "如果你更关心理解和回应情绪，可以继续观察这类日常反应。", "了解情商测试", "60 题", "情绪相关的自我观察"],
      ["MBTI 性格测试", "如果你想进一步看自己怎样获取信息和作决定，可以探索四组偏好。", "了解 MBTI 偏好", "93 或 144 题", "四字母类型和偏好解释"],
    ],
    chosen: (direction: string) => `选择这项会给「${direction}」计入 1 次。`,
  },
  "zh-TW": {
    start: "開始測驗", endStart: "開始光環顏色測驗", stylesLink: "瀏覽七種光環顏色的含義", sampleLink: "先看結果範例", headline: "原創象徵測驗 · 完整結果免費", guideFree: "每份指南都有具體例子，作答前就能免費閱讀。", benefitsTitle: "答完會看到什麼？",
    stylesTitle: "七種顏色的結果指南", scene: "你可能在哪些場合遇到", friction: "可以留意",
    exploreTitle: "還想多了解自己哪一面？", compareTitle: "哪一項測驗適合現在的你？",
    columns: ["測驗", "可以探索什麼", "題數與用時", "可查看的結果"],
    faqTitle: "常見問題", method: "光環顏色怎麼算？", guide: "閱讀完整結果指南",
    sample: "顏色結果範例", question: "先試答一題", interpretation: "從三個角度讀結果",
    trust: "21 題 · 約 7 分鐘 · 免費 · 免註冊", boundary: "展開來源、隱私及結果的解讀範圍",
    current: ["日常表達方式", "21 題 · 約 7 分鐘", "七色的選擇次數和所有最高結果"],
    related: [
      ["大五人格測驗", "如果你想知道自己在其他場合是否也喜歡接觸新事物，可以看看大五人格的開放性。", "認識大五人格", "90 或 120 題", "五項連續特質"],
      ["情緒智力測驗", "如果你想了解自己如何察覺、理解和回應情緒，可以再做一份生活情境自評。", "認識情緒智力", "60 題", "情緒相關的自我觀察"],
      ["MBTI 性格測驗", "如果你想進一步整理自己接收資訊和做決定的習慣，可以看看四組偏好。", "認識 MBTI 偏好", "93 或 144 題", "四字母類型和偏好說明"],
    ],
    chosen: (direction: string) => `這個選項會讓「${direction}」的選擇次數加 1。`,
  },
};

const legacyDraftSections: Record<string, string> = {
  "8-values-political": "private-responses", "love-type-16": "privacy", "amazing-digital-circus": "privacy",
  "game-of-thrones": "privacy", "blue-lock": "privacy", "gilmore-girls": "privacy", "gossip-girl": "privacy",
  "jujutsu-kaisen-character": "privacy", "my-hero-academia-character-quiz": "privacy", "barbie-character": "privacy",
  dexter: "privacy", wojak: "privacy", "male-archetype-test": "scope-privacy",
  "hazbin-hotel-character-quiz": "privacy", "twilight-character": "privacy",
  "my-little-pony-character-quiz": "privacy", "moral-dilemma-test": "review-privacy", "harry-potter-character": "privacy", "stranger-things": "privacy", "relationship-commitment": "draft-and-sharing", "response-color": "retest-boundary", "attachment-styles": "attachment-free", "love-personality": "private-by-choice", "relationship-values": "private-by-choice", "relationship-preferences": "private-by-choice", "parenting-style": "privacy", "love-languages": "privacy",
};

const entryCopyUpdates: Record<string, { sections: readonly string[]; current: (text: string, locale: Locale) => string }> = {
  temperament: { current: temperamentCurrentEntryCopy, sections: ["free-and-private"] },
  "moral-alignment": { current: moralAlignmentCurrentEntryCopy, sections: ["context-and-retest"] },
  "difficult-person-test": { current: frictionCurrentEntryCopy, sections: ["free-and-private"] },
  "music-taste-test": { current: musicCurrentEntryCopy, sections: ["free-and-private"] },
  "likable-person-test": { current: likableCurrentEntryCopy, sections: ["privacy"] },
  "people-pleaser": { sections: ["free-and-private"], current: peoplePleaserCurrentEntryCopy },
  "communication-style": { sections: ["communication-practice", "communication-retest"], current: communicationCurrentEntryCopy },
  "character-strengths": { sections: ["privacy"], current: strengthsCurrentEntryCopy },
  "hogwarts-house-quiz": { sections: ["privacy"], current: hogwartsCurrentEntryCopy },
  "aesthetic-core-test": { sections: ["free-and-private"], current: aestheticCurrentEntryCopy },
};

const relatedPaths = ["/tests/big-five-personality-test-ocean-model", "/tests/eq-test-emotional-intelligence-assessment", "/tests/mbti-personality-test-16-personality-types"];

export function PortfolioFlagshipLanding({ quiz, locale }: { quiz: Questionnaire; locale: DisplayLocale }) {
  const config = catalog[quiz.slug];
  const edit = config.copy[locale];
  const text = { ...ui[locale], ...config.presentation?.[locale] };
  const { workedExampleId, WorkedExamples, Attribution } = config;
  const localeKey = locale === "en" ? "en" : "zh";
  const entry = questionnairePath(locale, quiz.slug);
  const related = config.related?.[locale] ?? text.related;
  const exploreLinks = (config.relatedPaths ?? relatedPaths).map(path => displayNavigationPath(path, locale));
  const reference = (value: unknown) => Array.isArray(value) && value.length === 2;
  if (!edit.deliverables.every(reference) || !edit.faq.every(reference))
    throw new Error(`Invalid flagship copy for ${quiz.slug} (${locale})`);
  const profiles = quiz.profiles.map(profile => {
    const [title, lead, scene] = edit.profiles[profile.id];
    const relatedIndex = config.slot === "B" && "practice" in config ? 2 : ["red", "blue", "socrates", "aristotle"].includes(profile.id) ? 2
      : config.slot === "B" || ["green", "orange", "confucius", "simone-de-beauvoir", "marcus-aurelius"].includes(profile.id) ? 1 : 0;
    return {
      id: profile.id, range: profile.title[localeKey], title, lead, scene, guideSummary: profile.sections[0]?.title[localeKey],
      image: config.slot === "C" ? {
        src: config.imagePath?.(profile.id) ?? `/images/quiz-portraits/${quiz.slug}/${profile.id}.${config.imageExtension}`,
        alt: profile.title[localeKey],
      } : undefined,
      link: { href: questionnaireGuidePath(locale, quiz.slug, profile.id), label: text.guide },
      followUp: { href: exploreLinks[relatedIndex], label: related[relatedIndex][2] },
    };
  });
  const facetAxes = config.slot === "B" && "facets" in config
    ? config.facets.axes ?? quiz.directions.map(direction => direction.id)
    : [];
  const sample = config.slot === "C"
    ? <CharacterLandingSamples tone="night" label={text.sample} profiles={config.sampleIds.map(id => {
      const profile = profiles.find(item => item.id === id);
      if (!profile?.image) throw new Error(`Missing sample visual ${id} for ${quiz.slug}`);
      return { ...profile, image: profile.image };
    })} />
    : config.slot === "B" && "paired" in config && config.paired === "love-type" ? <PortfolioAxisBarSamples label={text.sample} legend={config.presentation[locale].legend}
      samples={loveTypeSamples.map(({ id, answers, labels }) => {
        // The Taiwan display projection appends readings. Score against the unchanged form, as the take page does.
        const form = loveTypeScoringData as Questionnaire;
        const result = scoreLoveType16Questionnaire(form, Object.fromEntries(form.questions.map((question, index) => [question.id, answers[index]])));
        if (result.status !== "complete") throw new Error(`Invalid flagship sample ${id} for ${quiz.slug}`);
        return { id, title: labels[locale], axes: result.loveType16.map((axis, index) => {
          const [left, right] = LOVE_TYPE16_AXES[index].sides;
          return {
            id: axis.id, title: config.presentation[locale].axes[index], value: axis.counts[left], maximum: 8,
            score: `${left.toUpperCase()} ${axis.counts[left]} / ${right.toUpperCase()} ${axis.counts[right]}`,
          };
        }) };
      })} />
    : config.slot === "B" && "paired" in config ? <PortfolioAxisBarSamples label={text.sample} legend={config.presentation[locale].legend}
      samples={eightValuesSamples.map(({ id, labels }) => {
        const results = scoreEightValuesQuestionnaire(quiz, Object.fromEntries(quiz.questions.map(question => {
          const effect = quiz.eightValues!.effects[question.id].scty;
          const option = id === "one-change" && question.id === "E8_006" ? "5"
            : id === "social-axis" && effect !== 0 ? (effect > 0 ? "5" : "1") : "3";
          return [question.id, option];
        })));
        if (results.status !== "complete") throw new Error(`Invalid flagship sample ${id} for ${quiz.slug}`);
        return { id, title: labels[locale], axes: eightValuesPairs.map(({ axis }, index) => ({
          id: axis, title: config.presentation[locale].axes[index],
          value: results.eightValuesAxes[axis].percentage, maximum: 100,
          score: `${config.presentation[locale].poles[index][0]} ${results.eightValuesAxes[axis].percentage}% / ${config.presentation[locale].poles[index][1]} ${results.eightValuesAxes[axis].complement}%`,
        })) };
      })} />
    : config.slot === "B" && "facets" in config ? <PortfolioAxisBarSamples label={text.sample} legend={config.presentation[locale].legend}
      samples={config.facets.cases.map(({ id, labels }) => {
        const answers = config.facets.answers(quiz, id);
        const result = quiz.kind === "affection" ? scoreAffectionQuestionnaire(quiz, answers)
          : quiz.kind === "attachment" ? scoreAttachmentQuestionnaire(quiz, answers)
          : quiz.kind === "parenting-practices" ? scoreParentingPracticesQuestionnaire(parentingStyleScoringData as Questionnaire, answers)
          : scoreLikertQuestionnaire(quiz, answers);
        if (result.status !== "complete") throw new Error(`Invalid flagship sample ${id} for ${quiz.slug}`);
        const facets = "affectionFacets" in result ? result.affectionFacets
          : "attachmentAxes" in result ? result.attachmentAxes : result.facets;
        return { id, title: labels[locale], axes: facetAxes.map(axis => {
          const { mean, sum, rated, total } = facets[axis];
          const displayMean = mean === null ? null : config.facets.decimals ? sum / rated : mean;
          const meanLabel = displayMean === null ? config.presentation[locale].insufficient : `${displayMean.toFixed(config.facets.decimals ?? 1)} / 5`;
          const ratedLabel = locale === "en" ? `${rated}/${total} rated` : `${rated}/${total} ${locale === "zh" ? "有效" : "有效作答"}`;
          const direction = quiz.directions.find(direction => direction.id === axis)!;
          return {
            id: axis, title: direction.title[localeKey], value: mean ?? 0, maximum: 5,
            score: config.facets.showRated ? `${meanLabel} · ${ratedLabel}` : meanLabel,
          };
        }) };
      })} />
    : config.slot === "B" && "charts" in config ? <PortfolioAxisBarSamples label={text.sample} legend={config.presentation[locale].legend}
      samples={config.charts(quiz, locale, localeKey)} />
    : config.slot === "B" && "counts" in config ? <PortfolioAxisBarSamples label={text.sample} legend={config.presentation[locale].legend}
      samples={countSamples(quiz, locale, localeKey, config.counts)} />
    : config.slot === "B" && "practice" in config ? <PortfolioAxisBarSamples label={text.sample} legend={config.presentation[locale].legend}
      samples={(config.practice === true ? practiceSampleAnswers(quiz) : config.practice).map(({ id, answers, labels }) => {
        const result = scorePracticeQuestionnaire(quiz, Object.fromEntries(quiz.questions.map((question, index) => [question.id, answers[index]])));
        if (result.status !== "complete") throw new Error(`Invalid flagship sample ${id} for ${quiz.slug}`);
        return { id, title: labels[locale], axes: quiz.directions.map(({ id, title }) => {
          const { correct, total } = result.practice.sections[id];
          return { id, title: title[localeKey], value: correct, maximum: total, score: `${correct} / ${total}` };
        }) };
      })} />
    : config.slot === "B" ? <PortfolioRadarSamples label={text.sample} legend={config.presentation[locale].legend} guideLabel={text.guide}
      samples={config.examples.map(({ id, answers, labels }) => {
        const result = scoreDirectionalQuestionnaire(quiz, Object.fromEntries(quiz.questions.map((question, index) => [question.id, answers[index]])));
        if (result.status !== "complete") throw new Error(`Invalid flagship sample ${id} for ${quiz.slug}`);
        return {
          id, title: labels[locale], guideHref: questionnaireGuidePath(locale, quiz.slug, result.profileId),
          axes: quiz.directions.map((direction, index) => ({
            id: direction.id, title: config.presentation[locale].axes[index], value: result.counts[direction.id], maximum: direction.comparisons!,
          })),
        };
      })} /> : "optimism" in config ? <PortfolioSpectrumSamples label={text.sample} minimum={10} maximum={50}
      scoreLabel={optimismSpectrum[locale].scoreLabel} endpoints={optimismSpectrum[locale].endpoints}
      samples={optimismSamples.map(({ id, answers, labels }) => {
        const result = scoreOptimismQuestionnaire(quiz, Object.fromEntries(quiz.questions.map((question, index) => [question.id, answers[index]])));
        if (result.status !== "complete" || result.total === null || result.mean === null)
          throw new Error(`Invalid flagship sample ${id} for ${quiz.slug}`);
        return { id, title: labels[locale], score: result.total, mean: `${optimismSpectrum[locale].meanLabel} ${result.mean.toFixed(1)} / 5`,
          guides: profiles.filter(profile => result.outlookProfileIds.includes(profile.id)).map(profile => ({ href: profile.link.href, title: profile.range })),
        };
      })} /> : <PortfolioSpectrumSamples label={text.sample} minimum={10} maximum={50}
      scoreLabel={config.presentation[locale].scoreLabel} endpoints={config.presentation[locale].endpoints}
      samples={config.examples.map(({ id, answers, labels }) => {
        const result = scoreExtraversionQuestionnaire(quiz, Object.fromEntries(quiz.questions.map((question, index) => [question.id, answers[index]])));
        if (result.status !== "complete" || result.total === null || result.mean === null)
          throw new Error(`Invalid flagship sample ${id} for ${quiz.slug}`);
        const mean = new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(result.mean);
        return {
          id, title: labels[locale], score: result.total, mean: `${config.presentation[locale].meanLabel} ${mean} / 5`,
          guides: profiles.filter(profile => result.scaleProfileIds.includes(profile.id)).map(profile => ({
            href: profile.link.href, title: profile.range,
          })),
        };
      })} />;
  const title = quiz.title[localeKey];
  const faq = edit.faq.map(([question, answer]) => [question, answer] as const);
  const questions = config.slot === "B" && "paired" in config && config.paired === "eight-values"
    ? quiz.questions.filter(question => question.id === "E8_006")
    : config.slot === "B" && "facets" in config
      ? quiz.questions.filter(question => question.options[0].directionId === facetAxes[0])
        .filter((question, index, list) => index === list.findIndex(item => item.reverse === question.reverse))
      : quiz.questions.slice(0, config.slot === "A" ? 2 : 1);
  const referencePrefix = config.referencePrefix ?? quiz.slug;
  const references = [...(quiz.references ?? []), ...(config.extraReferences?.(locale) ?? [])];
  const publicReference = (reference: NonNullable<Questionnaire["references"]>[number]) => !reference.hiddenOnLanding
    && (quiz.slug !== "disc" || !["jobcannon.io", "idrlabs.com"].some(domain => new URL(reference.url).hostname.replace(/^www\./, "") === domain));
  const scopeOfFreeAccess = config.freeAccessDescription?.[locale];
  const entryUpdate = entryCopyUpdates[quiz.slug];
  const currentGuideCopy = (value: string) => entryUpdate && locale !== "zh-TW" ? entryUpdate.current(value, locale) : value;
  // The standalone routes have no restorable tab drafts. The authored FAQs cover their current privacy behavior.
  const guideSections = [...quiz.guide, ...(config.additionalGuide?.(locale) ?? [])].filter(section =>
    !config.omitGuideIds?.includes(section.id) && section.id !== legacyDraftSections[quiz.slug]
    && !(locale === "zh-TW" && entryUpdate?.sections.includes(section.id)));
  const guideSection = (section: Questionnaire["guide"][number]) => (
    <section key={section.id}>
      <h3>{currentGuideCopy(section.title[localeKey])}</h3>
      {section.paragraphs.map((paragraph, index) => <p key={index}>
        <DiscCitations text={(config.guideCopy?.(paragraph[localeKey], locale) ?? currentGuideCopy(paragraph[localeKey])).replace(/\[(\d+)\]/g, (marker, number) =>
          references[Number(number) - 1] && publicReference(references[Number(number) - 1]) ? marker : "")}
          locale={localeKey} referencePrefix={referencePrefix} />
      </p>)}
    </section>
  );
  return <>
    <ExploreLandingSchema id={`${quiz.slug}-landing-schema`} title={title} description={edit.facts} path={entry} locale={locale} faq={faq} freeAccessDescription={scopeOfFreeAccess} />
    <TestExploreTemplate slot={config.slot} rootAttributes={{ "data-flagship-entry": quiz.slug }}
      copy={{ ...text, title, description: edit.intro, facts: edit.facts, formula: edit.formula, faq,
        benefits: edit.deliverables.map(([heading, body]) => [heading, body]),
        explore: related.map(([heading, body, label]) => [heading, body, label]),
        compare: [[title, ...text.current], ...related.map(([heading, brief, , count, result]) => [heading, brief, count, result])],
      }}
      start={`${entry}/take${locale === "zh-TW" ? "" : "?start=1"}`}
      endStartLabel={text.endStart} guideHref={profiles[0].link.href} profilesId="questionnaire-results" profiles={profiles} exploreLinks={exploreLinks} compareLinks={[null, ...exploreLinks]}
      sample={sample}
      insight={<><div><h2 id="questionnaire-insight-method">{text.method}</h2><p>{quiz.instructions?.[localeKey]}</p></div>
        {config.visibleGuideIds && <div className="mt-4 space-y-4" aria-labelledby="questionnaire-insight-method">
          {guideSections.filter(section => config.visibleGuideIds?.includes(section.id)).map(guideSection)}
        </div>}
        {config.methodContent?.(quiz, locale, localeKey)}
        <div className="grid gap-4">{questions.map(question => {
          const stimulus = config.questionStimulus?.(question.id, locale);
          const notes = question.options.map(option => {
            if (config.slot === "A" || (config.slot === "B" && "facets" in config)) {
              return typeof option.score === "number"
                ? config.presentation[locale].answerScore(question.reverse ? 6 - option.score : option.score)
                : config.presentation[locale].unscored;
            }
            if (config.slot === "B" && "paired" in config && config.paired === "eight-values") {
              const score = option.score!;
              const format = new Intl.NumberFormat(locale, { signDisplay: "exceptZero" });
              const terms = eightValuesPairs.map(({ axis }, index) =>
                `${config.presentation[locale].axes[index]} ${format.format(quiz.eightValues!.effects[question.id][axis] * score)}`);
              return config.presentation[locale].effect(score, new Intl.ListFormat(locale).format(terms));
            }
            if (config.slot === "B" && "charts" in config)
              return config.note(quiz, question, option, locale, localeKey);
            if (config.slot === "B" && "practice" in config)
              return config.presentation[locale].answer(option.id === question.correctOptionId);
            return text.chosen(quiz.directions.find(direction => direction.id === option.directionId)?.title[localeKey] ?? option.label[localeKey]);
          });
          return <ExploreChoicePreview key={question.id} label={text.question} prompt={question.prompt[localeKey]}
            options={question.options.map(option => option.label[localeKey])} notes={notes}
            stimulus={stimulus && <Image width={720} height={480} src={stimulus.src} alt={stimulus.alt} className="my-4 h-auto w-full rounded-md" unoptimized />}
          />;
        })}
        </div></>}
      afterProfiles={<section className={layout.section}><h2>{text.interpretation}</h2><div className={layout.threeColumns}>
        {edit.interpretations.map(([heading, body]) => <article key={heading} data-ent-interpretation><h3>{heading}</h3><p>{body}</p></article>)}
      </div>
        {WorkedExamples && <WorkedExamples quiz={quiz} locale={localeKey} displayLocale={locale} />}
      </section>}
      heroLinks={<>{scopeOfFreeAccess && <p className="mt-3 text-sm">{scopeOfFreeAccess}</p>}
        {config.notice && <p className="mt-3 text-sm">{config.notice[locale]}</p>}<nav aria-label={locale === "en" ? "Quiz languages" : locale === "zh" ? "测评语言" : "測驗語言"} className="mt-3 flex flex-wrap gap-4 text-sm">
        {workedExampleId && <a href={`#${workedExampleId}`}>{text.sampleLink}</a>}
        {config.sampleReport && <Link href={`/${locale}/reports/samples/disc`}>{config.sampleReport[locale]}</Link>}
        {([["zh", "zh-CN", "简体中文"], ["zh-TW", "zh-TW", "繁體中文"], ["en", "en", "English"]] as const).map(([language, lang, label]) =>
          language === locale ? <span key={language} lang={lang} aria-current="page">{label}</span>
            : <Link key={language} href={questionnairePath(language, quiz.slug)} lang={lang}>{label}</Link>,
        )}
      </nav></>}
      relatedSupplement={<p className="mt-4">{text.guideFree}</p>}
      rules={<><details data-ent-boundary><summary>{text.boundary}</summary><p>{edit.boundary}</p>
        {guideSections.filter(section => !config.visibleGuideIds?.includes(section.id)).map(guideSection)}
        {references.some(publicReference) && <ul>{references.map((reference, index) =>
          !publicReference(reference) ? null : <li key={reference.url} id={`${referencePrefix}-reference-${index + 1}`}><a href={reference.url}>{reference.title[localeKey]}</a></li>,
        )}</ul>}
      </details>
      {Attribution && <Attribution locale={localeKey} traditional={locale === "zh-TW"} />}</>}
    />
  </>;
}
