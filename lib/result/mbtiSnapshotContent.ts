import type { ReportResponse } from "@/lib/api/v0_3";
import {
  normalizeDesktopCloneSnapshotApiLocale,
  type PersonalityDesktopCloneContentPayload,
} from "@/lib/cms/personality-desktop-clone";
import type { Locale } from "@/lib/i18n/locales";

export type MbtiSnapshotContentErrorCode =
  | "DESKTOP_CLONE_CONTENT_MISSING"
  | "PDF_PLACEHOLDER_CONTENT"
  | "PDF_CONTENT_LOCALE_MISMATCH"
  | "PDF_CONTENT_TYPE_MISMATCH"
  | "DESKTOP_CLONE_CONTENT_SOURCE_INVALID"
  | "PDF_CONTENT_NOT_READY";

export type MbtiSnapshotContentStatus =
  | {
      ok: true;
      source: "server-prefetched-desktop-clone" | "storage" | "result-adapter";
      missing: [];
    }
  | {
      ok: false;
      code: MbtiSnapshotContentErrorCode;
      missing: string[];
    };

const MBTI_FULL_CODE_RE = /^[IE][NS][TF][JP]-[AT]$/i;
const PLACEHOLDER_PHRASES = [
  "占位槽位",
  "Placeholder trait slot",
  "等待后续映射",
  "runtime 映射",
  "clone shell",
  "content not ready",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function normalizeText(...values: unknown[]): string {
  for (const value of values) {
    const normalized = String(value ?? "").trim();
    if (normalized) {
      return normalized;
    }
  }

  return "";
}

function normalizeFullCode(value: unknown): string {
  const normalized = normalizeText(value).toUpperCase();
  return MBTI_FULL_CODE_RE.test(normalized) ? normalized : "";
}

export function resolveMbtiSnapshotFullCodeFromReport(report: ReportResponse | null | undefined): string | null {
  const projection = isRecord(report?.mbti_public_projection_v1) ? report?.mbti_public_projection_v1 : null;
  const reportNode = isRecord(report?.report) ? report?.report : null;
  const profile = isRecord(reportNode?.profile) ? reportNode?.profile : null;

  const fullCode = [
    projection?.display_type,
    projection?.runtime_type_code,
    report?.type_code,
    profile?.type_code,
    projection?.canonical_type_code,
  ].map(normalizeFullCode).find((candidate) => candidate.length > 0);

  return fullCode || null;
}

function pushIfMissing(missing: string[], condition: boolean, key: string): void {
  if (!condition) {
    missing.push(key);
  }
}

function hasVisibleBlockBody(blocks: unknown): boolean {
  if (!Array.isArray(blocks) || blocks.length === 0) {
    return false;
  }

  return blocks.some((block) => {
    if (!isRecord(block) || !Array.isArray(block.items)) {
      return false;
    }

    return block.items.some((item) => isRecord(item) && normalizeText(item.body).length > 0);
  });
}

function hasPlaceholderTrait(traits: unknown): boolean {
  if (!Array.isArray(traits)) {
    return true;
  }

  return traits.some((trait) =>
    !isRecord(trait)
    || trait.isPlaceholder === true
    || normalizeText(trait.label).toLowerCase() === "placeholder trait slot"
  );
}

function containsPlaceholderPhrase(value: unknown): boolean {
  const serialized = JSON.stringify(value ?? "");
  return PLACEHOLDER_PHRASES.some((phrase) => serialized.includes(phrase));
}

export function validateMbtiSnapshotDesktopCloneContent({
  locale,
  fullCode,
  payload,
}: {
  locale: Locale;
  fullCode: string | null | undefined;
  payload: PersonalityDesktopCloneContentPayload | null | undefined;
}): MbtiSnapshotContentStatus {
  const expectedFullCode = normalizeFullCode(fullCode);
  if (!payload) {
    return {
      ok: false,
      code: "DESKTOP_CLONE_CONTENT_MISSING",
      missing: ["desktop_clone_content"],
    };
  }

  if (!expectedFullCode || normalizeFullCode(payload.fullCode) !== expectedFullCode) {
    return {
      ok: false,
      code: "PDF_CONTENT_TYPE_MISMATCH",
      missing: ["full_code"],
    };
  }

  const expectedLocale = normalizeDesktopCloneSnapshotApiLocale(locale);
  if (!expectedLocale || payload.locale !== expectedLocale) {
    return {
      ok: false,
      code: "PDF_CONTENT_LOCALE_MISMATCH",
      missing: ["locale"],
    };
  }

  const missing: string[] = [];
  const content = payload.content;
  pushIfMissing(missing, hasVisibleBlockBody(content.chapters.career.visibleBlocks), "career.visibleBlocks");
  pushIfMissing(missing, hasVisibleBlockBody(content.chapters.growth.visibleBlocks), "growth.visibleBlocks");
  pushIfMissing(missing, hasVisibleBlockBody(content.chapters.relationships.visibleBlocks), "relationships.visibleBlocks");

  if (missing.length > 0) {
    return {
      ok: false,
      code: "PDF_CONTENT_NOT_READY",
      missing,
    };
  }

  if (
    hasPlaceholderTrait(content.chapters.career.influentialTraits)
    || hasPlaceholderTrait(content.chapters.growth.influentialTraits)
    || hasPlaceholderTrait(content.chapters.relationships.influentialTraits)
    || containsPlaceholderPhrase(content)
  ) {
    return {
      ok: false,
      code: "PDF_PLACEHOLDER_CONTENT",
      missing: ["placeholder_content"],
    };
  }

  return {
    ok: true,
    source: "server-prefetched-desktop-clone",
    missing: [],
  };
}
