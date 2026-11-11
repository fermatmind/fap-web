"use client";

import { createContext, useContext } from "react";
import type { DisplayLocale } from "@/lib/i18n/locales";

const originalText = (source: string) => source;

export const EqDisplayContext = createContext<{
  locale: DisplayLocale;
  text: (source: string) => string;
}>({ locale: "en", text: originalText });

export function useEqDisplay() {
  const display = useContext(EqDisplayContext);
  return {
    ...display,
    copy: (source: string, taiwan: string) => display.locale === "zh-TW" ? taiwan : source,
  };
}
