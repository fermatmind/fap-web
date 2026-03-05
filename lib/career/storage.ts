import type { Locale } from "@/lib/i18n/locales";
import { RIASEC_STORAGE_KEY } from "@/lib/career/riasec";
import type { RIASECCode, RIASECScoreVector } from "@/lib/career/types";

export type CareerRiasecStoredResult = {
  version: 1;
  updatedAt: string;
  locale: Locale;
  scores: RIASECScoreVector;
  primaryCode: RIASECCode;
  secondaryCode: RIASECCode;
};

export function readCareerRiasecResult(): CareerRiasecStoredResult | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(RIASEC_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CareerRiasecStoredResult;
    if (!parsed || parsed.version !== 1 || !parsed.scores) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeCareerRiasecResult(result: CareerRiasecStoredResult): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(RIASEC_STORAGE_KEY, JSON.stringify(result));
}
