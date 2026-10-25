import type { QuestionnaireProfile } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireReport({ profile, locale, headingLevel = 3, idPrefix = "report" }: { profile: QuestionnaireProfile; locale: Locale; headingLevel?: 2 | 3 | 4; idPrefix?: string }) {
  const Heading = headingLevel === 2 ? "h2" : headingLevel === 4 ? "h4" : "h3";
  return <article className="space-y-7 leading-8 [overflow-wrap:anywhere]">
    <p className="font-semibold">{profile.headline[locale]}</p>
    <p>{profile.summary[locale]}</p>
    <p className="rounded-lg bg-slate-50 p-4 text-sm leading-7">{profile.scoreReading[locale]}</p>
    {profile.sections.map(section => <section id={`${idPrefix}-${section.id}`} key={section.id} className="scroll-mt-24">
      <Heading className="mb-3 text-xl font-semibold">{section.title[locale]}</Heading>
      {section.paragraphs.length > 1 ? <ul className="list-disc space-y-3 pl-5">{section.paragraphs.map((line, index) => <li key={index}>{line[locale]}</li>)}</ul> : <p>{section.paragraphs[0]?.[locale]}</p>}
    </section>)}
  </article>;
}
