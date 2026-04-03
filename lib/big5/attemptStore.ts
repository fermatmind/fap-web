"use client";

import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import { resolveCanonicalSlug, SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";
import { getOrCreateAnonId, queuePendingAnonLinkAttempt } from "@/lib/anon";
import { DEFAULT_BIG5_FORM_CODE, normalizeBig5FormCode, type Big5FormCode } from "@/lib/big5/forms";

const BIG5_STORAGE_PREFIX = "fm_big5_attempt_v2";
const BIG5_LEGACY_STORAGE_KEY = "fm_big5_attempt_v1";
const BIG5_SLUG = SCALE_CANONICAL_SLUG_MAP.BIG5_OCEAN;

type Big5StorageContext = {
  slug: string;
  identity: string;
  formCode: Big5FormCode;
};

type Big5StorageContextInput = {
  slug?: string | null;
  identity?: string | null;
  formCode?: string | null;
};

export type Big5AttemptState = {
  attemptId: string | null;
  resumeToken: string | null;
  anonId: string | null;
  authToken: string | null;
  slug: string;
  formCode: Big5FormCode;
  answers: Record<string, string>;
  currentIndex: number;
  startedAt: number;
  disclaimerVersion: string | null;
  disclaimerHash: string | null;
  disclaimerAcceptedAt: string | null;
  manifestFingerprint: string | null;
  lastSubmittedAt: string | null;
};

type Big5AttemptActions = {
  hydrateAnonId: (anonId: string | null) => void;
  setSessionContext: (payload: {
    slug?: string | null;
    formCode?: string | null;
    anonId?: string | null;
  }) => void;
  setAuthToken: (token: string | null) => void;
  setAttemptMeta: (payload: {
    attemptId: string;
    resumeToken?: string | null;
    disclaimerVersion?: string | null;
    disclaimerHash?: string | null;
  }) => void;
  acceptDisclaimer: (payload: { version?: string | null; hash?: string | null }) => void;
  setAnswer: (questionId: string, code: string) => void;
  setCurrentIndex: (next: number) => void;
  setManifestFingerprint: (fingerprint: string | null) => void;
  markSubmitted: () => void;
  clearAttemptMeta: () => void;
  resetAfterSubmit: () => void;
  resetAll: () => void;
};

export type Big5AttemptStore = Big5AttemptState & Big5AttemptActions;

function normalizeSlug(value: string | null | undefined): string {
  const canonical = resolveCanonicalSlug(String(value ?? "").trim());
  return canonical || BIG5_SLUG;
}

function normalizeIdentity(value: string | null | undefined): string {
  const normalized = String(value ?? "").trim();
  return normalized || "anon";
}

function nowIso(): string {
  return new Date().toISOString();
}

function resolveRuntimeSlug(): string {
  if (typeof window === "undefined") return BIG5_SLUG;

  const path = window.location.pathname;
  const match = path.match(/\/tests\/([^/]+)(?:\/take)?/i);
  if (!match) return BIG5_SLUG;
  return normalizeSlug(match[1]);
}

function resolveRuntimeIdentity(): string {
  if (typeof window === "undefined") return "anon";
  try {
    return normalizeIdentity(getOrCreateAnonId());
  } catch {
    return "anon";
  }
}

function resolveRuntimeFormCode(): Big5FormCode {
  if (typeof window === "undefined") return DEFAULT_BIG5_FORM_CODE;

  const params = new URLSearchParams(window.location.search);
  return normalizeBig5FormCode(params.get("form") ?? params.get("form_code"));
}

function resolveRuntimeContext(): Big5StorageContext {
  return {
    slug: resolveRuntimeSlug(),
    identity: resolveRuntimeIdentity(),
    formCode: resolveRuntimeFormCode(),
  };
}

function buildStorageKey(context: Big5StorageContext): string {
  return `${BIG5_STORAGE_PREFIX}_${context.slug}_${context.identity}_${context.formCode}`;
}

function parsePersistedEnvelope(raw: string | null): Partial<Big5AttemptState> | null {
  if (!raw) return null;

  try {
    let parsed: unknown = JSON.parse(raw);

    for (let depth = 0; depth < 3; depth += 1) {
      if (!parsed || typeof parsed !== "object") break;
      const candidate = parsed as { state?: unknown };
      if (!candidate.state || typeof candidate.state !== "object") break;
      parsed = candidate.state;
    }

    if (!parsed || typeof parsed !== "object") return null;
    return parsed as Partial<Big5AttemptState>;
  } catch {
    return null;
  }
}

function ensureContext(context: Big5StorageContextInput): Big5StorageContext {
  const runtime = resolveRuntimeContext();

  return {
    slug: normalizeSlug(context.slug ?? runtime.slug),
    identity: normalizeIdentity(context.identity ?? runtime.identity),
    formCode: normalizeBig5FormCode(context.formCode ?? runtime.formCode),
  };
}

function resolveContextFromPersistedValue(value: string): Big5StorageContext {
  const persisted = parsePersistedEnvelope(value);
  return ensureContext({
    slug: persisted?.slug ?? undefined,
    identity: persisted?.anonId ?? undefined,
    formCode: persisted?.formCode ?? undefined,
  });
}

function upgradeLegacyEnvelope(raw: string, context: Big5StorageContext): string {
  const persisted = parsePersistedEnvelope(raw) ?? {};

  return JSON.stringify({
    version: 2,
    state: {
      ...persisted,
      slug: normalizeSlug(persisted.slug ?? context.slug),
      formCode: normalizeBig5FormCode(persisted.formCode ?? context.formCode),
      anonId: persisted.anonId ?? context.identity,
    },
  });
}

function readStorageValueForContext(context: Big5StorageContext): string | null {
  if (typeof window === "undefined") return null;

  const directKey = buildStorageKey(context);
  const direct = window.localStorage.getItem(directKey);
  if (direct) {
    return direct;
  }

  if (context.formCode !== DEFAULT_BIG5_FORM_CODE) {
    return null;
  }

  const legacy = window.localStorage.getItem(BIG5_LEGACY_STORAGE_KEY);
  if (!legacy) return null;

  const upgraded = upgradeLegacyEnvelope(legacy, context);
  window.localStorage.setItem(directKey, upgraded);
  return upgraded;
}

function restoreStateForContext(context: Big5StorageContext): Partial<Big5AttemptState> | null {
  if (typeof window === "undefined") return null;
  const raw = readStorageValueForContext(context);
  if (!raw) return null;
  return parsePersistedEnvelope(raw);
}

function createBig5Storage(): StateStorage {
  return {
    getItem: () => readStorageValueForContext(resolveRuntimeContext()),
    setItem: (_, value) => {
      if (typeof window === "undefined") return;
      const context = resolveContextFromPersistedValue(value);
      window.localStorage.setItem(buildStorageKey(context), value);
    },
    removeItem: () => {
      if (typeof window === "undefined") return;
      const context = resolveRuntimeContext();
      window.localStorage.removeItem(buildStorageKey(context));
    },
  };
}

function initialState(payload?: Big5StorageContextInput): Big5AttemptState {
  const context = ensureContext(payload ?? {});
  return {
    attemptId: null,
    resumeToken: null,
    anonId: context.identity === "anon" ? null : context.identity,
    authToken: null,
    slug: context.slug,
    formCode: context.formCode,
    answers: {},
    currentIndex: 0,
    startedAt: Date.now(),
    disclaimerVersion: null,
    disclaimerHash: null,
    disclaimerAcceptedAt: null,
    manifestFingerprint: null,
    lastSubmittedAt: null,
  };
}

function mergeContextState(base: Big5AttemptState, context: Big5StorageContext): Big5AttemptState {
  return {
    ...base,
    slug: context.slug,
    formCode: context.formCode,
    anonId: context.identity === "anon" ? null : context.identity,
  };
}

export const useBig5AttemptStore = create<Big5AttemptStore>()(
  persist(
    (set) => ({
      ...initialState(),
      hydrateAnonId: (anonId) => set((state) => ({ ...state, anonId: anonId ?? state.anonId })),
      setSessionContext: ({ slug, formCode, anonId }) =>
        set((state) => {
          const context = ensureContext({
            slug: slug ?? state.slug,
            formCode: formCode ?? state.formCode,
            identity: anonId ?? state.anonId,
          });

          const nextIdentity = context.identity === "anon" ? null : context.identity;
          const contextChanged =
            state.slug !== context.slug || state.formCode !== context.formCode || state.anonId !== nextIdentity;

          if (!contextChanged) {
            return state;
          }

          const restored = restoreStateForContext(context);
          if (restored) {
            return mergeContextState(
              {
                ...initialState(context),
                ...restored,
                authToken: state.authToken,
              },
              context
            );
          }

          return mergeContextState(
            {
              ...initialState(context),
              authToken: state.authToken,
            },
            context
          );
        }),
      setAuthToken: (token) => set({ authToken: token }),
      setAttemptMeta: ({ attemptId, resumeToken, disclaimerVersion, disclaimerHash }) =>
        set((state) => {
          queuePendingAnonLinkAttempt(attemptId);
          return {
            ...state,
            attemptId,
            resumeToken: resumeToken ?? state.resumeToken,
            disclaimerVersion: disclaimerVersion ?? state.disclaimerVersion,
            disclaimerHash: disclaimerHash ?? state.disclaimerHash,
          };
        }),
      acceptDisclaimer: ({ version, hash }) =>
        set((state) => ({
          ...state,
          disclaimerVersion: version ?? state.disclaimerVersion,
          disclaimerHash: hash ?? state.disclaimerHash,
          disclaimerAcceptedAt: nowIso(),
        })),
      setAnswer: (questionId, code) =>
        set((state) => ({
          ...state,
          answers: {
            ...state.answers,
            [questionId]: code,
          },
        })),
      setCurrentIndex: (next) =>
        set((state) => ({
          ...state,
          currentIndex: Math.max(0, next),
        })),
      setManifestFingerprint: (fingerprint) => set({ manifestFingerprint: fingerprint }),
      markSubmitted: () => set({ lastSubmittedAt: nowIso() }),
      clearAttemptMeta: () =>
        set((state) => ({
          ...state,
          attemptId: null,
          resumeToken: null,
          lastSubmittedAt: null,
        })),
      resetAfterSubmit: () =>
        set((state) => ({
          ...initialState({
            slug: state.slug,
            formCode: state.formCode,
            identity: state.anonId,
          }),
          anonId: state.anonId,
          authToken: state.authToken,
          slug: state.slug,
          formCode: state.formCode,
          manifestFingerprint: state.manifestFingerprint,
          disclaimerVersion: state.disclaimerVersion,
          disclaimerHash: state.disclaimerHash,
          disclaimerAcceptedAt: state.disclaimerAcceptedAt,
        })),
      resetAll: () =>
        set((state) => ({
          ...initialState({
            slug: state.slug,
            formCode: state.formCode,
            identity: state.anonId,
          }),
          anonId: state.anonId,
          authToken: state.authToken,
          slug: state.slug,
          formCode: state.formCode,
        })),
    }),
    {
      name: BIG5_STORAGE_PREFIX,
      version: 2,
      storage: createJSONStorage(() => createBig5Storage()),
      partialize: (state) => ({
        attemptId: state.attemptId,
        resumeToken: state.resumeToken,
        anonId: state.anonId,
        authToken: state.authToken,
        slug: state.slug,
        formCode: state.formCode,
        answers: state.answers,
        currentIndex: state.currentIndex,
        startedAt: state.startedAt,
        disclaimerVersion: state.disclaimerVersion,
        disclaimerHash: state.disclaimerHash,
        disclaimerAcceptedAt: state.disclaimerAcceptedAt,
        manifestFingerprint: state.manifestFingerprint,
        lastSubmittedAt: state.lastSubmittedAt,
      }),
    }
  )
);
