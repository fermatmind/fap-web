"use client";

import { useEffect, useState } from "react";
import { fetchPersonalityResultIntroduction, type PersonalityResultIntroduction } from "@/lib/cms/personality-result-introduction";
import type { Locale } from "@/lib/i18n/locales";

type IntroductionState = {
  key: string;
  content: PersonalityResultIntroduction | null;
};

export function useMbtiResultIntroduction(fullCode: string, locale: Locale) {
  const key = `${locale}:${fullCode}`;
  const [state, setState] = useState<IntroductionState | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    fetchPersonalityResultIntroduction(fullCode, locale, controller.signal)
      .then((content) => { if (active) setState({ key, content }); })
      .catch(() => { if (active) setState({ key, content: null }); });
    return () => { active = false; controller.abort(); };
  }, [fullCode, locale, key]);
  // A type/locale change must never expose a previous person's introduction,
  // even for the render before the next effect or after a late response.
  const current = state?.key === key ? state : null;
  return {
    content: current?.content ?? null,
    pending: current === null,
    unavailable: current !== null && current.content === null,
  };
}
