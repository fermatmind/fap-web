"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const DEMO_QUESTION_TOTAL = 5;
const SESSION_TEST_KEY = "fap_quiz_session_test";

export const QUIZ_PERSIST_KEY = "fap_quiz_state";
export const QUIZ_DEMO_TOTAL_QUESTIONS = DEMO_QUESTION_TOTAL;

export type QuizState = {
  answers: Record<string, string>;
  currentStep: number;
  isFinished: boolean;
};

export type QuizActions = {
  startTest: (testId: string) => void;
  setAnswer: (qId: string, oId: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
};

type QuizStore = QuizState & QuizActions;

const initialState: QuizState = {
  answers: {},
  currentStep: 0,
  isFinished: false,
};

const readSessionTestId = () => {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(SESSION_TEST_KEY);
};

const writeSessionTestId = (testId: string) => {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(SESSION_TEST_KEY, testId);
};

export const useQuizStore = create<QuizStore>()(
  persist(
    (set) => ({
      ...initialState,
      startTest: (testId) => {
        const previousTestId = readSessionTestId();
        if (previousTestId && previousTestId !== testId) {
          set({ ...initialState });
        }
        writeSessionTestId(testId);
      },
      setAnswer: (qId, oId) =>
        set((state) => ({
          ...state,
          answers: {
            ...state.answers,
            [qId]: oId,
          },
          isFinished: false,
        })),
      nextStep: () =>
        set((state) => {
          if (state.isFinished) return state;

          const isLastStep = state.currentStep >= DEMO_QUESTION_TOTAL - 1;
          if (isLastStep) {
            return {
              ...state,
              isFinished: true,
            };
          }

          return {
            ...state,
            currentStep: state.currentStep + 1,
          };
        }),
      prevStep: () =>
        set((state) => ({
          ...state,
          currentStep: Math.max(0, state.currentStep - 1),
          isFinished: false,
        })),
      reset: () => set({ ...initialState }),
    }),
    {
      name: QUIZ_PERSIST_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        answers: state.answers,
        currentStep: state.currentStep,
        isFinished: state.isFinished,
      }),
    }
  )
);

