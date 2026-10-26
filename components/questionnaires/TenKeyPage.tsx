import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";
import { TenKeyClient } from "./TenKeyClient";

export function TenKeyPage({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  const zh = locale === "zh", path = questionnairePath(locale, quiz.slug);
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale })} />
    <nav aria-label={zh ? "面包屑" : "Breadcrumb"} className="mb-6 text-sm"><Link prefetch={false} className="underline" href={`/${locale}/tests#more-tests`}>{zh ? "全部测试与练习" : "All tests and practice"}</Link></nav>
    <p className="text-sm font-semibold text-violet-800">{zh ? "原创数字录入练习 · 计时结果与完整复习免费" : "Original number-entry practice · Timed results and full revision free"}</p>
    <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1>
    <p className="mt-5 text-lg leading-8 text-slate-700">{quiz.description[locale]}</p>
    <p className="mt-3 text-sm text-slate-600">{zh ? "3种模式 · 每轮真实60秒 · 无需注册" : "3 modes · Real 60-second rounds · No signup"}</p>
    <TenKeyClient quiz={quiz} locale={locale} />
    <section className="my-8 space-y-4 leading-8" aria-labelledby="ten-key-purpose"><h2 id="ten-key-purpose" className="text-2xl font-semibold">{zh ? "这项练习覆盖什么？" : "What does this practice cover?"}</h2><p>{quiz.introduction[locale]}</p></section>
    {quiz.guide.map(section => <section key={section.id} className="my-8 space-y-4 leading-8" aria-labelledby={`ten-key-guide-${section.id}`}><h2 id={`ten-key-guide-${section.id}`} className="text-2xl font-semibold">{section.title[locale]}</h2>{section.paragraphs.map((paragraph, index) => <p key={index}>{paragraph[locale]}</p>)}</section>)}
    <section className="my-8" aria-labelledby="ten-key-public-guides"><h2 id="ten-key-public-guides" className="text-2xl font-semibold">{zh ? "三份完整公开复习指南" : "All three complete public revision guides"}</h2><p className="my-4 leading-8 text-slate-600">{zh ? "每个模式均有完整算例、单位、改错与设备说明，可在开始前阅读。它们不是成绩等级或私人答卷，不需要达到某个速度才能解锁。" : "Each mode has worked examples, units, editing rules and device limits. Read them before starting. They are not score bands or private attempts, and no speed is required to unlock them."}</p><ul className="space-y-4">{quiz.profiles.map(profile => <li key={profile.id} className="rounded-lg border border-slate-200 bg-white p-5"><Link prefetch={false} className="inline-block min-h-11 py-2 text-lg font-semibold underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{profile.title[locale]}</Link><p className="mt-2 leading-8">{profile.summary[locale]}</p></li>)}</ul></section>
    <section className="my-8 space-y-5 leading-8" aria-labelledby="ten-key-faq"><h2 id="ten-key-faq" className="text-2xl font-semibold">{zh ? "练习与计时问题" : "Practice and timing questions"}</h2>{quiz.faq.map((faq, index) => <section key={index}><h3 className="text-lg font-semibold">{faq.question[locale]}</h3><p className="mt-2">{faq.answer[locale]}</p></section>)}</section>
    <section className="my-8 leading-8" aria-labelledby="ten-key-references"><h2 id="ten-key-references" className="text-xl font-semibold">{zh ? "技术背景与来源范围" : "Technical background and source scope"}</h2><ul className="mt-3 list-disc pl-5">{quiz.references?.map(reference => <li key={reference.url}><a className="underline" href={reference.url}>{reference.title[locale]}</a></li>)}</ul><p className="mt-3 text-sm text-slate-600">{zh ? "这些文档说明浏览器API的行为与限制，不验证本数字源、练习成效或招聘用途。数字、规则与完整指南均为本站原创。" : "These documents describe browser API behaviour and limits. They do not validate this number bank, training outcomes or hiring use. The numbers, rules and full guides are original to this edition."}</p></section>
    <p className="mt-8 text-sm leading-7 text-slate-600">{zh ? "练习内容版本" : "Practice content edition"} {quiz.version} · <time dateTime={quiz.updated}>{quiz.updated}</time><br />{zh ? "数字源／计分／指南版本" : "Number source / scoring / guide versions"}: {quiz.source.itemBankVersion} / {quiz.source.scoringVersion} / {quiz.source.resultContentVersion}</p>
  </Container></main>;
}
