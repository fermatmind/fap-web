import { ApiError } from "@/lib/api-client";

export const PERSONALITY_DETAIL_TIMEOUT_MS = 30_000;
export const PERSONALITY_DETAIL_MAX_ATTEMPTS = 2;

export function isRetryablePersonalityDetailError(error: unknown): boolean {
  return error instanceof ApiError
    && (error.status === 408 || error.status === 429 || error.status >= 500);
}

export async function withPersonalityDetailRetry<T>(load: () => Promise<T>): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= PERSONALITY_DETAIL_MAX_ATTEMPTS; attempt += 1) {
    try {
      return await load();
    } catch (error) {
      lastError = error;
      if (attempt === PERSONALITY_DETAIL_MAX_ATTEMPTS || !isRetryablePersonalityDetailError(error)) {
        throw error;
      }
    }
  }

  throw lastError;
}
