import { ResultReadingNav } from "./QuestionnaireResultPresentation";
import content from "@/lib/questionnaires/result-content/career-match.json";
import type { Locale } from "@/lib/i18n/locales";

export function CareerMatchResultReading({ locale }: { locale: Locale }) {
  return <section data-career-match-result-reading className="min-w-0 space-y-6 border-t border-slate-200 pt-7 leading-8 [overflow-wrap:anywhere]" aria-labelledby="career-comparison-reading-title">
    <h3 id="career-comparison-reading-title" className="text-xl font-semibold">{content.title[locale]}</h3>
    <p>{content.intro[locale]}</p>
    <details className="rounded-lg bg-slate-50 p-4">
      <summary className="min-h-11 cursor-pointer py-2 font-semibold">{locale === "zh" ? "跳转到解读模块" : "Jump to a reading section"}</summary>
      <ResultReadingNav label={locale === "zh" ? "职业比较解读目录" : "Career comparison reading contents"} sections={content.sections.map(section => ({ id: `career-comparison-reading-${section.id}`, title: section.title[locale] }))} />
    </details>
    {content.sections.map(section => <section key={section.id} data-career-match-reading-section={section.id} aria-labelledby={`career-comparison-reading-${section.id}`} className="space-y-3">
      <h4 id={`career-comparison-reading-${section.id}`} className="scroll-mt-24 text-lg font-semibold">{section.title[locale]}</h4>
      <ul className="list-disc space-y-3 pl-5">{section.paragraphs.map((paragraph, index) => <li key={index}>{paragraph[locale]}</li>)}</ul>
    </section>)}
    <p data-career-match-reading-scope className="border-l-2 border-slate-300 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-700">{content.scope[locale]}</p>
    <a className="inline-block min-h-11 py-2 underline" href="https://www.onetonline.org/find/descriptor/browse/1.B.1/">{locale === "zh" ? "O*NET：兴趣类型官方说明" : "O*NET: official interest-type descriptions"}</a>
  </section>;
}
