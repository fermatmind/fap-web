"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { loadTraditionalAssessmentText } from "@/lib/tests/traditionalAssessmentDisplay";

type Copy = (text: string) => string;
const CopyContext = createContext<Copy | null>(null);

export function TraditionalQuestionnaireCopy({ children }: { children: ReactNode }) {
  const [copy, setCopy] = useState<Copy | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    let current = true;
    void loadTraditionalAssessmentText().then(
      (translate) => { if (current) setCopy(() => translate); },
      () => { if (current) setUnavailable(true); },
    );
    return () => { current = false; };
  }, []);
  if (!copy) return <p role="status">{unavailable ? "題目暫時無法載入，請重新整理後再試。" : "正在準備題目…"}</p>;
  return <CopyContext.Provider value={copy}>{children}</CopyContext.Provider>;
}

const originalText: Copy = (text) => text;

export function useQuestionnaireDisplayCopy() {
  const copy = useContext(CopyContext);
  return { displayText: copy ?? originalText, traditional: copy !== null };
}
