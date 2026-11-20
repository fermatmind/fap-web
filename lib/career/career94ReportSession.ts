import type { RiasecResultViewModel } from "@/lib/riasec/resultAssembler";

const key = "fm_career94_free_report_v1";
const lifetime = 2 * 60 * 60 * 1000;

// Only the already-public reading projection is transferred between these pages.
// Answers, checkout credentials and paid report payloads are never stored here.
export function saveCareer94FreeReport(model: RiasecResultViewModel, locale: "zh" | "en"): boolean {
  try {
    sessionStorage.setItem(key, JSON.stringify({ version: 1, locale, expires: Date.now() + lifetime, model }));
    return true;
  } catch { return false; }
}

export function readCareer94FreeReport(locale: "zh" | "en", snapshot?: string | null): RiasecResultViewModel | null {
  try {
    const value = JSON.parse((snapshot === undefined ? getCareer94ReportSnapshot() : snapshot) ?? "null");
    if (value?.version !== 1 || value.locale !== locale || typeof value.expires !== "number" || value.expires < Date.now()
      || !Array.isArray(value.model?.dimensions) || typeof value.model?.topCode !== "string"
      || !Array.isArray(value.model?.qualityFlags) || typeof value.model?.primaryType !== "string") return null;
    return value.model;
  } catch { return null; }
}

export function getCareer94ReportSnapshot(): string | null {
  try { return sessionStorage.getItem(key); } catch { return null; }
}

export function subscribeCareer94Report(listener: () => void): () => void {
  window.addEventListener("storage", listener);
  return () => window.removeEventListener("storage", listener);
}
