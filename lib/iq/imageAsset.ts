import { resolveApiOrigin } from "@/lib/api-base";
import { ApiError } from "@/lib/api-client";
import { getOrCreateAnonId } from "@/lib/anon";
import { runWithGuestTokenRetry } from "@/lib/auth/authRetry";
import { getFmToken } from "@/lib/auth/fmToken";

const OWNER_ASSET_PREFIX = "/api/v0.3/iq-owner-original-30/assets/";

export function isAttemptBoundIqAsset(src: string): boolean {
  try {
    return new URL(src, resolveApiOrigin()).pathname.startsWith(OWNER_ASSET_PREFIX);
  } catch {
    return false;
  }
}

export async function fetchIqImageBlob(src: string, signal: AbortSignal): Promise<Blob> {
  const apiOrigin = new URL(resolveApiOrigin()).origin;
  const url = new URL(src, typeof window === "undefined" ? apiOrigin : window.location.origin);
  const sameOrigin = typeof window !== "undefined" && url.origin === window.location.origin;
  if (
    !isAttemptBoundIqAsset(src) ||
    (url.origin !== apiOrigin && !sameOrigin) ||
    url.username || url.password || !url.searchParams.get("attempt_id")
  ) {
    throw new Error("Invalid IQ image endpoint.");
  }

  return runWithGuestTokenRetry({
    anonId: getOrCreateAnonId(),
    runner: async () => {
      signal.throwIfAborted();
      const token = getFmToken();
      const response = await fetch(url.href, {
        headers: { Accept: "image/webp", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        signal,
        cache: "no-store",
        redirect: "error",
      });
      if (!response.ok) {
        throw new ApiError({
          status: response.status,
          errorCode: "IQ_IMAGE_UNAVAILABLE",
          message: "IQ image unavailable.",
        });
      }
      if (response.headers.get("Content-Type")?.split(";")[0].trim() !== "image/webp") {
        throw new Error("Invalid IQ image response.");
      }
      return response.blob();
    },
  });
}
