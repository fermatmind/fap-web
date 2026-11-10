import { abstractReasoningLandingFaq, abstractReasoningLandingSections, abstractReasoningLandingReferences } from "@/components/questionnaires/AbstractReasoningLandingEditorial";
import { logicalReasoningLandingFaq, logicalReasoningLandingSections } from "@/components/questionnaires/LogicalReasoningLandingEditorial";
import { mechanicalReasoningLandingFaq, mechanicalReasoningLandingSections } from "@/components/questionnaires/MechanicalReasoningLandingEditorial";
import { verbalReasoningLandingFaq, verbalReasoningLandingSections } from "@/components/questionnaires/VerbalReasoningLandingEditorial";
import { numericalReasoningLandingFaq, numericalReasoningLandingSections, numericalReasoningLandingReferences } from "@/components/questionnaires/NumericalReasoningLandingEditorial";
import { spatialReasoningLandingFaq, spatialReasoningLandingSections, spatialReasoningLandingReferences } from "@/components/questionnaires/SpatialReasoningLandingEditorial";
import { computerLiteracyLandingFaq, computerLiteracyLandingSections } from "@/components/questionnaires/ComputerLiteracyLandingEditorial";
import { digitalCitizenshipLandingFaq, digitalCitizenshipLandingSections, digitalCitizenshipLandingReferences } from "@/components/questionnaires/DigitalCitizenshipLandingEditorial";
import { customerServiceLandingFaq, customerServiceLandingSections, customerServiceLandingReferences } from "@/components/questionnaires/CustomerServiceLandingEditorial";
import { salesAptitudeLandingFaq, salesAptitudeLandingSections } from "@/components/questionnaires/SalesAptitudeLandingEditorial";
import { situationalJudgementLandingFaq, situationalJudgementLandingSections, situationalJudgementLandingReferences } from "@/components/questionnaires/SituationalJudgementLandingEditorial";
import { aptitudeLandingFaq, aptitudeLandingSections } from "@/components/questionnaires/AptitudeLandingEditorial";
import { attentionDetailLandingFaq, attentionDetailLandingSections } from "@/components/questionnaires/AttentionDetailLandingEditorial";
import { cybersecurityLandingFaq, cybersecurityLandingSections } from "@/components/questionnaires/CybersecurityLandingEditorial";
import { workplaceTechnologyLandingFaq, workplaceTechnologyLandingSections } from "@/components/questionnaires/WorkplaceTechnologyLandingEditorial";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { isPracticeConfigurationValid } from "@/lib/questionnaires/practice";
import { prepareSelectedResultProfile } from "@/lib/questionnaires/result-content/prepare-profile";
import type { QuestionnaireSection } from "@/lib/questionnaires/types";
import generated from "./practice-questionnaires.generated.json";
import { projectStoryCopy, type TextUnits } from "./storyReaderCopy";

const units: TextUnits = generated.units;

