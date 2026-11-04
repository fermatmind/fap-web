"use client";
import { createContext, useContext, type ReactNode } from "react";
export const QuestionnaireTakeContext = createContext(false);
export const useQuestionnaireTake = () => useContext(QuestionnaireTakeContext);

/** Legacy embedded engines retain compatibility; standalone sessions omit these controls. */
export function QuestionnaireLegacyControl({ children }: { children: ReactNode }) {
  return useQuestionnaireTake() ? null : children;
}
