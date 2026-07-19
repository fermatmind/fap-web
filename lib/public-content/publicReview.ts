export const PUBLIC_REVIEW_STATES = ["approved", "pending", "rejected", "unknown"] as const;

export type PublicReviewState = (typeof PUBLIC_REVIEW_STATES)[number];

export type PublicReview = {
  reviewState: PublicReviewState;
  lastReviewedAt: string | null;
  reviewer: null;
};

const PUBLIC_REVIEW_STATE_SET = new Set<string>(PUBLIC_REVIEW_STATES);
const UTC_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?Z$/;

export function unknownPublicReview(): PublicReview {
  return {
    reviewState: "unknown",
    lastReviewedAt: null,
    reviewer: null,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeUtcTimestamp(value: unknown): string | null | undefined {
  if (value === null) {
    return null;
  }

  if (typeof value !== "string" || !UTC_TIMESTAMP_PATTERN.test(value)) {
    return undefined;
  }

  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : undefined;
}

export function normalizePublicReview(value: unknown): PublicReview {
  if (
    !isRecord(value) ||
    !Object.hasOwn(value, "review_state") ||
    !Object.hasOwn(value, "last_reviewed_at") ||
    !Object.hasOwn(value, "reviewer") ||
    value.reviewer !== null ||
    typeof value.review_state !== "string" ||
    !PUBLIC_REVIEW_STATE_SET.has(value.review_state)
  ) {
    return unknownPublicReview();
  }

  const lastReviewedAt = normalizeUtcTimestamp(value.last_reviewed_at);
  if (lastReviewedAt === undefined) {
    return unknownPublicReview();
  }

  return {
    reviewState: value.review_state as PublicReviewState,
    lastReviewedAt,
    reviewer: null,
  };
}

export function isHumanReviewCompleted(review: PublicReview | null | undefined): boolean {
  return review?.reviewState === "approved";
}
