import { Fragment } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { ExploreTestIntro } from "@/components/tests/ExploreTestIntro";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { Bpi21Client } from "./Bpi21Client";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { bpi21Sections, bpi21Faq } from "./Bpi21LandingEditorial";
function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((part, i) => /^\[\d+\]$/.test(part) ? <sup key={i}><a className="ml-1 underline" href={`#bpi21-reference-${part.slice(1, -1)}`}>{part}</a></sup> : <Fragment key={i}>{part}</Fragment>)}</>;
}
export function Bpi21Page({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  const zh = locale === "zh", path = questionnairePath(locale, quiz.slug);
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale })} />
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1>
      <p className="mt-5 text-lg leading-8">{quiz.description[locale]}</p>
      <p className="explore-intro-meta">{zh ? "发表BPI-21 · 21项 · 约7分钟 · 三篇全文免费" : "Published BPI-21 · 21 items · about 7 minutes · three full guides free"}</p>
      <Bpi21Client key={`${quiz.slug}:${locale}`} quiz={quiz} locale={locale} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="bpi21-purpose"><h2 id="bpi21-purpose">{bpi21Sections[0].title[locale]}</h2>{bpi21Sections[0].paragraphs.map((p, i) => <p key={i}><Copy text={p[locale]} /></p>)}<p>{quiz.introduction[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="bpi21-methods"><h2 id="bpi21-methods">{zh ? "BPI-21读法：计数、研究与文化背景" : "Reading BPI-21: counts, research and cultural context"}</h2><div className="explore-reading-sections">{[...bpi21Sections.slice(1), ...quiz.guide].map(s => <section key={s.id} className="explore-reading-section" aria-labelledby={`bpi21-method-${s.id}`}><h3 id={`bpi21-method-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p, i) => <p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-10" aria-labelledby="bpi21-library"><h2 id="bpi21-library" className="text-2xl font-semibold">{zh ? "三篇完整公开Dosha文化指南" : "Three complete public dosha cultural guides"}</h2><p className="my-4 leading-8">{zh ? "三篇均可直接阅读，每篇八节，包含来源措辞、具体例子、计数算例、研究范围与可选反思；任一未评分或未作答，都能阅读相同全文。" : "Read all three eight-section guides for source wording, examples, arithmetic, evidence and optional reflection. The same full text remains available without answers or with any unscored response."}</p><ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{quiz.profiles.map(p => <li key={p.id} className="rounded-lg border bg-white p-4"><Link prefetch={false} className="inline-block min-h-11 py-2 text-lg font-semibold underline" href={questionnaireGuidePath(locale, quiz.slug, p.id)}>{p.title[locale]}</Link><p className="mt-2 leading-7">{p.summary[locale]}</p></li>)}</ul></section>
    {quiz.profiles.map(p => <section key={p.id} data-bpi21-full-guide={p.id} className="my-10 border-t border-slate-200 pt-7"><h2 className="mb-5 text-2xl font-semibold">{p.title[locale]}</h2><QuestionnaireReport profile={p} locale={locale} headingLevel={3} idPrefix={`bpi21-public-${p.id}`} /></section>)}
    <section className="my-10 space-y-5 leading-8" aria-labelledby="bpi21-faq"><h2 id="bpi21-faq" className="text-2xl font-semibold">{zh ? "BPI-21 Dosha话题自评常见问题" : "BPI-21 dosha reflection FAQ"}</h2>{[...quiz.faq, ...bpi21Faq].map((f, i) => <div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2"><Copy text={f.answer[locale]} /></p></div>)}</section>
    <section className="my-8" aria-labelledby="bpi21-references"><h2 id="bpi21-references" className="text-xl font-semibold">{zh ? "题项来源、许可与证据背景" : "Item source, licence and evidence context"}</h2><p className="my-4 leading-8">{zh ? "英文21题与63个映射选项来自Bhargav等，Wellcome Open Research，2026，第二版表2，DOI 10.12688/wellcomeopenres.25166.2，按CC BY 4.0使用。费马提供工作中译、未评分扩展、原创指南与数字呈现，未建立本地、跨语言或平台验证，不表示原作者背书。" : "The 21 English items and 63 mapped alternatives come from Bhargav et al., Wellcome Open Research, 2026, version 2, Table 2, DOI 10.12688/wellcomeopenres.25166.2, under CC BY 4.0. FermatMind provides the working Chinese, unscored extension, original guides and digital presentation without established local, cross-language or platform validation or author endorsement."}</p><ul className="mt-4 space-y-3">{quiz.references!.map((r, i) => <li key={r.url} id={`bpi21-reference-${i + 1}`}><a className="underline" href={r.url} rel="noopener noreferrer">{r.title[locale]}</a></li>)}</ul></section>
  </Container></main>;
}
