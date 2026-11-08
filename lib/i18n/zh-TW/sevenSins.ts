import source from "@/lib/questionnaires/data/seven-sins-virtues-test.json";
import additions from "@/lib/questionnaires/result-content/seven-sins-virtues-test.json";
import editorial from "@/lib/questionnaires/virtuesLandingEditorial.json";
import generated from "./seven-sins.generated.json";
import type { Text } from "@/lib/questionnaires/types";

type Traditional<T> = T extends Text ? T & { "zh-TW": string } : T extends object ? { [K in keyof T]: Traditional<T[K]> } : T;
function materialize<T>(value: T, context: string): Traditional<T> {
  if (value && typeof value === "object" && "zh" in value && "en" in value) {
    const unit = (generated.units as Record<string, { text: string }>)[context];
    if (!unit) throw new Error(`Missing zh-TW field: ${context}`);
    return { ...value, "zh-TW": unit.text } as Traditional<T>;
  }
  if (Array.isArray(value)) return value.map((child, index) => materialize(child, `${context}/${index}`)) as Traditional<T>;
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, materialize(child, `${context}/${key}`)])) as Traditional<T>;
  return value as Traditional<T>;
}
const quiz = materialize(source, "lib/questionnaires/data/seven-sins-virtues-test.json");
const extra = materialize(additions, "lib/questionnaires/result-content/seven-sins-virtues-test.json");
export const traditionalSevenSins = { ...quiz, profiles: quiz.profiles.map(profile => ({ ...profile, sections: profile.sections.map(section => {
  const addition = extra[profile.id as keyof typeof extra].find(part => part.id === section.id);
  return addition ? { ...section, paragraphs: [...section.paragraphs, ...addition.paragraphs] } : section;
}) })) };
export const traditionalSevenSinsEditorial = materialize(editorial, "lib/questionnaires/virtuesLandingEditorial.json");
