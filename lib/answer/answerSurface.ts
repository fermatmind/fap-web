import type { AnswerSurfaceRaw } from "@/lib/api/v0_3";
import { normalizeInternalHref } from "@/lib/url/safeContentUrls";

export type AnswerContentBlockViewModel = {
  key: string;
  title: string;
  body: string;
  href: string | null;
  kind: string | null;
};

export type AnswerFaqBlockViewModel = {
  key: string;
  question: string;
  answer: string;
};

export type AnswerNextStepBlockViewModel = {
  key: string;
  title: string;
  body: string;
  href: string | null;
  kind: string | null;
};

export type AnswerBundleItemViewModel = {
  key: string;
  title: string;
  count: number;
};

export type AnswerSurfaceViewModel = {
  version: string;
  answerContractVersion: string;
  answerFingerprint: string;
  answerScope: string;
  surfaceType: string;
  summaryBlocks: AnswerContentBlockViewModel[];
  faqBlocks: AnswerFaqBlockViewModel[];
  compareBlocks: AnswerContentBlockViewModel[];
  sceneSummaryBlocks: AnswerContentBlockViewModel[];
  nextStepBlocks: AnswerNextStepBlockViewModel[];
  answerBundle: AnswerBundleItemViewModel[];
  evidenceRefs: string[];
  publicSafetyState: string | null;
  indexabilityState: string;
  attributionScope: string;
  seoSurfaceRef: string | null;
  landingSurfaceRef: string | null;
  publicSurfaceRef: string | null;
  primaryContentRef: string | null;
  relatedSurfaceKeys: string[];
  runtimeArtifactRef: string | null;
};

function normalizeText(value: unknown): string {
  if (typeof value !== "string" && typeof value !== "number") {
    return "";
  }

  return String(value).trim();
}

function normalizeNullableText(value: unknown): string | null {
  const normalized = normalizeText(value);
  return normalized || null;
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.map((item) => normalizeText(item)).filter(Boolean))];
}

function readAllowedField(record: unknown, allowedFields: ReadonlySet<string>, key: string): unknown {
  if (!record || typeof record !== "object" || Array.isArray(record) || !allowedFields.has(key)) {
    return null;
  }

  return (record as Record<string, unknown>)[key];
}

const ANSWER_CONTENT_BLOCK_FIELDS = new Set(["key", "title", "body", "href", "kind"]);
const ANSWER_FAQ_BLOCK_FIELDS = new Set(["key", "question", "q", "answer", "a"]);
const ANSWER_NEXT_STEP_BLOCK_FIELDS = new Set(["key", "title", "body", "href", "kind"]);
const ANSWER_BUNDLE_FIELDS = new Set(["key", "title", "count"]);

function normalizeContentBlocks(value: unknown): AnswerContentBlockViewModel[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      const record = item && typeof item === "object" && !Array.isArray(item) ? item : {};
      const key = normalizeText(readAllowedField(record, ANSWER_CONTENT_BLOCK_FIELDS, "key"));
      const title = normalizeText(readAllowedField(record, ANSWER_CONTENT_BLOCK_FIELDS, "title"));
      const body = normalizeText(readAllowedField(record, ANSWER_CONTENT_BLOCK_FIELDS, "body"));
      if (!key && !title && !body) {
        return null;
      }

      return {
        key: key || title || body,
        title,
        body,
        href: normalizeInternalHref(readAllowedField(record, ANSWER_CONTENT_BLOCK_FIELDS, "href")),
        kind: normalizeNullableText(readAllowedField(record, ANSWER_CONTENT_BLOCK_FIELDS, "kind")),
      };
    })
    .filter((item): item is AnswerContentBlockViewModel => item !== null);
}

function normalizeFaqBlocks(value: unknown): AnswerFaqBlockViewModel[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      const record = item && typeof item === "object" && !Array.isArray(item) ? item : {};
      const question = normalizeText(
        readAllowedField(record, ANSWER_FAQ_BLOCK_FIELDS, "question") ?? readAllowedField(record, ANSWER_FAQ_BLOCK_FIELDS, "q")
      );
      const answer = normalizeText(
        readAllowedField(record, ANSWER_FAQ_BLOCK_FIELDS, "answer") ?? readAllowedField(record, ANSWER_FAQ_BLOCK_FIELDS, "a")
      );
      const key = normalizeText(readAllowedField(record, ANSWER_FAQ_BLOCK_FIELDS, "key")) || question || answer;
      if (!key && !question && !answer) {
        return null;
      }

      return {
        key,
        question,
        answer,
      };
    })
    .filter((item): item is AnswerFaqBlockViewModel => item !== null);
}

