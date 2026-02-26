import { ApiError } from "@/lib/api-client";
import { getFmToken, requestGuestToken } from "@/lib/auth/fmToken";

export function isUnauthorizedApiError(error: unknown): error is ApiError {
  return error instanceof ApiError && error.status === 401;
}

export async function runWithGuestTokenRetry<T>({
  runner,
  anonId,
  locale,
  onGuestTokenFailure,
}: {
  runner: () => Promise<T>;
  anonId?: string;
  locale?: string;
  onGuestTokenFailure?: (guestTokenError: unknown, sourceError: ApiError) => void;
}): Promise<T> {
  try {
    return await runner();
  } catch (error) {
    if (!isUnauthorizedApiError(error)) {
      throw error;
    }

    try {
      await requestGuestToken({
        anonId,
        locale,
      });
    } catch (guestTokenError) {
      onGuestTokenFailure?.(guestTokenError, error);
      throw guestTokenError;
    }

    return runner();
  }
}

export async function ensureFmTokenReady({
  anonId,
  locale,
  forceRefresh = false,
}: {
  anonId?: string;
  locale?: string;
  forceRefresh?: boolean;
}): Promise<"existing" | "issued"> {
  if (!forceRefresh && getFmToken()) {
    return "existing";
  }

  await requestGuestToken({
    anonId,
    locale,
  });

  return "issued";
}
