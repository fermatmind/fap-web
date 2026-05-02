"use client";

import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { useStore } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import { queuePendingAnonLinkAttempt } from "@/lib/anon";

export type QuizState = {
  slug: string;
  anonId: string | null;
  formCode: string | null;
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
  init: (slug: string, initialQuestionIds: string[], anonId: string | null, formCode: string | null) => void;
  setAnswer: (questionId: string, optionId: string) => void;
  next: (total: number) => void;
  prev: () => void;
  jump: (index: number, total: number) => void;
  setAttemptMeta: (attemptId: string, scaleCode: string, formCode: string | null) => void;
  markSubmitted: () => void;
  clearAttemptMeta: () => void;
  resetAttempt: () => void;
  reset: (slug: string, anonId: string | null, formCode: string | null) => void;
};

const QUIZ_VERSION = 4;
export const QUIZ_DRAFT_TTL_MS = 24 * 60 * 60 * 1000;

function buildQuizPersistKey(slug: string, anonId: string | null, formCode: string | null): string {
  const normalizedAnonId = (anonId ?? "").trim() || "anon";
  const normalizedFormCode = (formCode ?? "").trim() || "default";
  return `fm_quiz_v4_${slug}_${normalizedAnonId}_${normalizedFormCode}`;
}

function buildLegacyQuizKeys(slug: string, anonId: string | null): string[] {
  const normalizedAnonId = (anonId ?? "").trim() || "anon";
  return [
    `fm_quiz_v3_${slug}_${normalizedAnonId}`,
    `fm_quiz_v2_${slug}`,
    `fm_quiz_v1_${slug}`,
  ];
}

function extractPersistedQuizState(raw: string): Partial<QuizState> | null {
  try {
    let candidate: unknown = JSON.parse(raw);

    for (let depth = 0; depth < 3; depth += 1) {
      if (!candidate || typeof candidate !== "object") {
        break;
      }
      const node = candidate as { state?: unknown };
      if (!node.state || typeof node.state !== "object") {
        break;
      }
      candidate = node.state;
    }

    if (!candidate || typeof candidate !== "object") {
      return null;
    }

    return candidate as Partial<QuizState>;
  } catch {
    return null;
  }
}

