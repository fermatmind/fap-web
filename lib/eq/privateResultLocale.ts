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

  if (typeof reportData === "string") {
    return !CJK_PATTERN.test(reportData);
  }

  if (Array.isArray(reportData)) {
    return reportData.every((item) => isEqPrivateResultLocaleCompatible(item, locale));
  }

  if (reportData && typeof reportData === "object") {
    const record = reportData as Record<string, unknown>;

    // Only check declared content locale, not internal metadata locale
    const contentLocale = (
      record["locale"] ??
      record["content_locale"] ??
      record["slot_locale"]
    );
    if (typeof contentLocale === "string") {
      const normalized = contentLocale.trim().toLowerCase();
      if (normalized === "zh" || normalized === "zh-cn" || normalized === "zh_cn") {
        return false;
      }
    }

    // Check report blocks/modules for CJK
    for (const key of ["blocks", "modules", "layout", "report_data", "result"]) {
      const value = record[key];
      if (value && typeof value === "object" && !isEqPrivateResultLocaleCompatible(value, locale)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Check a string value for CJK leakage in English context.
 */
export function isSafeEqEnglishText(value: unknown): value is string {
  if (typeof value !== "string" || !value.trim()) return false;
  return !CJK_PATTERN.test(value);
}
