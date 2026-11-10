import { numberSeriesFaq, numberSeriesSections, numberSeriesSummaries } from "@/components/questionnaires/NumberSeriesLandingEditorial";
import { aiLiteracyLandingFaq, aiLiteracyLandingSections, aiLiteracyLandingReferences } from "@/components/questionnaires/AiLiteracyLandingEditorial";
import { aiLiteracyResultQuestions } from "@/lib/questionnaires/result-content/ai-literacy";
import { communicationAdaptabilityLandingFaq, communicationAdaptabilityLandingSections, communicationAdaptabilityLandingReferences } from "@/components/questionnaires/CommunicationAdaptabilityLandingEditorial";
import { personalFinanceLandingFaq, personalFinanceLandingSections, personalFinanceLandingReferences } from "@/components/questionnaires/PersonalFinanceLandingEditorial";
import { problemSolvingLandingFaq, problemSolvingLandingSections, problemSolvingLandingReferences } from "@/components/questionnaires/ProblemSolvingLandingEditorial";
import { problemSolvingResultQuestions } from "@/lib/questionnaires/result-content/problem-solving-critical-thinking";
import { projectManagementLandingFaq, projectManagementLandingSections } from "@/components/questionnaires/ProjectManagementLandingEditorial";
import { projectManagementResultQuestions } from "@/lib/questionnaires/result-content/project-management";
import { wordSkillsLandingFaq, wordSkillsLandingSections } from "@/components/questionnaires/WordSkillsLandingEditorial";
import { excelSkillsLandingFaq, excelSkillsLandingSections } from "@/components/questionnaires/ExcelSkillsLandingEditorial";
import { financialAccountingLandingFaq, financialAccountingLandingSections } from "@/components/questionnaires/FinancialAccountingLandingEditorial";
import { javaLandingFaq, javaLandingSections } from "@/components/questionnaires/JavaLandingEditorial";
import { javaScriptLandingFaq, javaScriptLandingSections } from "@/components/questionnaires/JavaScriptLandingEditorial";
import { pythonLandingFaq, pythonLandingSections } from "@/components/questionnaires/PythonLandingEditorial";
import { sqlLandingFaq, sqlLandingSections } from "@/components/questionnaires/SqlLandingEditorial";
import { englishProficiencyLandingFaq, englishProficiencyLandingSections } from "@/components/questionnaires/EnglishProficiencyLandingEditorial";
import { englishProficiencyResultQuestions } from "@/lib/questionnaires/result-content/english-proficiency";
import { germanLandingFaq, germanLandingSections, germanLandingReferences } from "@/components/questionnaires/GermanLandingEditorial";
import { grammarLandingFaq, grammarLandingSections } from "@/components/questionnaires/GrammarLandingEditorial";
import { spanishProficiencyLandingFaq, spanishProficiencyLandingSections } from "@/components/questionnaires/SpanishProficiencyLandingEditorial";
import { spanishProficiencyResultQuestions } from "@/lib/questionnaires/result-content/spanish-proficiency";
import { spellingLandingFaq, spellingLandingSections } from "@/components/questionnaires/SpellingLandingEditorial";
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
import type { Questionnaire, QuestionnaireSection } from "@/lib/questionnaires/types";
import { projectStoryCopy, type TextUnits } from "./storyReaderCopy";

// The generator validates this dictionary before builds. Avoid inferring its thousands of literal keys.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { units } = require("./practice-questionnaires.generated.json") as { units: TextUnits };

type PracticeEdition = {
  reading: string;
  load: () => Promise<{ default: Record<string, QuestionnaireSection[]> }>;
  editorial: string;
  prefix: string;
  sections: Questionnaire["guide"];
  faq: Questionnaire["faq"];
  references?: NonNullable<Questionnaire["references"]>;
  prepareQuestions?: (questions: Questionnaire["questions"]) => Questionnaire["questions"];
};