function normalizeNextStepBlocks(value: unknown): AnswerNextStepBlockViewModel[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      const record = item && typeof item === "object" && !Array.isArray(item) ? item : {};
      const title = normalizeText(readAllowedField(record, ANSWER_NEXT_STEP_BLOCK_FIELDS, "title"));
      const body = normalizeText(readAllowedField(record, ANSWER_NEXT_STEP_BLOCK_FIELDS, "body"));
      const href = normalizeInternalHref(readAllowedField(record, ANSWER_NEXT_STEP_BLOCK_FIELDS, "href"));
      const key = normalizeText(readAllowedField(record, ANSWER_NEXT_STEP_BLOCK_FIELDS, "key")) || title || href || body;
      if (!key && !title && !body && !href) {
        return null;
      }

      return {
        key,
        title,
        body,
        href,
        kind: normalizeNullableText(readAllowedField(record, ANSWER_NEXT_STEP_BLOCK_FIELDS, "kind")),
      };
    })
    .filter((item): item is AnswerNextStepBlockViewModel => item !== null);
}

function normalizeAnswerBundle(value: unknown): AnswerBundleItemViewModel[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      const record = item && typeof item === "object" && !Array.isArray(item) ? item : {};
      const key = normalizeText(readAllowedField(record, ANSWER_BUNDLE_FIELDS, "key"));
      if (!key) {
        return null;
      }

      return {
        key,
        title: normalizeText(readAllowedField(record, ANSWER_BUNDLE_FIELDS, "title")) || key,
        count: Math.max(0, Number(readAllowedField(record, ANSWER_BUNDLE_FIELDS, "count") ?? 0) || 0),
      };
    })
    .filter((item): item is AnswerBundleItemViewModel => item !== null);
}

export function normalizeAnswerSurface(raw: AnswerSurfaceRaw | null | undefined): AnswerSurfaceViewModel | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const summaryBlocks = normalizeContentBlocks(raw.summary_blocks);
  const faqBlocks = normalizeFaqBlocks(raw.faq_blocks);
  const compareBlocks = normalizeContentBlocks(raw.compare_blocks);
  const sceneSummaryBlocks = normalizeContentBlocks(raw.scene_summary_blocks);
  const nextStepBlocks = normalizeNextStepBlocks(raw.next_step_blocks);
  const answerBundle = normalizeAnswerBundle(raw.answer_bundle);

  if (
    !summaryBlocks.length &&
    !faqBlocks.length &&
    !compareBlocks.length &&
    !sceneSummaryBlocks.length &&
    !nextStepBlocks.length &&
    !normalizeText(raw.surface_type)
  ) {
    return null;
  }

  return {
    version: normalizeText(raw.version || raw.answer_contract_version || "answer.surface.v1"),
    answerContractVersion: normalizeText(raw.answer_contract_version || raw.version || "answer.surface.v1"),
    answerFingerprint: normalizeText(raw.answer_fingerprint),
    answerScope: normalizeText(raw.answer_scope),
    surfaceType: normalizeText(raw.surface_type),
    summaryBlocks,
    faqBlocks,
    compareBlocks,
    sceneSummaryBlocks,
    nextStepBlocks,
    answerBundle,
    evidenceRefs: normalizeStringArray(raw.evidence_refs),
    publicSafetyState: normalizeNullableText(raw.public_safety_state),
    indexabilityState: normalizeText(raw.indexability_state),
    attributionScope: normalizeText(raw.attribution_scope),
    seoSurfaceRef: normalizeNullableText(raw.seo_surface_ref),
    landingSurfaceRef: normalizeNullableText(raw.landing_surface_ref),
    publicSurfaceRef: normalizeNullableText(raw.public_surface_ref),
    primaryContentRef: normalizeNullableText(raw.primary_content_ref),
    relatedSurfaceKeys: normalizeStringArray(raw.related_surface_keys),
    runtimeArtifactRef: normalizeNullableText(raw.runtime_artifact_ref),
  };
}
