"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { createStore } from "zustand/vanilla";
import { useStore } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type QuizState = {
  slug: string;
  currentIndex: number;
  answers: Record<string, string>;
  drafts: Record<string, string>;
  startedAt: number;
  lastSavedAt: number;
};

export type QuizStore = {
  version: number;
  state: QuizState;
  init: (slug: string, initialQuestionIds: string[]) => void;
  setAnswer: (questionId: string, optionId: string) => void;
  setDraft: (questionId: string, text: string) => void;
  next: (total: number) => void;
  prev: () => void;
  jump: (index: number, total: number) => void;
  reset: (slug: string) => void;
};

const QUIZ_VERSION = 1;

const createEmptyState = (slug: string): QuizState => {
  const now = Date.now();
  return {
    slug,
    currentIndex: 0,
    answers: {},
    drafts: {},
    startedAt: now,
    lastSavedAt: now
  };
};

const clampIndex = (index: number, total: number) => {
  if (total <= 0) return 0;
  return Math.min(Math.max(index, 0), total - 1);
};

const touch = (state: QuizState): QuizState => ({
  ...state,
  lastSavedAt: Date.now()
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

          const total = initialQuestionIds.length;
          const nextIndex = clampIndex(state.currentIndex, total);
          if (nextIndex !== state.currentIndex || state.startedAt === 0) {
            set({
              state: touch({
                ...state,
                currentIndex: nextIndex,
                startedAt: state.startedAt || Date.now()
              })
            });
          }
        },
        setAnswer: (questionId, optionId) =>
          set((store) => ({
            state: touch({
              ...store.state,
              answers: { ...store.state.answers, [questionId]: optionId }
            })
          })),
        setDraft: (questionId, text) =>
          set((store) => ({
            state: touch({
              ...store.state,
              drafts: { ...store.state.drafts, [questionId]: text }
            })
          })),
        next: (total) =>
          set((store) => ({
            state: touch({
              ...store.state,
              currentIndex: clampIndex(store.state.currentIndex + 1, total)
            })
          })),
        prev: () =>
          set((store) => ({
            state: touch({
              ...store.state,
              currentIndex: Math.max(0, store.state.currentIndex - 1)
            })
          })),
        jump: (index, total) =>
          set((store) => ({
            state: touch({
              ...store.state,
              currentIndex: clampIndex(index, total)
            })
          })),
        reset: (nextSlug) => set({ state: touch(createEmptyState(nextSlug)) })
      }),
      {
        name: `fm_quiz_v1_${slug}`,
        version: QUIZ_VERSION,
        storage: createJSONStorage(() => localStorage),
        partialize: (store) => ({ version: store.version, state: store.state }),
        skipHydration: true
      }
    )
  );

export type QuizStoreApi = ReturnType<typeof createQuizStore>;

const QuizStoreContext = createContext<QuizStoreApi | null>(null);

export function QuizStoreProvider({
  slug,
  initialQuestionIds,
  children
}: {
  slug: string;
  initialQuestionIds: string[];
  children: ReactNode;
}) {
  const store = useMemo(() => createQuizStore(slug), [slug]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    const finish = () => {
      store.getState().init(slug, initialQuestionIds);
      if (active) setReady(true);
    };

    setReady(false);

    if (store.persist.hasHydrated()) {
      finish();
      return;
    }

    const unsubscribe = store.persist.onFinishHydration(() => {
      finish();
    });

    store.persist.rehydrate();

    return () => {
      active = false;
      unsubscribe();
    };
  }, [store, slug, initialQuestionIds]);

  return (
    <QuizStoreContext.Provider value={store}>
      {ready ? (
        children
      ) : (
        <div
          style={{
            minHeight: 520,
            padding: 24,
            border: "1px solid #e2e2e2",
            borderRadius: 16,
            background: "#fff"
          }}
        >
          Loading saved progress...
        </div>
      )}
    </QuizStoreContext.Provider>
  );
}

export function useQuizStore<T>(selector: (store: QuizStore) => T) {
  const store = useContext(QuizStoreContext);
  if (!store) {
    throw new Error("useQuizStore must be used within QuizStoreProvider");
  }
  return useStore(store, selector);
}
