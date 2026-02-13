"use client";

import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { useStore } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createStore } from "zustand/vanilla";

export type QuizState = {
  slug: string;
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
  init: (slug: string, initialQuestionIds: string[]) => void;
  setAnswer: (questionId: string, optionId: string) => void;
  next: (total: number) => void;
  prev: () => void;
  jump: (index: number, total: number) => void;
  setAttemptMeta: (attemptId: string, scaleCode: string) => void;
  markSubmitted: () => void;
  resetAttempt: () => void;
  reset: (slug: string) => void;
};

const QUIZ_VERSION = 1;

const createEmptyState = (slug: string): QuizState => {
  const now = Date.now();
  return {
    slug,
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

export const createQuizStore = (slug: string) =>
  createStore<QuizStore>()(
    persist(
      (set, get) => ({
        version: QUIZ_VERSION,
        state: createEmptyState(slug),
        init: (nextSlug, initialQuestionIds) => {
          const { state } = get();

          if (state.slug !== nextSlug) {
            set({ state: touch(createEmptyState(nextSlug)) });
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
          set((store) => ({
            state: touch({
              ...store.state,
              attemptId,
              scaleCode,
              submittedAt: null,
            }),
          })),
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
              submittedAt: null,
            }),
          })),
        reset: (nextSlug) => set({ state: touch(createEmptyState(nextSlug)) }),
      }),
      {
        name: `fm_quiz_v1_${slug}`,
        version: QUIZ_VERSION,
        storage: createJSONStorage(() => localStorage),
        partialize: (store) => ({
          version: store.version,
          state: {
            ...store.state,
            currentIndex: store.state.currentIndex,
            answers: store.state.answers,
            startedAt: store.state.startedAt,
            attemptId: store.state.attemptId,
            scaleCode: store.state.scaleCode,
          },
        }),
      }
    )
  );

export type QuizStoreApi = ReturnType<typeof createQuizStore>;

const QuizStoreContext = createContext<QuizStoreApi | null>(null);

export function QuizStoreProvider({
  slug,
  initialQuestionIds,
  children,
}: {
  slug: string;
  initialQuestionIds: string[];
  children: ReactNode;
}) {
  const store = useMemo(() => createQuizStore(slug), [slug]);

  useEffect(() => {
    store.getState().init(slug, initialQuestionIds);
  }, [store, slug, initialQuestionIds]);

  return <QuizStoreContext.Provider value={store}>{children}</QuizStoreContext.Provider>;
}

export function useQuizStore<T>(selector: (store: QuizStore) => T) {
  const store = useContext(QuizStoreContext);
  if (!store) {
    throw new Error("useQuizStore must be used within QuizStoreProvider");
  }
  return useStore(store, selector);
}
