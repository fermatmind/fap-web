import type { Questionnaire } from "@/lib/questionnaires/types";
import source from "@/lib/questionnaires/virtuesLandingEditorial.json";

export const virtuesLandingSections: Questionnaire["guide"] = source.virtuesLandingSections;
export const virtuesLandingFaq: Questionnaire["faq"] = source.virtuesLandingFaq;
export const virtuesLandingReferences: NonNullable<Questionnaire["references"]> = source.virtuesLandingReferences;
