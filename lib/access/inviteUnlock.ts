"use client";

import type { AttemptInviteUnlockProgressResponse } from "@/lib/api/v0_3";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import type { UnifiedUnlockSource, UnifiedUnlockStage } from "@/lib/access/unifiedAccess";

const MBTI_INVITE_TAKE_PATH = "/tests/mbti-personality-test-16-personality-types/take";

export type AttemptInviteUnlockProgressView = {
  inviteCode: string | null;
  inviteUrl: string | null;
  status: string | null;
  requiredInvitees: number;
  completedInvitees: number;
  targetAttemptId: string | null;
  unlockStage: UnifiedUnlockStage | null;
  unlockSource: UnifiedUnlockSource | null;
};

function normalizeText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizePositiveInteger(value: unknown, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  const integer = Math.floor(value);
  if (integer <= 0) {
    return fallback;
  }

  return integer;
}

function normalizeNonNegativeInteger(value: unknown, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  const integer = Math.floor(value);
  if (integer < 0) {
    return fallback;
  }

  return integer;
}

function normalizeUnlockStage(value: unknown): UnifiedUnlockStage | null {
  const normalized = normalizeText(value);
  if (normalized === "locked" || normalized === "partial" || normalized === "full") {
    return normalized;
  }

  return null;
}

function normalizeUnlockSource(value: unknown): UnifiedUnlockSource | null {
  const normalized = normalizeText(value);
  if (normalized === "none" || normalized === "invite" || normalized === "payment" || normalized === "mixed") {
    return normalized;
  }

  return null;
}

function normalizeInviteUrl(value: unknown, locale: Locale): string | null {
  const normalized = normalizeText(value);
  if (!normalized) {
    return null;
  }

  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  const candidate = normalized.startsWith("/") ? normalized : `/${normalized}`;
  const firstSegment = candidate.split("/").filter(Boolean)[0];
  if (firstSegment === "en" || firstSegment === "zh") {
    return candidate;
  }

  return localizedPath(candidate, locale);
}

export function normalizeAttemptInviteUnlockProgress(
  raw: AttemptInviteUnlockProgressResponse | null | undefined,
  locale: Locale
): AttemptInviteUnlockProgressView | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const requiredInvitees = normalizePositiveInteger(raw.required_invitees, 2);
  const completedInvitees = Math.min(
    requiredInvitees,
    normalizeNonNegativeInteger(raw.completed_invitees, 0)
  );

  return {
    inviteCode: normalizeText(raw.invite_code),
    inviteUrl: normalizeInviteUrl(raw.invite_url, locale),
    status: normalizeText(raw.status),
    requiredInvitees,
    completedInvitees,
    targetAttemptId: normalizeText(raw.target_attempt_id),
    unlockStage: normalizeUnlockStage(raw.unlock_stage),
    unlockSource: normalizeUnlockSource(raw.unlock_source),
  };
}

export function resolveInviteUnlockUrl({
  progress,
  locale,
}: {
  progress: AttemptInviteUnlockProgressView | null | undefined;
  locale: Locale;
}): string | null {
  const normalizedUrl = normalizeInviteUrl(progress?.inviteUrl, locale);
  if (normalizedUrl) {
    return normalizedUrl;
  }

  const inviteCode = normalizeText(progress?.inviteCode);
  if (!inviteCode) {
    return null;
  }

  const basePath = localizedPath(MBTI_INVITE_TAKE_PATH, locale);
  const url = new URL(basePath, "https://fap.local");
  url.searchParams.set("invite_code", inviteCode);
  return `${url.pathname}${url.search}`;
}

export function resolveAbsoluteInviteUnlockUrl({
  progress,
  locale,
}: {
  progress: AttemptInviteUnlockProgressView | null | undefined;
  locale: Locale;
}): string | null {
  const resolved = resolveInviteUnlockUrl({ progress, locale });
  if (!resolved) {
    return null;
  }

  if (/^https?:\/\//i.test(resolved)) {
    return resolved;
  }

  if (typeof window === "undefined" || !window.location?.origin) {
    return resolved;
  }

  return new URL(resolved, window.location.origin).toString();
}
