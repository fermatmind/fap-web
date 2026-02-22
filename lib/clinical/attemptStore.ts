"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ClinicalScaleCode } from "@/lib/clinical/api";

export type ClinicalAttemptState = {
  slug: string;
  scaleCode: ClinicalScaleCode | null;
  attemptId: string | null;
  anonId: string | null;
  answers: Record<string, string>;
  questionOrder: string[];
  currentIndex: number;
  startedAt: number;
  consentAcceptedAt: string | null;
  consentVersion: string | null;
  consentLocale: string | null;
  seenModuleTransitions: string[];
  lastSubmittedAt: string | null;
};

type ClinicalAttemptActions = {
  initSession: (payload: { slug: string; scaleCode: ClinicalScaleCode; questionIds: string[] }) => void;
  hydrateAnonId: (anonId: string | null) => void;
  setAttemptId: (attemptId: string | null) => void;
  acceptConsent: (payload: { version?: string | null; locale?: string | null }) => void;
  setAnswer: (questionId: string, code: string) => void;
  setCurrentIndex: (next: number) => void;
  markModuleSeen: (moduleCode: string) => void;
  markSubmitted: () => void;
  resetAfterSubmit: () => void;
  resetAll: () => void;
};

export type ClinicalAttemptStore = ClinicalAttemptState & ClinicalAttemptActions;

function nowIso(): string {
  return new Date().toISOString();
}

function initialState(): ClinicalAttemptState {
  return {
    slug: "",
    scaleCode: null,
    attemptId: null,
    anonId: null,
    answers: {},
    questionOrder: [],
    currentIndex: 0,
    startedAt: Date.now(),
    consentAcceptedAt: null,
    consentVersion: null,
    consentLocale: null,
    seenModuleTransitions: [],
    lastSubmittedAt: null,
  };
}

function clampIndex(index: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(Math.max(index, 0), total - 1);
}

export const useClinicalAttemptStore = create<ClinicalAttemptStore>()(
  persist(
    (set) => ({
      ...initialState(),
      initSession: ({ slug, scaleCode, questionIds }) =>
        set((state) => {
          const isSameFlow = state.slug === slug && state.scaleCode === scaleCode;
          if (!isSameFlow) {
            return {
              ...initialState(),
              slug,
              scaleCode,
              questionOrder: questionIds,
              anonId: state.anonId,
            };
          }

          const allowedIds = new Set(questionIds);
          const filteredAnswers = Object.fromEntries(
            Object.entries(state.answers).filter(([questionId]) => allowedIds.has(questionId))
          ) as Record<string, string>;

          return {
            ...state,
            questionOrder: questionIds,
            answers: filteredAnswers,
            currentIndex: clampIndex(state.currentIndex, questionIds.length),
          };
        }),
      hydrateAnonId: (anonId) => set((state) => ({ ...state, anonId: anonId ?? state.anonId })),
      setAttemptId: (attemptId) =>
        set((state) => ({
          ...state,
          attemptId,
        })),
      acceptConsent: ({ version, locale }) =>
        set((state) => ({
          ...state,
          consentAcceptedAt: nowIso(),
          consentVersion: version ?? state.consentVersion,
          consentLocale: locale ?? state.consentLocale,
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
          currentIndex: clampIndex(next, state.questionOrder.length),
        })),
      markModuleSeen: (moduleCode) =>
        set((state) => {
          const key = moduleCode.trim().toUpperCase();
          if (!key) return state;
          if (state.seenModuleTransitions.includes(key)) return state;
          return {
            ...state,
            seenModuleTransitions: [...state.seenModuleTransitions, key],
          };
        }),
      markSubmitted: () => set((state) => ({ ...state, lastSubmittedAt: nowIso() })),
      resetAfterSubmit: () =>
        set((state) => ({
          ...initialState(),
          anonId: state.anonId,
        })),
      resetAll: () => set(initialState()),
    }),
    {
      name: "fm_clinical_attempt_v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        slug: state.slug,
        scaleCode: state.scaleCode,
        attemptId: state.attemptId,
        anonId: state.anonId,
        answers: state.answers,
        questionOrder: state.questionOrder,
        currentIndex: state.currentIndex,
        startedAt: state.startedAt,
        consentAcceptedAt: state.consentAcceptedAt,
        consentVersion: state.consentVersion,
        consentLocale: state.consentLocale,
        seenModuleTransitions: state.seenModuleTransitions,
        lastSubmittedAt: state.lastSubmittedAt,
      }),
    }
  )
);
