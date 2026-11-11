import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { mergeResultReadingParagraphs, prepareSelectedResultProfile } from "@/lib/questionnaires/result-content/prepare-profile";
import type { Questionnaire, QuestionnaireSection, Text } from "@/lib/questionnaires/types";
import { projectStoryCopy, type TextUnits } from "./storyReaderCopy";
import { isCareFeelings20ConfigurationValid } from "@/lib/questionnaires/careFeelings20";
import { isConnectionCheckIn21ConfigurationValid } from "@/lib/questionnaires/connectionCheckIn21";
import { isDisconnection20ConfigurationValid } from "@/lib/questionnaires/disconnection20";
import { isEmotionsConnections21ConfigurationValid } from "@/lib/questionnaires/emotionsConnections21";
import { isFeelingsConnection8ConfigurationValid } from "@/lib/questionnaires/feelingsConnection8";
import { isSocialContext20ConfigurationValid } from "@/lib/questionnaires/socialContext20";

import { isCommunicationRoutines20ConfigurationValid } from "@/lib/questionnaires/communicationRoutines20";
import { isFocusContext16ConfigurationValid } from "@/lib/questionnaires/focusContext16";
import { isNumberContext20ConfigurationValid } from "@/lib/questionnaires/numberContext20";
import { isSpatialContext4ConfigurationValid } from "@/lib/questionnaires/spatialContext4";
import { isUnfamiliar20ConfigurationValid } from "@/lib/questionnaires/unfamiliar20";
import { isWrittenLanguage20ConfigurationValid } from "@/lib/questionnaires/writtenLanguage20";

import { isBirthContext16ConfigurationValid } from "@/lib/questionnaires/birthContext16";
import { isCycleContext16ConfigurationValid } from "@/lib/questionnaires/cycleContext16";
import { isSeasonContext16ConfigurationValid } from "@/lib/questionnaires/seasonContext16";
import { isSleepExperiences20ConfigurationValid } from "@/lib/questionnaires/sleepExperiences20";
import { isEatingExperiences20ConfigurationValid } from "@/lib/questionnaires/eatingExperiences20";
import { isDrinkingExperiences20ConfigurationValid } from "@/lib/questionnaires/drinkingExperiences20";

import { isBereavement16ConfigurationValid } from "@/lib/questionnaires/bereavement16";
import { isCaregiverContext20ConfigurationValid } from "@/lib/questionnaires/caregiverContext20";
import { isGenderExperiences16ConfigurationValid } from "@/lib/questionnaires/genderExperiences16";
import { isHealthWorry21ConfigurationValid } from "@/lib/questionnaires/healthWorry21";
import { isSuddenFear20ConfigurationValid } from "@/lib/questionnaires/suddenFear20";
import { isTraumaResponse20ConfigurationValid } from "@/lib/questionnaires/traumaResponse20";

import { isEverydayWorry12ConfigurationValid } from "@/lib/questionnaires/everydayWorry12";
import { isFeedbackWorth12ConfigurationValid } from "@/lib/questionnaires/feedbackWorth12";
import { isRecentMood12ConfigurationValid } from "@/lib/questionnaires/recentMood12";
import { isUncertaintyEase6ConfigurationValid } from "@/lib/questionnaires/uncertaintyEase6";
import { isUnwantedActions20ConfigurationValid } from "@/lib/questionnaires/unwantedActions20";

