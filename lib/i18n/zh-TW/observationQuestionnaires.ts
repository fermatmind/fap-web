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
  return { source, quiz: { ...quiz, profiles }, sections, faq, summaries: summaries ?? {}, extraReferences: [] };
}
