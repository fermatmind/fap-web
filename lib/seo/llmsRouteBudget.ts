export const LLMS_ROUTE_SOURCE_TIMEOUT_MS = 1500;

export const LLMS_ROUTE_ARTICLE_MAX_PAGES = 1;

export const LLMS_ROUTE_LIMITS = {
  articles: 40,
  careerFamilies: 24,
  careerGuides: 24,
  careerJobs: 80,
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
  options: { timeoutMs?: number } = {}
): Promise<T> {
  const timeoutMs = options.timeoutMs ?? LLMS_ROUTE_SOURCE_TIMEOUT_MS;
  const controller = new AbortController();
  let timeout: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      load(controller.signal),
      new Promise<T>((resolve) => {
        timeout = setTimeout(() => {
          resolve(fallback);
          controller.abort();
        }, timeoutMs);
      }),
    ]);
  } catch {
    return fallback;
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}
