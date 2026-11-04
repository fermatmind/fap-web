import { QuestionnaireTakeEntry } from "./QuestionnaireTakeEntry";
import { dataEntryLandingSections, dataEntryLandingFaq, dataEntryLandingReferences } from "./DataEntryLandingEditorial";
import { DiscCitations } from "./DiscLandingEditorial";
import { ExploreTestIntro } from "@/components/tests/ExploreTestIntro";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";
import { DataEntryClient } from "./DataEntryClient";

export function DataEntryPage({ quiz, locale , take = false }: { quiz: Questionnaire; locale: Locale ; take?: boolean }) {
  const zh = locale === "zh", path = questionnairePath(locale, quiz.slug);
  const references = [...(quiz.references ?? []), ...dataEntryLandingReferences];
  const renderCopy = (text: string) => <DiscCitations text={text} locale={locale} referencePrefix="data-entry" />;
  const engine = <DataEntryClient quiz={quiz} locale={locale} />;
  if (take) return engine;
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale })} />
    <ExploreTestIntro slug={quiz.slug} locale={locale}>

    <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1>
    <p className="mt-5 text-lg leading-8 text-slate-700">{quiz.description[locale]}</p>
    <div className="explore-intro-meta"><span>{zh ? "两种虚构记录模式 · 每轮60秒 · 无需注册 · 允许返回改错" : "Two fictional record modes · 60 seconds per round · No signup · Return and correct within the clock"}</span><span>{zh ? "原创结构化录入 · 真实计时与完整指南免费" : "Original structured entry · Real timing and complete guides, free"}</span></div>
    <QuestionnaireTakeEntry quiz={quiz} locale={locale} />
    </ExploreTestIntro>

    <section className="my-8 space-y-4 leading-8" aria-labelledby="data-entry-purpose"><h2 id="data-entry-purpose" className="text-2xl font-semibold">{zh ? "数据录入练习：两种记录格式与独立指标" : "Data entry practice: two record formats and separate measures"}</h2><p>{quiz.introduction[locale]}</p><p>{quiz.instructions![locale]}</p></section>
    {quiz.guide.map(section => <section key={section.id} className="my-8 space-y-4 leading-8" aria-labelledby={`data-entry-source-${section.id}`}><h2 id={`data-entry-source-${section.id}`} className="text-2xl font-semibold">{section.title[locale]}</h2>{section.paragraphs.map((paragraph, index) => <p key={index}>{paragraph[locale]}</p>)}</section>)}
    <section className="explore-reading-library" aria-labelledby="data-entry-reading"><h2 id="data-entry-reading" className="text-2xl font-semibold">{zh ? "数据录入方法与结果读法：字段、字符与计时条件" : "Data entry methods and results: fields, characters and timing"}</h2><div className="explore-reading-sections">{dataEntryLandingSections.map(section => <section key={section.id} className="explore-reading-section"><h3>{section.title[locale]}</h3><div>{section.paragraphs.map((p,i)=><p key={i}>{renderCopy(p[locale])}</p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="data-entry-public-guides"><h2 id="data-entry-public-guides" className="text-2xl font-semibold">{zh ? "两份完整公开复习指南" : "Both complete public revision guides"}</h2><p className="my-4 leading-8 text-slate-600">{zh ? "物品标签与发运表单各有完整计时、字段准确率、字符KPH、算例、改错和设备说明。可开始前读，任何速度均给全部内容；它们是记录模式指南，不是成绩档位或私人录入记录。" : "Asset labels and dispatch forms each have full timing, field accuracy, character-KPH, worked examples, correction and device notes. Read before starting; every speed gets all content. These are record-mode guides, not score bands or private entry records."}</p><ul className="space-y-4">{quiz.profiles.map(profile => <li key={profile.id} className="rounded-lg border border-slate-200 bg-white p-5"><Link prefetch={false} className="text-lg font-semibold underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{profile.title[locale]}</Link><p className="mt-3 leading-7">{profile.summary[locale]}</p></li>)}</ul></section>
    <section className="my-8 space-y-5" aria-labelledby="data-entry-faq"><h2 id="data-entry-faq" className="text-2xl font-semibold">{zh ? "数据录入测试常见问题" : "Data Entry Test FAQ"}</h2>{[...quiz.faq, ...dataEntryLandingFaq].map((item, index) => <div key={index}><h3 className="font-semibold">{item.question[locale]}</h3><p className="mt-2 leading-8">{item.answer[locale]}</p></div>)}</section>
    <section className="my-8" aria-labelledby="data-entry-references"><h2 id="data-entry-references" className="text-2xl font-semibold">{zh ? "参考文献与计量方法" : "References and measurement methods"}</h2><ul className="mt-4 space-y-3">{references.map((reference,index) => reference.url.includes("criteriacorp.com") ? null : <li key={reference.url} id={`data-entry-reference-${index+1}`}><a href={reference.url} className="underline" rel="noopener noreferrer">[{index+1}] {reference.title[locale]}</a></li>)}</ul></section>
  </Container></main>;
}
