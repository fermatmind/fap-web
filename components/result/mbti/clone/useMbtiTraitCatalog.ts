"use client";

import { useEffect, useState } from "react";
import { fetchMbtiTraitCatalog, type MbtiTraitCatalog } from "@/lib/cms/mbti-trait-explanations";
import type { Locale } from "@/lib/i18n/locales";

export function useMbtiTraitCatalog(locale: Locale) {
  const [state, setState] = useState<{ content: MbtiTraitCatalog | null } | null>(null);
  useEffect(() => {
    if (locale !== "zh") return;
    const controller = new AbortController();
    let active = true;
    fetchMbtiTraitCatalog(controller.signal)
      .then((content) => { if (active) setState({ content }); })
      .catch(() => { if (active) setState({ content: null }); });
    return () => { active = false; controller.abort(); };
  }, [locale]);
  return {
    content: locale === "zh" ? state?.content ?? null : null,
    pending: locale === "zh" && state === null,
    unavailable: locale === "zh" && state !== null && state.content === null,
  };
}
