export const LLMS_ROUTE_SOURCE_TIMEOUT_MS = 1500;
export const LLMS_ROUTE_PERSONALITY_TIMEOUT_MS = 60_000;
export const LLMS_ROUTE_ARTICLE_TIMEOUT_MS = 10_000;
// Complete artifacts rebuild off-request, so their article enumeration may outlive
// the public response deadline while the route continues to serve verified cache.
export const LLMS_FULL_ARTICLE_ENUMERATION_TIMEOUT_MS = 30_000;
export const LLMS_FULL_ARTICLE_ENUMERATION_PAGE_CONCURRENCY = 3;
export const LLMS_ROUTE_CONTENT_PAGE_TIMEOUT_MS = 5_000;
export const LLMS_ROUTE_CAREER_JOB_TIMEOUT_MS = 30_000;
export const LLMS_FULL_PERSONALITY_SOURCE_TIMEOUT_MS = 8_000;
export const LLMS_FULL_TEST_SOURCE_TIMEOUT_MS = 8_000;
export const LLMS_FULL_RESPONSE_DEADLINE_MS = 12_000;
export const LLMS_FULL_DEGRADED_CAREER_JOB_TIMEOUT_MS = 8_000;
export const LLMS_FULL_ENRICHMENT_TIMEOUT_MS = 350;
export const LLMS_FULL_ARTIFACT_HARD_SOURCE_TIMEOUT_MS = 60_000;
export const LLMS_FULL_ARTIFACT_OPTIONAL_SOURCE_TIMEOUT_MS = 30_000;
export const LLMS_FULL_ARTIFACT_ENRICHMENT_TIMEOUT_MS = 5_000;
export const LLMS_FULL_ARTIFACT_BUILD_TIMEOUT_MS = 5 * 60_000;
export const LLMS_FULL_ARTIFACT_SOURCE_CONCURRENCY = 3;
export const LLMS_FULL_ARTIFACT_HARD_SOURCE_ATTEMPTS = 2;

export const LLMS_ROUTE_ARTICLE_MAX_PAGES = 5;

export const LLMS_ROUTE_LIMITS = {
  articles: 40,
  careerFamilies: 24,
  careerGuides: 24,
  careerJobs: 2200,
  careerRecommendations: 32,
  helpPages: 60,
  personalityProfiles: 64,
  tests: 80,
  topics: 40,
} as const;

export function limitLlmsRouteEntries<T>(items: readonly T[], limit: number): T[] {
  if (!Number.isFinite(limit) || limit <= 0) {
    return [];
  }

  return items.slice(0, Math.floor(limit));
}

export async function withLlmsRouteBudget<T>(
  load: (signal: AbortSignal) => Promise<T>,
  fallback: T,
  options: { timeoutMs?: number; signal?: AbortSignal } = {}
): Promise<T> {
  const timeoutMs = options.timeoutMs ?? LLMS_ROUTE_SOURCE_TIMEOUT_MS;
  const controller = new AbortController();
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let resolveBudget: ((value: T) => void) | undefined;
  const abort = () => {
    resolveBudget?.(fallback);
    controller.abort();
  };

  try {
    if (options.signal?.aborted) {
      abort();
      return fallback;
    }
    options.signal?.addEventListener("abort", abort, { once: true });

    return await Promise.race([
      load(controller.signal),
      new Promise<T>((resolve) => {
        resolveBudget = resolve;
        timeout = setTimeout(() => {
          abort();
        }, timeoutMs);
      }),
    ]);
  } catch {
    return fallback;
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
    options.signal?.removeEventListener("abort", abort);
  }
}