const editions = {
  "attention-to-detail": {
    reading: "attention-to-detail",
    load: () => import("@/lib/questionnaires/result-content/attention-to-detail.json"),
    editorial: "AttentionDetailLandingEditorial",
    prefix: "attentionDetail",
    sections: attentionDetailLandingSections,
    faq: attentionDetailLandingFaq,
  },
  "cybersecurity-awareness": {
    reading: "cybersecurity",
    load: () => import("@/lib/questionnaires/result-content/cybersecurity.json"),
    editorial: "CybersecurityLandingEditorial",
    prefix: "cybersecurity",
    sections: cybersecurityLandingSections,
    faq: cybersecurityLandingFaq,
  },
  "workplace-technology": {
    reading: "workplace-technology",
    load: () => import("@/lib/questionnaires/result-content/workplace-technology.json"),
    editorial: "WorkplaceTechnologyLandingEditorial",
    prefix: "workplaceTechnology",
    sections: workplaceTechnologyLandingSections,
    faq: workplaceTechnologyLandingFaq,
  },
  "computer-literacy": {
    reading: "computer-literacy",
    load: () => import("@/lib/questionnaires/result-content/computer-literacy.json"),
    editorial: "ComputerLiteracyLandingEditorial",
    prefix: "computerLiteracy",
    sections: computerLiteracyLandingSections,
    faq: computerLiteracyLandingFaq,
  },
  "digital-ethics-citizenship": {
    reading: "digital-ethics-citizenship",
    load: () => import("@/lib/questionnaires/result-content/digital-ethics-citizenship.json"),
    editorial: "DigitalCitizenshipLandingEditorial",
    prefix: "digitalCitizenship",
    sections: digitalCitizenshipLandingSections,
    faq: digitalCitizenshipLandingFaq,
    references: digitalCitizenshipLandingReferences,
  },
  "customer-service-aptitude": {
    reading: "customer-service-aptitude",
    load: () => import("@/lib/questionnaires/result-content/customer-service-aptitude.json"),
    editorial: "CustomerServiceLandingEditorial",
    prefix: "customerService",
    sections: customerServiceLandingSections,
    faq: customerServiceLandingFaq,
    references: customerServiceLandingReferences,
  },
  "sales-aptitude": {
    reading: "sales-aptitude",
    load: () => import("@/lib/questionnaires/result-content/sales-aptitude.json"),
    editorial: "SalesAptitudeLandingEditorial",
    prefix: "salesAptitude",
    sections: salesAptitudeLandingSections,
    faq: salesAptitudeLandingFaq,
  },
  "situational-judgement": {
    reading: "situational-judgement",
    load: () => import("@/lib/questionnaires/result-content/situational-judgement.json"),
    editorial: "SituationalJudgementLandingEditorial",
    prefix: "situationalJudgement",
    sections: situationalJudgementLandingSections,
    faq: situationalJudgementLandingFaq,
    references: situationalJudgementLandingReferences,
  },
  "aptitude-test": {
    reading: "aptitude-test",
    load: () => import("@/lib/questionnaires/result-content/aptitude-test.json"),
    editorial: "AptitudeLandingEditorial",
    prefix: "aptitude",
    sections: aptitudeLandingSections,
    faq: aptitudeLandingFaq,
  },
  "abstract-reasoning": {
    reading: "abstract-reasoning",
    load: () => import("@/lib/questionnaires/result-content/abstract-reasoning.json"),
    editorial: "AbstractReasoningLandingEditorial",
    prefix: "abstractReasoning",
    sections: abstractReasoningLandingSections,
    faq: abstractReasoningLandingFaq,
    references: abstractReasoningLandingReferences,
  },
  "logical-reasoning": {
    reading: "logical-reasoning",
    load: () => import("@/lib/questionnaires/result-content/logical-reasoning.json"),
    editorial: "LogicalReasoningLandingEditorial",
    prefix: "logicalReasoning",
    sections: logicalReasoningLandingSections,
    faq: logicalReasoningLandingFaq,
  },
  "mechanical-reasoning": {
    reading: "mechanical-reasoning",
    load: () => import("@/lib/questionnaires/result-content/mechanical-reasoning.json"),
    editorial: "MechanicalReasoningLandingEditorial",
    prefix: "mechanicalReasoning",
    sections: mechanicalReasoningLandingSections,
    faq: mechanicalReasoningLandingFaq,
  },
  "verbal-reasoning": {
    reading: "verbal-reasoning",
    load: () => import("@/lib/questionnaires/result-content/verbal-reasoning.json"),
    editorial: "VerbalReasoningLandingEditorial",
    prefix: "verbalReasoning",
    sections: verbalReasoningLandingSections,
    faq: verbalReasoningLandingFaq,
  },
  "numerical-reasoning": {
    reading: "numerical-reasoning",
    load: () => import("@/lib/questionnaires/result-content/numerical-reasoning.json"),
    editorial: "NumericalReasoningLandingEditorial",
    prefix: "numericalReasoning",
    sections: numericalReasoningLandingSections,
    faq: numericalReasoningLandingFaq,
    references: numericalReasoningLandingReferences,
  },
  "spatial-reasoning": {
    reading: "spatial-reasoning",
    load: () => import("@/lib/questionnaires/result-content/spatial-reasoning.json"),
    editorial: "SpatialReasoningLandingEditorial",
    prefix: "spatialReasoning",
    sections: spatialReasoningLandingSections,
    faq: spatialReasoningLandingFaq,
    references: spatialReasoningLandingReferences,
  },
};

export async function loadTraditionalPractice(slug: string) {
  if (!Object.hasOwn(editions, slug)) return null;
  const edition = editions[slug as keyof typeof editions];
  const original = await loadQuestionnaire(slug);
  if (!original || !isPracticeConfigurationValid(original)) return null;
  const quiz = projectStoryCopy(original, `lib/questionnaires/data/${slug}.json`, units);
  const { default: source } = await edition.load();
  const readings: Record<string, QuestionnaireSection[]> = projectStoryCopy(source, `lib/questionnaires/result-content/${edition.reading}.json`, units);
  const root = `components/questionnaires/${edition.editorial}.ts/${edition.prefix}Landing`;
  return {
    quiz: { ...quiz, profiles: quiz.profiles.map(profile => prepareSelectedResultProfile(slug, profile, {
      attribute: edition.reading,
      select: (item) => Object.hasOwn(readings, item.id) ? { ...item, sections: [...item.sections, ...readings[item.id]] } : item,
    })) },
    sections: projectStoryCopy(edition.sections, `${root}Sections`, units),
    faq: projectStoryCopy(edition.faq, `${root}Faq`, units),
    references: [
      ...(quiz.references ?? []),
      ...("references" in edition ? projectStoryCopy(edition.references, `${root}References`, units) : []),
    ],
  };
}