const editions: Readonly<Record<string, PracticeEdition>> = {
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
  "english-proficiency": {
    reading: "english-proficiency",
    load: () => import("@/lib/questionnaires/result-content/english-proficiency.json"),
    editorial: "EnglishProficiencyLandingEditorial",
    prefix: "englishProficiency",
    sections: englishProficiencyLandingSections,
    faq: englishProficiencyLandingFaq,
    prepareQuestions: englishProficiencyResultQuestions,
  },
  "german-proficiency": {
    reading: "german-proficiency",
    load: () => import("@/lib/questionnaires/result-content/german-proficiency.json"),
    editorial: "GermanLandingEditorial",
    prefix: "german",
    sections: germanLandingSections,
    faq: germanLandingFaq,
    references: germanLandingReferences,
  },
  "grammar-test": {
    reading: "grammar-test",
    load: () => import("@/lib/questionnaires/result-content/grammar-test.json"),
    editorial: "GrammarLandingEditorial",
    prefix: "grammar",
    sections: grammarLandingSections,
    faq: grammarLandingFaq,
  },
  "spanish-proficiency": {
    reading: "spanish-proficiency",
    load: () => import("@/lib/questionnaires/result-content/spanish-proficiency.json"),
    editorial: "SpanishProficiencyLandingEditorial",
    prefix: "spanishProficiency",
    sections: spanishProficiencyLandingSections,
    faq: spanishProficiencyLandingFaq,
    prepareQuestions: spanishProficiencyResultQuestions,
  },
  "spelling-test": {
    reading: "spelling-test",
    load: () => import("@/lib/questionnaires/result-content/spelling-test.json"),
    editorial: "SpellingLandingEditorial",
    prefix: "spelling",
    sections: spellingLandingSections,
    faq: spellingLandingFaq,
  },
  "java-test": {
    reading: "java-test",
    load: () => import("@/lib/questionnaires/result-content/java-test.json"),
    editorial: "JavaLandingEditorial",
    prefix: "java",
    sections: javaLandingSections,
    faq: javaLandingFaq,
  },
  "javascript-test": {
    reading: "javascript-test",
    load: () => import("@/lib/questionnaires/result-content/javascript-test.json"),
    editorial: "JavaScriptLandingEditorial",
    prefix: "javaScript",
    sections: javaScriptLandingSections,
    faq: javaScriptLandingFaq,
  },
  "python-test": {
    reading: "python-test",
    load: () => import("@/lib/questionnaires/result-content/python-test.json"),
    editorial: "PythonLandingEditorial",
    prefix: "python",
    sections: pythonLandingSections,
    faq: pythonLandingFaq,
  },
  "sql-test": {
    reading: "sql-test",
    load: () => import("@/lib/questionnaires/result-content/sql-test.json"),
    editorial: "SqlLandingEditorial",
    prefix: "sql",
    sections: sqlLandingSections,
    faq: sqlLandingFaq,
  },
  "word-skills": {
    reading: "word-skills",
    load: () => import("@/lib/questionnaires/result-content/word-skills.json"),
    editorial: "WordSkillsLandingEditorial",
    prefix: "wordSkills",
    sections: wordSkillsLandingSections,
    faq: wordSkillsLandingFaq,
  },
  "excel-skills": {
    reading: "excel-skills",
    load: () => import("@/lib/questionnaires/result-content/excel-skills.json"),
    editorial: "ExcelSkillsLandingEditorial",
    prefix: "excelSkills",
    sections: excelSkillsLandingSections,
    faq: excelSkillsLandingFaq,
  },
  "financial-accounting": {
    reading: "financial-accounting",
    load: () => import("@/lib/questionnaires/result-content/financial-accounting.json"),
    editorial: "FinancialAccountingLandingEditorial",
    prefix: "financialAccounting",
    sections: financialAccountingLandingSections,
    faq: financialAccountingLandingFaq,
  },
  "ai-literacy": {
    reading: "ai-literacy",
    load: () => import("@/lib/questionnaires/result-content/ai-literacy.json"),
    editorial: "AiLiteracyLandingEditorial",
    prefix: "aiLiteracy",
    sections: aiLiteracyLandingSections,
    faq: aiLiteracyLandingFaq,
    references: aiLiteracyLandingReferences,
    prepareQuestions: aiLiteracyResultQuestions,
  },
  "communication-adaptability": {
    reading: "communication-adaptability",
    load: () => import("@/lib/questionnaires/result-content/communication-adaptability.json"),
    editorial: "CommunicationAdaptabilityLandingEditorial",
    prefix: "communicationAdaptability",
    sections: communicationAdaptabilityLandingSections,
    faq: communicationAdaptabilityLandingFaq,
    references: communicationAdaptabilityLandingReferences,
  },
  "personal-finance-literacy": {
    reading: "personal-finance-literacy",
    load: () => import("@/lib/questionnaires/result-content/personal-finance-literacy.json"),
    editorial: "PersonalFinanceLandingEditorial",
    prefix: "personalFinance",
    sections: personalFinanceLandingSections,
    faq: personalFinanceLandingFaq,
    references: personalFinanceLandingReferences,
  },
  "problem-solving-critical-thinking": {
    reading: "problem-solving-critical-thinking",
    load: () => import("@/lib/questionnaires/result-content/problem-solving-critical-thinking.json"),
    editorial: "ProblemSolvingLandingEditorial",
    prefix: "problemSolving",
    sections: problemSolvingLandingSections,
    faq: problemSolvingLandingFaq,
    references: problemSolvingLandingReferences,
    prepareQuestions: problemSolvingResultQuestions,
  },
  "project-management": {
    reading: "project-management",
    load: () => import("@/lib/questionnaires/result-content/project-management.json"),
    editorial: "ProjectManagementLandingEditorial",
    prefix: "projectManagement",
    sections: projectManagementLandingSections,
    faq: projectManagementLandingFaq,
    prepareQuestions: projectManagementResultQuestions,
  },
  "number-series": {
    reading: "number-series",
    load: () => import("@/lib/questionnaires/result-content/number-series.json"),
    editorial: "NumberSeriesLandingEditorial",
    prefix: "numberSeries",
    sections: numberSeriesSections,
    faq: numberSeriesFaq,
  },
};

