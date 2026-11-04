import type { Metadata } from "next";
import type { ReactNode } from "react";
import type { Locale } from "@/lib/i18n/locales";
import { QuestionnaireTakeSession } from "./QuestionnaireTakeSession";

export function questionnaireTakeMetadata(title: string, landing: string): Metadata {
  return { title, description: title, robots: { index: false, follow: false, nocache: true }, alternates: { canonical: landing }, openGraph: { title, description: title, url: landing } };
}
export function QuestionnaireTakeDocument({ children, quiz, locale, landing, autoStart }: { children: ReactNode; quiz: { title: { en: string; zh: string }; minutes: number }; locale: Locale; landing: string; autoStart?: boolean }) {
  return <QuestionnaireTakeSession title={quiz.title[locale]} minutes={quiz.minutes} locale={locale} landing={landing} autoStart={autoStart}>{children}</QuestionnaireTakeSession>;
}
