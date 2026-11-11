"use client";

import { useEffect, useState } from "react";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { loadTraditionalAssessmentText } from "@/lib/tests/traditionalAssessmentDisplay";

const identity = (text: string) => text;

export function useHistoryDisplayText(locale: DisplayLocale) {
  const [translate, setTranslate] = useState(() => identity);

  useEffect(() => {
    if (locale !== "zh-TW") return;
    let active = true;
    void loadTraditionalAssessmentText().then((convert) => {
      if (active) setTranslate(() => convert);
    }, () => {
      if (active) setTranslate(() => identity);
    });
    return () => { active = false; };
  }, [locale]);

  return locale === "zh-TW" ? translate : identity;
}
