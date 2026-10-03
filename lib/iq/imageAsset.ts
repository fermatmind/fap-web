import { resolveApiOrigin } from "@/lib/api-base";
import { ApiError } from "@/lib/api-client";
import { getOrCreateAnonId } from "@/lib/anon";
import { runWithGuestTokenRetry } from "@/lib/auth/authRetry";
import { getFmToken } from "@/lib/auth/fmToken";

const OWNER_ASSET_PREFIX = "/api/v0.3/iq-owner-original-30/assets/";
const IQ_IMAGE_CONTENT_TYPES = new Set(["image/webp", "image/png", "image/jpeg"]);

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
        headers: { Accept: "image/webp,image/png,image/jpeg", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
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
      if (!IQ_IMAGE_CONTENT_TYPES.has(response.headers.get("Content-Type")?.split(";")[0].trim().toLowerCase() ?? "")) {
        throw new Error("Invalid IQ image response.");
      }
      return response.blob();
    },
  });
}

// One take-page session owns these URLs. They never enter browser storage or a global cache.
export function createIqImageCache() {
  const entries = new Map<string, {
    controller: AbortController;
    promise: Promise<string>;
    url?: string;
    ready: boolean;
    timeout: ReturnType<typeof setTimeout>;
  }>();

  return {
    getUrl(src: string): string | undefined {
      const entry = entries.get(src);
      return entry?.ready ? entry.url : undefined;
    },
    load(src: string): Promise<string> {
      const existing = entries.get(src);
      if (existing) return existing.promise;

      const controller = new AbortController();
      const entry = { controller, ready: false } as {
        controller: AbortController; promise: Promise<string>; url?: string; ready: boolean;
        timeout: ReturnType<typeof setTimeout>;
      };
      entry.timeout = setTimeout(() => controller.abort(), 15000);
      entry.promise = fetchIqImageBlob(src, controller.signal)
        .then(async (blob) => {
          controller.signal.throwIfAborted();
          entry.url = URL.createObjectURL(blob);
          const image = new Image();
          image.src = entry.url;
          if (typeof image.decode === "function") await image.decode();
          controller.signal.throwIfAborted();
          entry.ready = true;
          return entry.url;
        })
        .catch((error: unknown) => {
          if (entry.url) URL.revokeObjectURL(entry.url);
          entry.url = undefined;
          if (entries.get(src) === entry) entries.delete(src);
          throw error;
        })
        .finally(() => clearTimeout(entry.timeout));
      entries.set(src, entry);
      return entry.promise;
    },
    dispose() {
      for (const entry of entries.values()) {
        entry.controller.abort();
        clearTimeout(entry.timeout);
        if (entry.url) URL.revokeObjectURL(entry.url);
        entry.url = undefined;
      }
      entries.clear();
    },
  };
}
