"use client";
import { createContext, useContext } from "react";
export const QuestionnaireTakeContext = createContext(false);
export const useQuestionnaireTake = () => useContext(QuestionnaireTakeContext);
