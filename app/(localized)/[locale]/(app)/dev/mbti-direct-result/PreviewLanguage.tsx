"use client";

import type { ReactNode } from "react";
import { TraditionalQuestionnaireCopy } from "@/components/questionnaires/TraditionalQuestionnaireCopy";
import type { DisplayLocale } from "@/lib/i18n/locales";

export function PreviewLanguage({ language, children }: { language: DisplayLocale; children: ReactNode }) {
  return language === "zh-TW"
    ? <TraditionalQuestionnaireCopy loadingText="正在準備繁體中文預覽…" failureText="繁體中文預覽暫時無法載入，請重新整理。">{children}</TraditionalQuestionnaireCopy>
    : children;
}
