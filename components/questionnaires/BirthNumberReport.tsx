import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { BIRTH_NUMBER_METHODS, BIRTH_NUMBER_SYMBOLS, isBirthNumberConfigurationValid, type BirthNumberProfile, type BirthNumberQuestionnaire, type BirthNumberResult, type BirthNumberReduction } from "@/lib/questionnaires/birthNumber";

type Complete = Extract<BirthNumberResult, { status: "complete" }>;

function Reduction({ reduction, locale }: { reduction: BirthNumberReduction; locale: Locale }) {
  return <div className="space-y-2">
    {reduction.steps.length ? <ol className="space-y-2">{reduction.steps.map((step, index) => <li key={index}><code className="[overflow-wrap:anywhere]">{step.digits.join(" + ")} = {step.sum}</code></li>)}</ol>
      : <p>{locale === "zh" ? "按本规则无需继续化简。" : "No further reduction under this rule."}</p>}
    <p>{locale === "zh" ? "停在" : "Stop at"} <strong>{reduction.value}</strong></p>
  </div>;
}

export function BirthNumberGuideBody({ profile, locale, headingLevel = 3, idPrefix = "birth-guide" }: {
  profile: BirthNumberProfile; locale: Locale; headingLevel?: 2 | 3 | 4; idPrefix?: string;
}) {
  const Heading = headingLevel === 2 ? "h2" : headingLevel === 4 ? "h4" : "h3";
  return <article data-birth-number-guide={profile.id} className="space-y-7 leading-8 [overflow-wrap:anywhere]">
    <p>{profile.summary[locale]}</p>
    <p className="rounded-lg bg-slate-50 p-4 text-sm leading-7">{profile.scoreReading[locale]}</p>
    {profile.sections.map(section => <section id={`${idPrefix}-${section.id}`} key={section.id} className="scroll-mt-24">
      <Heading className="mb-3 text-xl font-semibold">{section.title[locale]}</Heading>
      {section.paragraphs.map((paragraph, index) => <p className={index ? "mt-4" : undefined} key={index}>{paragraph[locale]}</p>)}
    </section>)}
  </article>;
}

export function BirthNumberAttribution({ quiz, locale }: { quiz: BirthNumberQuestionnaire; locale: Locale }) {
  return <aside data-birth-number-attribution className="my-6 rounded-lg border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-600">
    <p>{locale === "zh"
      ? "所选两种运算规则分别参照下列公开说明。十二个符号主题、情境与反思问题由费马独立撰写；运算能够复算，不表示生日能够测量人格、决定职业或预测未来。"
      : "The two selected calculation rules follow the public explanations below. FermatMind independently wrote the twelve symbolic motifs, scenes and reflection questions. Reproducible arithmetic does not establish that a birthday measures personality, determines a career or predicts the future."}</p>
    <ul className="mt-3 space-y-2">{quiz.references!.map(reference => <li key={reference.url}><a className="underline" href={reference.url} rel="noopener noreferrer">{reference.title[locale]}</a></li>)}</ul>
  </aside>;
}

export function BirthNumberReport({ quiz, results, locale }: { quiz: BirthNumberQuestionnaire; results: Complete[]; locale: Locale }) {
  const zh = locale === "zh";
  if (!isBirthNumberConfigurationValid(quiz) || !Array.isArray(results) || results.length < 1 || results.length > 2
    || !Array.from(results).every(result => result?.status === "complete" && BIRTH_NUMBER_METHODS.includes(result.method)
      && BIRTH_NUMBER_SYMBOLS.includes(result.number) && result.final?.value === result.number)
    || new Set(results.map(result => result.method)).size !== results.length) {
    return <p role="status">{zh ? "本次运算结果暂不可用，请重新计算。" : "This calculation is unavailable. Calculate again."}</p>;
  }
  const profiles = [...new Set(results.map(result => result.number))].map(number => quiz.profiles.find(profile => profile.symbol === number));
  if (profiles.some(profile => !profile)) return <p role="status">{zh ? "符号指南暂不可用。" : "The symbolic guide is unavailable."}</p>;
  const partLabels = zh ? { month: "月份", day: "日期", year: "年份" } : { month: "Month", day: "Day", year: "Year" };
  return <div data-birth-number-result className="mt-6 space-y-8">
    <div className="grid gap-5 sm:grid-cols-2">{results.map(result => <section key={result.method} data-birth-number-method={result.method} className="min-w-0 rounded-lg border border-slate-200 bg-white p-5 leading-8">
      <h3 className="text-xl font-semibold">{quiz.birthNumber.methods.find(method => method.id === result.method)!.label[locale]}</h3>
      <p className="my-4 text-2xl font-semibold">{zh ? "符号结果" : "Symbolic result"}: <span data-birth-number-value={result.method}>{result.number}</span></p>
      <div data-birth-number-trace className="space-y-5 text-sm leading-7">
        {result.method === "separate-parts" ? <>
          {result.parts.map(part => <div key={part.id}><h4 className="font-semibold">{partLabels[part.id]}: {part.reduction.initial}</h4><Reduction reduction={part.reduction} locale={locale} /></div>)}
          <div><h4 className="font-semibold">{zh ? "合计化简后的各部分" : "Combine the reduced parts"}</h4><p><code>{result.parts.map(part => part.reduction.value).join(" + ")} = {result.final.initial}</code></p></div>
        </> : <div><h4 className="font-semibold">{zh ? "先合计八个日期数字" : "Add the eight date digits first"}</h4><p><code className="[overflow-wrap:anywhere]">{result.initialDigits.join(" + ")} = {result.final.initial}</code></p></div>}
        <Reduction reduction={result.final} locale={locale} />
      </div>
    </section>)}</div>
    <p className="text-sm leading-7 text-slate-600">{zh ? "这些详细算式只显示在当前页面。复制功能不包含生日或算式。两法得到同一数字时，下方共用同一篇完整指南。" : "Detailed operations stay on this page. Copying omits the date and operations. When both rules reach the same number, they share one complete guide below."}</p>
    {profiles.map(profile => profile && <section key={profile.id} className="rounded-lg border border-violet-200 bg-white p-5 sm:p-7" aria-labelledby={`birth-reading-${profile.id}`}>
      <h3 id={`birth-reading-${profile.id}`} className="mb-5 text-2xl font-semibold">{profile.title[locale]}</h3>
      <BirthNumberGuideBody profile={profile} locale={locale} headingLevel={4} idPrefix={`birth-result-${profile.id}`} />
      <Link prefetch={false} className="mt-6 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这篇完整公开指南" : "Read this complete public guide"}</Link>
    </section>)}
  </div>;
}
