import type { Locale } from "@/lib/i18n/locales";
import { SBTI_STORAGE_KEY, type SbtiAnswerMap, type SbtiComputedResult } from "@/lib/sbti/types";

export type SbtiStoredState = {
  version: 1;
  locale: Locale;
  updatedAt: string;
  answers: SbtiAnswerMap;
  completedResult: SbtiComputedResult | null;
};

export function readSbtiState(): SbtiStoredState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(SBTI_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SbtiStoredState;
    if (!parsed || parsed.version !== 1 || typeof parsed.answers !== "object") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeSbtiState(state: SbtiStoredState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SBTI_STORAGE_KEY, JSON.stringify(state));
}

export function clearSbtiState(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SBTI_STORAGE_KEY);
}
