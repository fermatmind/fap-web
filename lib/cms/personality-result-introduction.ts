import { apiClient } from "@/lib/api-client";
import type { Locale } from "@/lib/i18n/locales";

export type PersonalityResultIntroduction = {
  fullCode: string;
  locale: "zh-CN" | "en";
  paragraphs: [string, string];
  revision: number;
  contentHash: string;
};

export async function fetchPersonalityResultIntroduction(
  fullCode: string,
  locale: Locale,
  signal?: AbortSignal,
): Promise<PersonalityResultIntroduction | null> {
  if (!/^[EI][SN][TF][JP]-[AT]$/.test(fullCode)) return null;
  const apiLocale = locale === "zh" ? "zh-CN" : "en";
  const value = await apiClient.get<Record<string, unknown>>(
    `/v0.5/personality/${fullCode.toLowerCase()}/result-intro?locale=${apiLocale}`,
    { locale, skipAuth: true, cache: "no-store", signal },
  );
  if (
    !value || value.ok !== true || value.schema !== "mbti_result_introduction.v1"
    || value.full_code !== fullCode || value.locale !== apiLocale
    || !Array.isArray(value.paragraphs) || value.paragraphs.length !== 2
    || !value.paragraphs.every((text) => typeof text === "string" && text.trim().length > 0)
    || typeof value.revision !== "number" || !Number.isInteger(value.revision) || value.revision < 1
    || typeof value.content_hash !== "string" || !/^[a-f0-9]{64}$/.test(value.content_hash)
  ) return null;
  return {
    fullCode,
    locale: apiLocale,
    paragraphs: value.paragraphs as [string, string],
    revision: value.revision,
    contentHash: value.content_hash,
  };
}
