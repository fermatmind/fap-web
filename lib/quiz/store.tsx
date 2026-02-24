"use client";

import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { useStore } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import { queuePendingAnonLinkAttempt } from "@/lib/anon";

export type QuizState = {
  slug: string;
  anonId: string | null;
  currentIndex: number;
  answers: Record<string, string>;
  startedAt: number;
  attemptId: string | null;
  scaleCode: string | null;
  submittedAt: number | null;
  lastSavedAt: number;
};

export type QuizStore = {
  version: number;
  state: QuizState;
  init: (slug: string, initialQuestionIds: string[], anonId: string | null) => void;
  setAnswer: (questionId: string, optionId: string) => void;
  next: (total: number) => void;
  prev: () => void;
  jump: (index: number, total: number) => void;
  setAttemptMeta: (attemptId: string, scaleCode: string) => void;
  markSubmitted: () => void;
  resetAttempt: () => void;
  reset: (slug: string, anonId: string | null) => void;
};

const QUIZ_VERSION = 3;

function buildQuizPersistKey(slug: string, anonId: string | null): string {
  const normalizedAnonId = (anonId ?? "").trim() || "anon";
  return `fm_quiz_v3_${slug}_${normalizedAnonId}`;
}

function buildLegacyQuizKeys(slug: string): string[] {
  return [
    `fm_quiz_v2_${slug}`,
    `fm_quiz_v1_${slug}`,
  ];
}

function createQuizStorage(slug: string): StateStorage {
  return {
    getItem: (name) => {
      if (typeof window === "undefined") return null;

      try {
        const direct = window.localStorage.getItem(name);
        if (direct) return direct;

        for (const legacyKey of buildLegacyQuizKeys(slug)) {
          const legacyValue = window.localStorage.getItem(legacyKey);
          if (!legacyValue) continue;
          window.localStorage.setItem(name, legacyValue);
          return legacyValue;
        }
      } catch {
        return null;
      }

      return null;
    },
    setItem: (name, value) => {
      if (typeof window === "undefined") return;
      try {
        window.localStorage.setItem(name, value);
      } catch {
        // Ignore storage failures.
      }
    },
    removeItem: (name) => {
      if (typeof window === "undefined") return;
      try {
        window.localStorage.removeItem(name);
      } catch {
        // Ignore storage failures.
      }
    },
  };
}

const createEmptyState = (slug: string, anonId: string | null): QuizState => {
  const now = Date.now();
  return {
    slug,
    anonId,
    currentIndex: 0,
    answers: {},
    startedAt: now,
    attemptId: null,
    scaleCode: null,
    submittedAt: null,
    lastSavedAt: now,
  };
};

const clampIndex = (index: number, total: number) => {
  if (total <= 0) return 0;
  return Math.min(Math.max(index, 0), total - 1);
};

const touch = (state: QuizState): QuizState => ({
  ...state,
  lastSavedAt: Date.now(),
});

export const createQuizStore = ({
  slug,
  anonId,
}: {
  slug: string;
  anonId: string | null;
}) =>
  createStore<QuizStore>()(
    persist(
      (set, get) => ({
        version: QUIZ_VERSION,
        state: createEmptyState(slug, anonId),
        init: (nextSlug, initialQuestionIds, nextAnonId) => {
          const { state } = get();

          if (state.slug !== nextSlug || state.anonId !== nextAnonId) {
            set({ state: touch(createEmptyState(nextSlug, nextAnonId)) });
            return;
          }

          const allowedIds = new Set(initialQuestionIds);
          const filteredAnswers = Object.fromEntries(
            Object.entries(state.answers).filter(([questionId]) => allowedIds.has(questionId))
          ) as Record<string, string>;

          const total = initialQuestionIds.length;
          const nextIndex = clampIndex(state.currentIndex, total);
          const answersChanged =
            Object.keys(filteredAnswers).length !== Object.keys(state.answers).length;

          if (answersChanged || nextIndex !== state.currentIndex || state.startedAt === 0) {
            set({
              state: touch({
                ...state,
                answers: filteredAnswers,
                currentIndex: nextIndex,
                startedAt: state.startedAt || Date.now(),
              }),
            });
          }
        },
        setAnswer: (questionId, optionId) =>
          set((store) => ({
            state: touch({
              ...store.state,
              answers: { ...store.state.answers, [questionId]: optionId },
              submittedAt: null,
            }),
          })),
        next: (total) =>
          set((store) => ({
            state: touch({
              ...store.state,
              currentIndex: clampIndex(store.state.currentIndex + 1, total),
            }),
          })),
        prev: () =>
          set((store) => ({
            state: touch({
              ...store.state,
              currentIndex: Math.max(0, store.state.currentIndex - 1),
            }),
          })),
        jump: (index, total) =>
          set((store) => ({
            state: touch({
              ...store.state,
              currentIndex: clampIndex(index, total),
            }),
          })),
        setAttemptMeta: (attemptId, scaleCode) =>
          set((store) => {
            queuePendingAnonLinkAttempt(attemptId);
            return {
              state: touch({
                ...store.state,
                attemptId,
                scaleCode,
                submittedAt: null,
              }),
            };
          }),
        markSubmitted: () =>
          set((store) => ({
            state: touch({
              ...store.state,
              submittedAt: Date.now(),
            }),
          })),
        resetAttempt: () =>
          set((store) => ({
            state: touch({
              ...store.state,
              currentIndex: 0,
              answers: {},
              startedAt: Date.now(),
              attemptId: null,
              scaleCode: null,
              submittedAt: null,
            }),
          })),
        reset: (nextSlug, nextAnonId) => set({ state: touch(createEmptyState(nextSlug, nextAnonId)) }),
      }),
      {
        name: buildQuizPersistKey(slug, anonId),
        version: QUIZ_VERSION,
        storage: createJSONStorage(() => createQuizStorage(slug)),
        partialize: (store) => ({
          version: store.version,
          state: {
            ...store.state,
            currentIndex: store.state.currentIndex,
            answers: store.state.answers,
            startedAt: store.state.startedAt,
            attemptId: store.state.attemptId,
            scaleCode: store.state.scaleCode,
            anonId: store.state.anonId,
          },
        }),
      }
    )
  );

export type QuizStoreApi = ReturnType<typeof createQuizStore>;

const QuizStoreContext = createContext<QuizStoreApi | null>(null);

export function QuizStoreProvider({
  slug,
  anonId,
  initialQuestionIds,
  children,
}: {
  slug: string;
  anonId: string | null;
  initialQuestionIds: string[];
  children: ReactNode;
}) {
  const store = useMemo(() => createQuizStore({ slug, anonId }), [slug, anonId]);

  useEffect(() => {
    store.getState().init(slug, initialQuestionIds, anonId);
  }, [store, slug, initialQuestionIds, anonId]);

  return <QuizStoreContext.Provider value={store}>{children}</QuizStoreContext.Provider>;
}

export function useQuizStore<T>(selector: (store: QuizStore) => T) {
  const store = useContext(QuizStoreContext);
  if (!store) {
    throw new Error("useQuizStore must be used within QuizStoreProvider");
  }
  return useStore(store, selector);
}
