import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";
import { DataEntryClient } from "./DataEntryClient";

export function DataEntryPage({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  const zh = locale === "zh", path = questionnairePath(locale, quiz.slug);
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale })} />
    <nav aria-label={zh ? "面包屑" : "Breadcrumb"} className="mb-6 text-sm"><Link prefetch={false} className="underline" href={`/${locale}/tests#more-tests`}>{zh ? "全部测试与练习" : "All tests and practice"}</Link></nav>
    <p className="text-sm font-semibold text-violet-800">{zh ? "原创结构化录入 · 真实计时与完整指南免费" : "Original structured entry · Real timing and complete guides, free"}</p>
    <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1>
    <p className="mt-5 text-lg leading-8 text-slate-700">{quiz.description[locale]}</p>
    <p className="mt-3 text-sm leading-7 text-slate-600">{zh ? "两种虚构记录模式 · 每轮60秒 · 无需注册 · 允许返回改错" : "Two fictional record modes · 60 seconds per round · No signup · Return and correct within the clock"}</p>
    <DataEntryClient quiz={quiz} locale={locale} />
    <section className="my-8 space-y-4 leading-8" aria-labelledby="data-entry-purpose"><h2 id="data-entry-purpose" className="text-2xl font-semibold">{zh ? "怎样使用本轮结果？" : "How should you use this round’s result?"}</h2><p>{quiz.introduction[locale]}</p><p>{quiz.instructions![locale]}</p></section>
    {quiz.guide.map(section => <section key={section.id} className="my-8 space-y-4 leading-8" aria-labelledby={`data-entry-source-${section.id}`}><h2 id={`data-entry-source-${section.id}`} className="text-2xl font-semibold">{section.title[locale]}</h2>{section.paragraphs.map((paragraph, index) => <p key={index}>{paragraph[locale]}</p>)}</section>)}
    <section className="my-8" aria-labelledby="data-entry-public-guides"><h2 id="data-entry-public-guides" className="text-2xl font-semibold">{zh ? "两份完整公开复习指南" : "Both complete public revision guides"}</h2><p className="my-4 leading-8 text-slate-600">{zh ? "物品标签与发运表单各有完整计时、字段准确率、字符KPH、算例、改错和设备说明。可开始前读，任何速度均给全部内容；它们是记录模式指南，不是成绩档位或私人录入记录。" : "Asset labels and dispatch forms each have full timing, field accuracy, character-KPH, worked examples, correction and device notes. Read before starting; every speed gets all content. These are record-mode guides, not score bands or private entry records."}</p><ul className="space-y-4">{quiz.profiles.map(profile => <li key={profile.id} className="rounded-lg border border-slate-200 bg-white p-5"><Link prefetch={false} className="text-lg font-semibold underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{profile.title[locale]}</Link><p className="mt-3 leading-7">{profile.summary[locale]}</p></li>)}</ul></section>
    <section className="my-8 space-y-5" aria-labelledby="data-entry-faq"><h2 id="data-entry-faq" className="text-2xl font-semibold">{zh ? "常见问题" : "Frequently asked questions"}</h2>{quiz.faq.map((item, index) => <div key={index}><h3 className="font-semibold">{item.question[locale]}</h3><p className="mt-2 leading-8">{item.answer[locale]}</p></div>)}</section>
    {quiz.references && <section className="my-8" aria-labelledby="data-entry-references"><h2 id="data-entry-references" className="text-2xl font-semibold">{zh ? "任务背景与浏览器接口参考" : "Task context and browser API references"}</h2><ul className="mt-4 space-y-3">{quiz.references.map(reference => <li key={reference.url}><a href={reference.url} className="underline" rel="noopener noreferrer">{reference.title[locale]}</a></li>)}</ul><p className="mt-4 text-sm leading-7 text-slate-600">{zh ? "参考页解释各自任务、产品或浏览器行为，不验证本站记录、训练效果或招聘用途。本站按最终已提交字段精确匹配，字符KPH不是物理按键数，不把速度乘字段准确率转换等级。记录与指南均为本版原创。" : "References describe their own tasks, products or browser behaviour, without validating this record bank, training outcomes or hiring use. FermatMind compares final committed fields exactly. Character KPH is not physical keystrokes, and speed multiplied by field accuracy is not converted to a band. Records and guides are original to this edition."}</p></section>}
    <p className="mt-8 text-sm leading-7 text-slate-600">{zh ? "练习内容版本" : "Practice content edition"} {quiz.version} · <time dateTime={quiz.updated}>{quiz.updated}</time><br />{zh ? "记录／计分／指南版本" : "Record / scoring / guide versions"}: {quiz.source.itemBankVersion} / {quiz.source.scoringVersion} / {quiz.source.resultContentVersion}</p>
  </Container></main>;
}
