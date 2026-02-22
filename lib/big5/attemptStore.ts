"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Big5AttemptState = {
  attemptId: string | null;
  resumeToken: string | null;
  anonId: string | null;
  authToken: string | null;
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
  resetAfterSubmit: () => void;
  resetAll: () => void;
};

export type Big5AttemptStore = Big5AttemptState & Big5AttemptActions;

function nowIso(): string {
  return new Date().toISOString();
}

function initialState(): Big5AttemptState {
  return {
    attemptId: null,
    resumeToken: null,
    anonId: null,
    authToken: null,
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

export const useBig5AttemptStore = create<Big5AttemptStore>()(
  persist(
    (set) => ({
      ...initialState(),
      hydrateAnonId: (anonId) => set((state) => ({ ...state, anonId: anonId ?? state.anonId })),
      setAuthToken: (token) => set({ authToken: token }),
      setAttemptMeta: ({ attemptId, resumeToken, disclaimerVersion, disclaimerHash }) =>
        set((state) => ({
          ...state,
          attemptId,
          resumeToken: resumeToken ?? state.resumeToken,
          disclaimerVersion: disclaimerVersion ?? state.disclaimerVersion,
          disclaimerHash: disclaimerHash ?? state.disclaimerHash,
        })),
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
      resetAfterSubmit: () =>
        set((state) => ({
          ...initialState(),
          anonId: state.anonId,
          authToken: state.authToken,
          manifestFingerprint: state.manifestFingerprint,
        })),
      resetAll: () => set(initialState()),
    }),
    {
      name: "fm_big5_attempt_v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        attemptId: state.attemptId,
        resumeToken: state.resumeToken,
        anonId: state.anonId,
        authToken: state.authToken,
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