const sources = {
  "care-feelings-reflection": {
    name: "CareFeelings", prefix: "careFeelings", attribute: "care-feelings", validate: isCareFeelings20ConfigurationValid,
    load: () => import("@/lib/questionnaires/result-content/care-feelings-reflection.json"),
    editorial: () => import("@/components/questionnaires/CareFeelingsLandingEditorial"),
  },
  "connection-belonging-check-in": {
    name: "ConnectionCheckIn", prefix: "connectionCheckIn", attribute: "connection-belonging", validate: isConnectionCheckIn21ConfigurationValid,
    load: () => import("@/lib/questionnaires/result-content/connection-belonging-check-in.json"),
    editorial: () => import("@/components/questionnaires/ConnectionCheckInLandingEditorial"),
  },
  "disconnection-experiences-reflection": {
    name: "Disconnection", prefix: "disconnection", attribute: "disconnection", validate: isDisconnection20ConfigurationValid,
    load: () => import("@/lib/questionnaires/result-content/disconnection-experiences-reflection.json"),
    editorial: () => import("@/components/questionnaires/DisconnectionLandingEditorial"),
  },
  "emotions-connections-reflection": {
    name: "EmotionsConnections", prefix: "emotionsConnections", attribute: "emotions-connections", validate: isEmotionsConnections21ConfigurationValid,
    load: () => import("@/lib/questionnaires/result-content/emotions-connections-reflection.json"),
    editorial: () => import("@/components/questionnaires/EmotionsConnectionsLandingEditorial"),
  },
  "feelings-connection-reflection": {
    name: "FeelingsConnection", prefix: "feelingsConnection", attribute: "feelings-connection", validate: isFeelingsConnection8ConfigurationValid,
    load: () => import("@/lib/questionnaires/result-content/feelings-connection-reflection.json"),
    editorial: () => import("@/components/questionnaires/FeelingsConnectionLandingEditorial"),
  },
  "social-context-reflection": {
    name: "SocialContext", prefix: "socialContext", attribute: "social-context", validate: isSocialContext20ConfigurationValid,
    load: () => import("@/lib/questionnaires/result-content/social-context-reflection.json"),
    editorial: () => import("@/components/questionnaires/SocialContextLandingEditorial"),
  },
  "communication-routines-context": {
    name: "CommunicationRoutines", prefix: "communicationRoutines", attribute: "communication-routines", validate: isCommunicationRoutines20ConfigurationValid,
    load: () => import("@/lib/questionnaires/result-content/communication-routines-context.json"),
    editorial: () => import("@/components/questionnaires/CommunicationRoutinesLandingEditorial"),
  },
  "focus-energy-context-reflection": {
    name: "FocusContext", prefix: "focusContext", attribute: "focus-context", validate: isFocusContext16ConfigurationValid,
    load: () => import("@/lib/questionnaires/result-content/focus-energy-context-reflection.json"),
    editorial: () => import("@/components/questionnaires/FocusContextLandingEditorial"),
  },
  "number-context-reflection": {
    name: "NumberContext", prefix: "numberContext", attribute: "number-context", validate: isNumberContext20ConfigurationValid,
    load: () => import("@/lib/questionnaires/result-content/number-context-reflection.json"),
    editorial: () => import("@/components/questionnaires/NumberContextLandingEditorial"),
  },
  "spatial-thinking-reflection": {
    name: "SpatialContext", prefix: "spatialContext", attribute: "spatial-context", validate: isSpatialContext4ConfigurationValid,
    load: () => import("@/lib/questionnaires/result-content/spatial-thinking-reflection.json"),
    editorial: () => import("@/components/questionnaires/SpatialContextLandingEditorial"),
  },
  "unfamiliar-experiences-reflection": {
    name: "Unfamiliar", prefix: "unfamiliar", attribute: "unfamiliar", validate: isUnfamiliar20ConfigurationValid,
    load: () => import("@/lib/questionnaires/result-content/unfamiliar-experiences-reflection.json"),
    editorial: () => import("@/components/questionnaires/UnfamiliarLandingEditorial"),
  },
  "written-language-context-reflection": {
    name: "WrittenLanguage", prefix: "writtenLanguage", attribute: "written-language", validate: isWrittenLanguage20ConfigurationValid,
    load: () => import("@/lib/questionnaires/result-content/written-language-context-reflection.json"),
    editorial: () => import("@/components/questionnaires/WrittenLanguageLandingEditorial"),
  },
  "after-childbirth-context-reflection": {
    name: "BirthContext", prefix: "birthContext", attribute: "birth-context", validate: isBirthContext16ConfigurationValid,
    load: () => import("@/lib/questionnaires/result-content/after-childbirth-context-reflection.json"),
    editorial: () => import("@/components/questionnaires/BirthContextLandingEditorial"),
  },
  "menstrual-cycle-context-reflection": {
    name: "CycleContext", prefix: "cycleContext", attribute: "cycle-context", validate: isCycleContext16ConfigurationValid,
    load: () => import("@/lib/questionnaires/result-content/menstrual-cycle-context-reflection.json"),
    editorial: () => import("@/components/questionnaires/CycleContextLandingEditorial"),
  },
  "time-of-year-context-reflection": {
    name: "SeasonContext", prefix: "seasonContext", attribute: "season-context", validate: isSeasonContext16ConfigurationValid,
    load: () => import("@/lib/questionnaires/result-content/time-of-year-context-reflection.json"),
    editorial: () => import("@/components/questionnaires/SeasonContextLandingEditorial"),
  },
  "sleep-experiences-reflection": {
    name: "SleepExperiences", prefix: "sleepExperiences", attribute: "sleep-experiences", validate: isSleepExperiences20ConfigurationValid,
    load: () => import("@/lib/questionnaires/result-content/sleep-experiences-reflection.json"),
    editorial: () => import("@/components/questionnaires/SleepExperiencesLandingEditorial"),
  },
  "eating-experiences-reflection": {
    name: "EatingExperiences", prefix: "eatingExperiences", attribute: "eating-experiences", validate: isEatingExperiences20ConfigurationValid,
    load: () => import("@/lib/questionnaires/result-content/eating-experiences-reflection.json"),
    editorial: () => import("@/components/questionnaires/EatingExperiencesLandingEditorial"),
  },
  "drinking-experiences-reflection": {
    name: "DrinkingExperiences", prefix: "drinkingExperiences", attribute: "drinking-experiences", validate: isDrinkingExperiences20ConfigurationValid,
    load: () => import("@/lib/questionnaires/result-content/drinking-experiences-reflection.json"),
    editorial: () => import("@/components/questionnaires/DrinkingExperiencesLandingEditorial"),
  },
  "after-bereavement-reflection": {
    name: "Bereavement", prefix: "bereavement", attribute: "bereavement", validate: isBereavement16ConfigurationValid,
    load: () => import("@/lib/questionnaires/result-content/after-bereavement-reflection.json"),
    editorial: () => import("@/components/questionnaires/BereavementLandingEditorial"),
  },
  "child-focus-activity-observations": {
    name: "CaregiverContext", prefix: "caregiverContext", attribute: "caregiver-context", validate: isCaregiverContext20ConfigurationValid,
    load: () => import("@/lib/questionnaires/result-content/child-focus-activity-observations.json"),
    editorial: () => import("@/components/questionnaires/CaregiverContextLandingEditorial"),
  },
  "gender-experiences-reflection": {
    name: "GenderExperiences", prefix: "genderExperiences", attribute: "gender-experiences", validate: isGenderExperiences16ConfigurationValid,
    load: () => import("@/lib/questionnaires/result-content/gender-experiences-reflection.json"),
    editorial: () => import("@/components/questionnaires/GenderExperiencesLandingEditorial"),
  },
  "health-worries-reflection": {
    name: "HealthWorry", prefix: "healthWorry", attribute: "health-worry", validate: isHealthWorry21ConfigurationValid,
    load: () => import("@/lib/questionnaires/result-content/health-worries-reflection.json"),
    editorial: () => import("@/components/questionnaires/HealthWorryLandingEditorial"),
  },
  "sudden-fear-reflection": {
    name: "SuddenFear", prefix: "suddenFear", attribute: "sudden-fear", validate: isSuddenFear20ConfigurationValid,
    load: () => import("@/lib/questionnaires/result-content/sudden-fear-reflection.json"),
    editorial: () => import("@/components/questionnaires/SuddenFearLandingEditorial"),
  },
  "trauma-response-reflection": {
    name: "TraumaResponse", prefix: "traumaLanding", attribute: "trauma", validate: isTraumaResponse20ConfigurationValid,
    load: () => import("@/lib/questionnaires/result-content/trauma-response-reflection.json"),
    editorial: () => import("@/components/questionnaires/TraumaResponseLandingEditorial"),
  },
  "everyday-worry-reflection": {
    name: "EverydayWorry", prefix: "everydayWorry", attribute: "everyday-worry", validate: isEverydayWorry12ConfigurationValid,
    load: () => import("@/lib/questionnaires/result-content/everyday-worry-reflection.json"),
    editorial: () => import("@/components/questionnaires/EverydayWorryLandingEditorial"),
  },
  "feedback-self-worth-reflection": {
    name: "FeedbackWorth", prefix: "feedbackWorth", attribute: "feedback-worth", validate: isFeedbackWorth12ConfigurationValid,
    load: () => import("@/lib/questionnaires/result-content/feedback-self-worth-reflection.json"),
    editorial: () => import("@/components/questionnaires/FeedbackWorthLandingEditorial"),
  },
  "recent-mood-reflection": {
    name: "RecentMood", prefix: "recentMood", attribute: "recent-mood", validate: isRecentMood12ConfigurationValid,
    load: () => import("@/lib/questionnaires/result-content/recent-mood-reflection.json"),
    editorial: () => import("@/components/questionnaires/RecentMoodLandingEditorial"),
  },
  "uncertainty-ease-reflection": {
    name: "UncertaintyEase", prefix: "uncertaintyEase", attribute: "uncertainty-ease", validate: isUncertaintyEase6ConfigurationValid,
    load: () => import("@/lib/questionnaires/result-content/uncertainty-ease-reflection.json"),
    editorial: () => import("@/components/questionnaires/UncertaintyEaseLandingEditorial"),
  },
  "unwanted-thoughts-actions-reflection": {
    name: "UnwantedActions", prefix: "unwantedActions", attribute: "unwanted-actions", validate: isUnwantedActions20ConfigurationValid,
    load: () => import("@/lib/questionnaires/result-content/unwanted-thoughts-actions-reflection.json"),
    editorial: () => import("@/components/questionnaires/UnwantedActionsLandingEditorial"),
  },
};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { units } = require("./observation-questionnaires.generated.json") as { units: TextUnits };

