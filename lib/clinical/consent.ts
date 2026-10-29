import type { QuestionsMeta } from "@/lib/api/v0_3";

/** Preserve the backend's legacy text or complete structured consent copy. */
export function clinicalConsentText(consent: QuestionsMeta["consent"]): string {
  if (!consent) return "";
  if (typeof consent.text === "string" && consent.text.trim()) return consent.text.trim();

  const statements = consent.checkboxes;
  if (!Array.isArray(statements) || statements.length === 0
    || !statements.every((item): item is string => typeof item === "string" && item.trim().length > 0)) return "";

  const title = typeof consent.title === "string" ? consent.title.trim() : "";
  return [title, ...statements.map((item, index) => `${index + 1}. ${item.trim()}`)].filter(Boolean).join("\n\n");
}
