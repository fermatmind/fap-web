const CAREER_JOB_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function normalizeCareerJobSlug(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  return CAREER_JOB_SLUG_RE.test(normalized) ? normalized : null;
}

export function isSafeCareerJobSlug(value: unknown): value is string {
  return normalizeCareerJobSlug(value) === value;
}
