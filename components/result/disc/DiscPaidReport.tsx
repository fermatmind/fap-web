"use client";

import { useEffect, useState } from "react";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";
import type { QuestionnaireProfile } from "@/lib/questionnaires/types";
import { QuestionnaireResultReading } from "@/components/questionnaires/QuestionnaireResultReading";
import { loadTraditionalAssessmentText } from "@/lib/tests/traditionalAssessmentDisplay";

type DiscReport = { counts: Record<string, number>; profile: QuestionnaireProfile };
function traditionalProfile(profile: QuestionnaireProfile, copy: (text: string) => string): QuestionnaireProfile {
  const text = (value: {zh: string; en: string}) => ({ ...value, zh: copy(value.zh) });
  return { ...profile, title: text(profile.title), headline: text(profile.headline), summary: text(profile.summary),
    sections: profile.sections.map(section => ({ ...section, title: text(section.title), paragraphs: section.paragraphs.map(text) })),
    ...(profile.resultReading ? {resultReading: {...profile.resultReading,
      ...(profile.resultReading.note ? {note: text(profile.resultReading.note)} : {}),
      ...(profile.resultReading.references ? {references: profile.resultReading.references.map(ref => ({...ref, title: text(ref.title)}))} : {}),
    }} : {}) };
}
export function DiscPaidReport({ payload, locale, displayLocale }: { payload: unknown; locale: Locale; displayLocale: DisplayLocale }) {
  const report = payload as DiscReport | undefined;
  const [translated, setTranslated] = useState<QuestionnaireProfile | null>(null);
  useEffect(() => {
    let active = true;
    if (displayLocale === "zh-TW" && report?.profile) void loadTraditionalAssessmentText().then(copy => {
      if (active) setTranslated(traditionalProfile(report.profile, copy));
    });
    return () => { active = false; };
  }, [displayLocale, report?.profile]);
  const profile = displayLocale === "zh-TW" ? translated : report?.profile;
  if (!profile || !report?.counts) return <p role="status">{displayLocale === "zh-TW" ? "正在載入報告…" : locale === "zh" ? "正在加载报告…" : "Loading report…"}</p>;
  return <article className="mx-auto max-w-3xl space-y-6 rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 sm:p-8">
    <h1 className="text-3xl font-semibold">{profile.title[locale]}</h1>
    <dl className="grid grid-cols-2 gap-3">{Object.entries(report.counts).map(([id, count]) => <div key={id}><dt>{id}</dt><dd>{count}</dd></div>)}</dl>
    <QuestionnaireResultReading quizSlug="disc" profile={profile} locale={locale} traditional={displayLocale === "zh-TW"} headingLevel={2} mode="result" />
    <button type="button" onClick={() => window.print()} className="rounded-full border border-slate-300 px-5 py-3 font-semibold">{displayLocale === "zh-TW" ? "列印或儲存 PDF" : locale === "zh" ? "打印或保存 PDF" : "Print or save PDF"}</button>
  </article>;
}
