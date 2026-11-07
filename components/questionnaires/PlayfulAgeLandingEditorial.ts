import quiz from "@/lib/questionnaires/data/mental-age.json";
import type { Questionnaire } from "@/lib/questionnaires/types";
export const playfulAgeLandingSections: Questionnaire["guide"] = quiz.guide;
export const playfulAgeLandingFaq: Questionnaire["faq"] = quiz.faq;
export const playfulAgeLandingReferences: { title: { en: string; zh: string }; url: string }[] = [];
