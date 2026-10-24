import type { Locale } from "@/lib/i18n/locales";

const CJK_PATTERN = /[\u3400-\u9fff\uf900-\ufaff]/u;

/**
 * EQ-60 private result content is backend-authoritative and locale-locked.
 * English results must not contain CJK characters in the content payload;
 * a zh-CN slot in an English page must fail closed rather than silently
 * render mismatched content.
 *
 * This check targets the report payload surface — result blocks, agent
 * metadata, and layout — not internal runtime identifiers or nested
 * multilingual admin fields.
 */
export function isEqPrivateResultLocaleCompatible(reportData: unknown, locale: Locale): boolean {
  if (locale !== "en") return true;

  function compatible(value: unknown, path: string[] = [], canonical = false): boolean {
    if (typeof value === "string") return !CJK_PATTERN.test(value);
    if (Array.isArray(value)) return value.every((item) => compatible(item, path, canonical));
    if (!value || typeof value !== "object") return true;

    const record = value as Record<string, unknown>;
    const isCanonical = record.schema_version === "eq_60.report.v2"
      && record.scale_code === "EQ_60" && record.eq_report_mode === "self_report"
      && record.measurement_type === "self_report_trait_mixed_ei";
    const currentPath = isCanonical ? [] : path;
    const inCanonical = canonical || isCanonical;
    const contentLocale = record.locale ?? record.content_locale ?? record.slot_locale;
    if (typeof contentLocale === "string" && ["zh", "zh-cn", "zh_cn"].includes(contentLocale.trim().toLowerCase())) return false;

    return Object.entries(record).every(([key, child]) => {
      // Eq60ReportComposer::publicPersonalizationRoute retains a bilingual
      // routing record here. UI copy comes exclusively from the separately
      // localized assets.personalization_route, which is still checked below.
      // Authority, required assets and access are independently fail-closed.
      if (inCanonical && currentPath.length === 1 && currentPath[0] === "interpretation" && key === "personalization_route") return true;
      return compatible(child, [...currentPath, key], inCanonical);
    });
  }
  return compatible(reportData);
}

/**
 * Check a string value for CJK leakage in English context.
 */
export function isSafeEqEnglishText(value: unknown): value is string {
  if (typeof value !== "string" || !value.trim()) return false;
  return !CJK_PATTERN.test(value);
}
