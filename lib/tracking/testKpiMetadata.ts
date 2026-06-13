import { normalizeBig5FormCode } from "@/lib/big5/forms";
import {
  ENNEAGRAM_SCALE_CODE,
  normalizeEnneagramFormCode,
} from "@/lib/enneagram/forms";
import { toApiLocale, type Locale } from "@/lib/i18n/locales";
import { IQ_CANONICAL_SCALE_CODE, IQ_LEGACY_SCALE_CODE } from "@/lib/iq/constants";
import { normalizeMbtiFormCode } from "@/lib/mbti/forms";
import { normalizeRiasecFormCode, RIASEC_SCALE_CODE } from "@/lib/riasec/forms";

export type TestKpiMetadata = {
  scaleCode: string;
  scale_code: string;
  formCode?: string;
  form_code?: string;
  locale: Locale;
  apiLocale: "en" | "zh-CN";
};

export type TestKpiMetadataInput = {
  scaleCode: string | null | undefined;
  formCode?: string | null;
  locale: Locale;
};

function normalizeScaleCode(value: string | null | undefined): string {
  return String(value ?? "").trim().toUpperCase();
}

function normalizeLooseFormCode(value: string | null | undefined): string | undefined {
  const normalized = String(value ?? "").trim();
  return normalized ? normalized : undefined;
}

export function resolveTestKpiFormCode({
  scaleCode,
  formCode,
}: {
  scaleCode: string | null | undefined;
  formCode?: string | null;
}): string | undefined {
  const normalizedScaleCode = normalizeScaleCode(scaleCode);

  if (normalizedScaleCode === "MBTI") {
    return normalizeMbtiFormCode(formCode);
  }

  if (normalizedScaleCode === "BIG5_OCEAN") {
    return normalizeBig5FormCode(formCode);
  }

  if (normalizedScaleCode === ENNEAGRAM_SCALE_CODE) {
    return normalizeEnneagramFormCode(formCode);
  }

  if (normalizedScaleCode === RIASEC_SCALE_CODE) {
    return normalizeRiasecFormCode(formCode);
  }

  return normalizeLooseFormCode(formCode);
}

export function buildTestKpiMetadata({
  scaleCode,
  formCode,
  locale,
}: TestKpiMetadataInput): TestKpiMetadata {
  const normalizedScaleCode = normalizeScaleCode(scaleCode);
  const resolvedFormCode = resolveTestKpiFormCode({
    scaleCode: normalizedScaleCode,
    formCode,
  });

  return {
    scaleCode: normalizedScaleCode,
    scale_code: normalizedScaleCode,
    ...(resolvedFormCode ? { formCode: resolvedFormCode, form_code: resolvedFormCode } : {}),
    locale,
    apiLocale: toApiLocale(locale),
  };
}

export function buildTestKpiTrackingPayload(
  metadata: TestKpiMetadata,
  payload: Record<string, unknown>,
  options: { includeCamelScaleCode?: boolean } = {}
): Record<string, unknown> {
  return {
    ...payload,
    ...(options.includeCamelScaleCode ? { scaleCode: metadata.scaleCode } : {}),
    scale_code: metadata.scale_code,
    ...(metadata.form_code ? { form_code: metadata.form_code } : {}),
    locale: metadata.locale,
  };
}

export function isCanonicalIqScaleCode(scaleCode: string | null | undefined): boolean {
  const normalizedScaleCode = normalizeScaleCode(scaleCode);
  return normalizedScaleCode === IQ_CANONICAL_SCALE_CODE || normalizedScaleCode === IQ_LEGACY_SCALE_CODE;
}