function isFiniteTimestamp(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function isUsablePersistedQuizDraft(raw: string, now = Date.now()): boolean {
  const persistedQuizState = extractPersistedQuizState(raw);

  if (!persistedQuizState) {
    return false;
  }

  if (isFiniteTimestamp(persistedQuizState.submittedAt)) {
    return false;
  }

  const savedAt = isFiniteTimestamp(persistedQuizState.lastSavedAt)
    ? persistedQuizState.lastSavedAt
    : persistedQuizState.startedAt;

  return isFiniteTimestamp(savedAt) && now - savedAt <= QUIZ_DRAFT_TTL_MS;
}

function upgradeLegacyQuizEnvelope(raw: string, formCode: string | null): string {
  const persistedQuizState = extractPersistedQuizState(raw);

  if (!persistedQuizState) {
    return raw;
  }

  return JSON.stringify({
    state: {
      version: QUIZ_VERSION,
      state: {
        ...persistedQuizState,
        formCode: persistedQuizState.formCode ?? formCode,
      },
    },
    version: QUIZ_VERSION,
  });
}

function createQuizStorage(slug: string, anonId: string | null, formCode: string | null): StateStorage {
  return {
    getItem: (name) => {
      if (typeof window === "undefined") return null;

      try {
        const direct = window.localStorage.getItem(name);
        if (direct) {
          if (isUsablePersistedQuizDraft(direct)) {
            return direct;
          }
          window.localStorage.removeItem(name);
        }

        for (const legacyKey of buildLegacyQuizKeys(slug, anonId)) {
          const legacyValue = window.localStorage.getItem(legacyKey);
          if (!legacyValue) continue;
          if (!isUsablePersistedQuizDraft(legacyValue)) {
            window.localStorage.removeItem(legacyKey);
            continue;
          }
          const upgradedValue = upgradeLegacyQuizEnvelope(legacyValue, formCode);
          window.localStorage.setItem(name, upgradedValue);
          return upgradedValue;
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

const createEmptyState = (slug: string, anonId: string | null, formCode: string | null): QuizState => {
  const now = Date.now();
  return {
    slug,
    anonId,
    formCode,
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
  formCode,
}: {
  slug: string;
  anonId: string | null;
  formCode: string | null;
}) =>
  createStore<QuizStore>()(
    persist(
      (set, get) => ({
        version: QUIZ_VERSION,
        state: createEmptyState(slug, anonId, formCode),
        init: (nextSlug, initialQuestionIds, nextAnonId, nextFormCode) => {
          const { state } = get();
          const canAdoptLegacyMbti144Form =
            state.slug === nextSlug
            && state.anonId === nextAnonId
            && state.formCode === null
            && nextFormCode === "mbti_144";

          if (
            state.slug !== nextSlug
            || state.anonId !== nextAnonId
            || (!canAdoptLegacyMbti144Form && state.formCode !== nextFormCode)
          ) {
            set({ state: touch(createEmptyState(nextSlug, nextAnonId, nextFormCode)) });
            return;
          }

          const nextState = canAdoptLegacyMbti144Form
            ? {
                ...state,
                formCode: nextFormCode,
              }
            : state;

          const allowedIds = new Set(initialQuestionIds);
          const filteredAnswers = Object.fromEntries(
            Object.entries(nextState.answers).filter(([questionId]) => allowedIds.has(questionId))
          ) as Record<string, string>;

          const total = initialQuestionIds.length;
          const nextIndex = clampIndex(nextState.currentIndex, total);
          const answersChanged =
            Object.keys(filteredAnswers).length !== Object.keys(nextState.answers).length;

          if (answersChanged || nextIndex !== nextState.currentIndex || nextState.startedAt === 0 || canAdoptLegacyMbti144Form) {
            set({
              state: touch({
                ...nextState,
                answers: filteredAnswers,
                currentIndex: nextIndex,
                startedAt: nextState.startedAt || Date.now(),
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
        setAttemptMeta: (attemptId, scaleCode, nextFormCode) =>
          set((store) => {
            queuePendingAnonLinkAttempt(attemptId);
            return {
              state: touch({
                ...store.state,
                attemptId,
                scaleCode,
                formCode: nextFormCode,
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
        clearAttemptMeta: () =>
          set((store) => ({
            state: touch({
              ...store.state,
              attemptId: null,
              scaleCode: null,
              submittedAt: null,
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
              formCode: store.state.formCode,
              submittedAt: null,
            }),
          })),
        reset: (nextSlug, nextAnonId, nextFormCode) => set({
          state: touch(createEmptyState(nextSlug, nextAnonId, nextFormCode)),
        }),
      }),
      {
        name: buildQuizPersistKey(slug, anonId, formCode),
        version: QUIZ_VERSION,
        storage: createJSONStorage(() => createQuizStorage(slug, anonId, formCode)),
        migrate: (persistedState) => {
          const envelope = persistedState as {
            state?: Partial<QuizState>;
          } | null;
          const persistedQuizState = envelope?.state ?? {};

          return {
            version: QUIZ_VERSION,
            state: {
              ...createEmptyState(slug, anonId, formCode),
              ...persistedQuizState,
              formCode: persistedQuizState.formCode ?? formCode,
            },
          };
        },
        partialize: (store) => ({
          version: store.version,
          state: {
            ...store.state,
            currentIndex: store.state.currentIndex,
            answers: store.state.submittedAt ? {} : store.state.answers,
            startedAt: store.state.startedAt,
            attemptId: store.state.submittedAt ? null : store.state.attemptId,
            scaleCode: store.state.submittedAt ? null : store.state.scaleCode,
            formCode: store.state.formCode,
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
  formCode,
  initialQuestionIds,
  children,
}: {
  slug: string;
  anonId: string | null;
  formCode: string | null;
  initialQuestionIds: string[];
  children: ReactNode;
}) {
  const store = useMemo(() => createQuizStore({ slug, anonId, formCode }), [slug, anonId, formCode]);

  useEffect(() => {
    store.getState().init(slug, initialQuestionIds, anonId, formCode);
  }, [store, slug, initialQuestionIds, anonId, formCode]);

  return <QuizStoreContext.Provider value={store}>{children}</QuizStoreContext.Provider>;
}

export function useQuizStore<T>(selector: (store: QuizStore) => T) {
  const store = useContext(QuizStoreContext);
  if (!store) {
    throw new Error("useQuizStore must be used within QuizStoreProvider");
  }
  return useStore(store, selector);
}
