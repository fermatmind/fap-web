import type { QuestionnaireProfile } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";
import { QuestionnaireReport } from "./QuestionnaireReport";

export function QuestionnaireResultReading({ quizSlug, profile, locale, headingLevel = 3, idPrefix = "report" }: { quizSlug: string; profile: QuestionnaireProfile; locale: Locale; headingLevel?: 2 | 3 | 4; idPrefix?: string }) {
  const candidate = profile.resultReading;
  const reading = candidate?.quizSlug === quizSlug && candidate.profileId === profile.id ? candidate : null;
  if (!reading) return <QuestionnaireReport profile={profile} locale={locale} headingLevel={headingLevel} idPrefix={idPrefix} />;
  return <div {...{ [`data-${reading.attribute}-result-reading`]: profile.id }}>
    <details className="mb-6 rounded-lg bg-slate-50 p-4">
      <summary className="min-h-11 cursor-pointer py-2 font-semibold">{locale === "zh" ? "跳转到解读模块" : "Jump to a reading section"}</summary>
      <nav aria-label={locale === "zh" ? "结果解读目录" : "Result reading contents"} className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm leading-7">
        {profile.sections.map(section => <a key={section.id} className="min-h-11 py-2 underline" href={`#${idPrefix}-${section.id}`}>{section.title[locale]}</a>)}
      </nav>
    </details>
    <QuestionnaireReport profile={profile} locale={locale} headingLevel={headingLevel} idPrefix={idPrefix} />
    {reading.note && <p className="mt-5 text-sm leading-7">{reading.note[locale]}</p>}
    {reading.references && <ul className="mt-6 space-y-2 text-sm leading-7">{reading.references.map(reference => <li key={reference.url}><a className="underline" href={reference.url}>{reference.title[locale]}</a></li>)}</ul>}
  </div>;
}
