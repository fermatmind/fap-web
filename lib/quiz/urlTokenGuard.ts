"use client";

import { useEffect } from "react";

type RouterLike = {
  replace: (href: string, options?: { scroll?: boolean }) => void;
};

type SearchParamsLike = {
  toString: () => string;
};

const SENSITIVE_QUIZ_QUERY_KEYS = new Set([
  "access_token",
  "accesstoken",
  "auth",
  "auth_token",
  "authtoken",
  "authorization",
  "bearer",
  "bearer_token",
  "fm_token",
  "fmtoken",
  "guest_token",
  "guesttoken",
  "id_token",
  "idtoken",
  "resume_token",
  "resumetoken",
  "session",
  "session_id",
  "session_token",
  "sessiontoken",
  "token",
]);

function normalizeQueryKey(key: string): string {
  return key.trim().toLowerCase().replaceAll("-", "_");
}

export function isSensitiveQuizQueryKey(key: string): boolean {
  return SENSITIVE_QUIZ_QUERY_KEYS.has(normalizeQueryKey(key));
}

export function buildQuizUrlWithoutSensitiveQuery(pathname: string, rawQuery: string): string | null {
  if (!rawQuery) {
    return null;
  }

  const params = new URLSearchParams(rawQuery);
  let removedSensitiveQuery = false;

  for (const key of Array.from(params.keys())) {
    if (isSensitiveQuizQueryKey(key)) {
      params.delete(key);
      removedSensitiveQuery = true;
    }
  }

  if (!removedSensitiveQuery) {
    return null;
  }

  const cleanQuery = params.toString();
  return cleanQuery ? `${pathname}?${cleanQuery}` : pathname;
}

export function useConstrainQuizUrlTokens({
  pathname,
  router,
  searchParams,
}: {
  pathname: string;
  router: RouterLike;
  searchParams: SearchParamsLike;
}): void {
  const rawQuery = searchParams.toString();

  useEffect(() => {
    const cleanUrl = buildQuizUrlWithoutSensitiveQuery(pathname || "/", rawQuery);
    if (!cleanUrl) {
      return;
    }

    router.replace(cleanUrl, { scroll: false });
  }, [pathname, rawQuery, router]);
}
