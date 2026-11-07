import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import type { MentalAgeResult } from "@/lib/questionnaires/mentalAge";
import type { Locale } from "@/lib/i18n/locales";
import { MentalAgeClassicResult } from "./MentalAgeClassicClient";
/** Compatibility consumer for the generic report registry; the public take route uses the classic client. */
export function QuestionnaireMentalAgeReport({quiz,result,answers,locale}:{quiz:Questionnaire;result:Extract<MentalAgeResult,{status:"complete"}>;answers:QuestionnaireAnswers;locale:Locale;readingProfile?:Questionnaire["profiles"][number]}) {
 return <MentalAgeClassicResult quiz={quiz} result={result} answers={answers} locale={locale}/>;
}
