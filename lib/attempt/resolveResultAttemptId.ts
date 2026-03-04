type AttemptIdCarrier = {
  attempt_id?: unknown;
  result?: {
    attempt_id?: unknown;
    [key: string]: unknown;
  };
  meta?: {
    attempt_id?: unknown;
    [key: string]: unknown;
  };
  report?: {
    attempt_id?: unknown;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

function normalizeAttemptId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

export function resolveResultAttemptId(response: AttemptIdCarrier, fallbackAttemptId: string): string {
  const candidates = [
    response.attempt_id,
    response.result?.attempt_id,
    response.meta?.attempt_id,
    response.report?.attempt_id,
    fallbackAttemptId,
  ];

  for (const candidate of candidates) {
    const resolved = normalizeAttemptId(candidate);
    if (resolved) {
      return resolved;
    }
  }

  return fallbackAttemptId;
}
