import type { Locale } from "@/lib/i18n/locales";

const CJK_PATTERN = /[\u3400-\u9fff\uf900-\ufaff]/u;

type RecordValue = Record<string, unknown>;

function asRecord(value: unknown): RecordValue | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as RecordValue) : null;
}

function containsCjkText(value: unknown): boolean {
  if (typeof value === "string") return CJK_PATTERN.test(value);
  if (Array.isArray(value)) return value.some((item) => containsCjkText(item));

  const record = asRecord(value);
  return record ? Object.values(record).some((item) => containsCjkText(item)) : false;
}

export function normalizeEnneagramPrivateLocale(value: unknown): "en" | "zh" | null {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (normalized === "en" || normalized === "en-us" || normalized === "en_us") return "en";
  if (normalized === "zh" || normalized === "zh-cn" || normalized === "zh_cn") return "zh";
  return null;
}

export function isSafeEnneagramPrivateText(value: unknown, locale: Locale): value is string {
  if (typeof value !== "string" || !value.trim()) return false;
  return locale !== "en" || !CJK_PATTERN.test(value);
}

/**
 * Private result data is backend-authoritative. English must bind an English
 * envelope and English slot; absent or Chinese slots are intentionally hidden.
 */
export function isEnneagramPrivateEnvelopeLocaleCompatible(value: unknown, locale: Locale): boolean {
  const record = asRecord(value);
  if (!record) return false;

  const expected = locale === "zh" ? "zh" : "en";
  return normalizeEnneagramPrivateLocale(record.locale ?? record.content_locale ?? record.slot_locale) === expected;
}

export function isEnneagramPrivateSurfaceLocaleCompatible(value: unknown, locale: Locale): boolean {
  return isEnneagramPrivateEnvelopeLocaleCompatible(value, locale) && (locale !== "en" || !containsCjkText(value));
}

export function readEnneagramPrivateLocalizedText(
  value: unknown,
  key: string,
  locale: Locale
): string | null {
  const record = asRecord(value);
  if (!record || !isEnneagramPrivateEnvelopeLocaleCompatible(record, locale)) return null;

  const suffix = locale === "zh" ? ["_zh", "_zh_cn"] : ["_en"];
  for (const candidate of [...suffix.map((item) => `${key}${item}`), key]) {
    if (isSafeEnneagramPrivateText(record[candidate], locale)) return record[candidate].trim();
  }

  return null;
}

export function isEnneagramPrivateResultLocaleCompatible(reportData: unknown, locale: Locale): boolean {
  const report = asRecord(reportData);
  if (!report || !isEnneagramPrivateEnvelopeLocaleCompatible(report, locale)) return false;

  const v2Candidate = report["enneagram_report_v2"] ?? asRecord(asRecord(report["report"])?.["_meta"])?.["enneagram_report_v2"];
  const v2 = asRecord(v2Candidate);
  if (!v2 || !isEnneagramPrivateEnvelopeLocaleCompatible(v2, locale)) return false;

  const rawModules = v2["modules"];
  const rawPages = v2["pages"];
  const modules = Array.isArray(rawModules)
    ? rawModules
    : (Array.isArray(rawPages)
      ? rawPages.flatMap((page: unknown) => {
          const pageModules = asRecord(page)?.["modules"];
          return Array.isArray(pageModules) ? pageModules : [];
        })
      : []);

  return modules.every((module: unknown) => {
    const content = asRecord(asRecord(module)?.content);
    if (content === null || !isEnneagramPrivateEnvelopeLocaleCompatible(content, locale)) return false;
    return locale !== "en" || !containsCjkText(content);
  });
}