export function traditionalNumberSeriesSummaries() {
  return projectStoryCopy(numberSeriesSummaries, "components/questionnaires/NumberSeriesLandingEditorial.ts/numberSeriesSummaries", units);
}

export async function loadTraditionalPractice(slug: string) {
  if (!Object.hasOwn(editions, slug)) return null;
  const edition = editions[slug];
  const original = await loadQuestionnaire(slug);
  if (!original || !isPracticeConfigurationValid(original)) return null;
  const questions = edition.prepareQuestions?.(original.questions) ?? original.questions;
  const quiz = projectStoryCopy({ ...original, questions }, `lib/questionnaires/data/${slug}.json`, units);
  const { default: source } = await edition.load();
  const readings = projectStoryCopy(source, `lib/questionnaires/result-content/${edition.reading}.json`, units);
  const root = `components/questionnaires/${edition.editorial}.ts/${edition.prefix}${slug === "number-series" ? "" : "Landing"}`;
  return {
    quiz: {
      ...quiz,
      profiles: quiz.profiles.map(profile => prepareSelectedResultProfile(slug, profile, {
        attribute: edition.reading,
        select: (item) => Object.hasOwn(readings, item.id) ? { ...item, sections: [...item.sections, ...readings[item.id]] } : item,
      })),
    },
    sections: projectStoryCopy(edition.sections, `${root}Sections`, units),
    faq: projectStoryCopy(edition.faq, `${root}Faq`, units),
    references: [
      ...(quiz.references ?? []),
      ...projectStoryCopy(edition.references ?? [], `${root}References`, units),
    ],
  };
}
