"use client";

const STORAGE_PREFIX = "fm.result_access_token.";
const MAX_TOKEN_LENGTH = 2048;

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function storageKey(attemptId: string): string | null {
  const normalized = normalizeText(attemptId);
  return normalized ? `${STORAGE_PREFIX}${normalized}` : null;
}

function hasSessionStorage(): boolean {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

export function stashResultAccessTokenForAttempt(attemptId: string, accessToken: string | null | undefined): void {
  const key = storageKey(attemptId);
  const token = normalizeText(accessToken);
  if (!key || !token || token.length > MAX_TOKEN_LENGTH || !hasSessionStorage()) {
    return;
  }

  try {
    window.sessionStorage.setItem(key, token);
  } catch {
    // Session storage can be unavailable in restricted browser contexts.
  }
}

export function readResultAccessTokenForAttempt(attemptId: string): string | null {
  const key = storageKey(attemptId);
  if (!key || !hasSessionStorage()) {
    return null;
  }

  try {
    const token = normalizeText(window.sessionStorage.getItem(key));
    return token && token.length <= MAX_TOKEN_LENGTH ? token : null;
  } catch {
    return null;
  }
}