export async function loadTraditionalObservation(slug: string) {
  if (!Object.hasOwn(sources, slug)) return null;
  const edition = sources[slug as keyof typeof sources];
  const [source, { default: reading }, editorial] = await Promise.all([
    loadQuestionnaire(slug), edition.load(), edition.editorial(),
  ]);
  if (!source || !edition.validate(source)) return null;
  const quiz = projectStoryCopy(source, `lib/questionnaires/data/${slug}.json`, units);
  const additions: Record<string, QuestionnaireSection[]> = projectStoryCopy(reading, `lib/questionnaires/result-content/${slug}.json`, units);
  const profiles = quiz.profiles.map(profile => prepareSelectedResultProfile(slug, profile, {
    attribute: edition.attribute,
    select: item => mergeResultReadingParagraphs(item, additions),
  }));
  const fields = projectStoryCopy(editorial, `components/questionnaires/${edition.name}LandingEditorial.ts`, units) as Record<string, unknown>;
  const sections = fields[edition.prefix + "Sections"] as QuestionnaireSection[];
  const faq = fields[edition.prefix + "Faq"] as Questionnaire["faq"];
  const summaries = fields[edition.prefix + "ReadingSummaries"] as Record<string, Text> | undefined;
  const extraReferences = fields[edition.prefix + "References"] as NonNullable<Questionnaire["references"]> | undefined;
  return { source, quiz: { ...quiz, profiles }, sections, faq, summaries: summaries ?? {}, extraReferences: extraReferences ?? [] };
}
