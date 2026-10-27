import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import type { Locale } from "@/lib/i18n/locales";
import type { BirthNumberProfile, BirthNumberQuestionnaire } from "@/lib/questionnaires/birthNumber";
import { BirthNumberClient } from "./BirthNumberClient";
import { BirthNumberAttribution, BirthNumberGuideBody } from "./BirthNumberReport";

export function BirthNumberPage({ quiz, locale }: { quiz: BirthNumberQuestionnaire; locale: Locale }) {
  const zh = locale === "zh", path = questionnairePath(locale, quiz.slug);
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale })} />
    <nav aria-label={zh ? "面包屑" : "Breadcrumb"} className="mb-6 text-sm"><Link prefetch={false} className="underline" href={`/${locale}/tests#more-tests`}>{zh ? "全部测试与工具" : "All tests and tools"}</Link></nav>
    <p className="text-sm font-semibold text-violet-800">{zh ? "两种日期规则 · 十二篇原创符号指南" : "Two date rules · Twelve original symbolic guides"}</p>
    <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1>
    <p className="mt-5 text-lg leading-8 text-slate-700">{quiz.description[locale]}</p>
    <p className="mt-5 leading-8">{quiz.introduction[locale]}</p><p className="mt-3 text-sm leading-7 text-slate-600">{quiz.instructions![locale]}</p>
    <BirthNumberClient quiz={quiz} locale={locale} />
    <section className="my-8 space-y-5 leading-8" aria-labelledby="birth-number-method"><h2 id="birth-number-method" className="text-2xl font-semibold">{zh ? "运算、读法与隐私" : "Calculation, interpretation and privacy"}</h2>{quiz.guide.map(section => <section key={section.id}><h3 className="font-semibold">{section.title[locale]}</h3>{section.paragraphs.map((paragraph, index) => <p className="mt-2" key={index}>{paragraph[locale]}</p>)}</section>)}</section>
    <BirthNumberAttribution quiz={quiz} locale={locale} />
    <section className="my-8" aria-labelledby="birth-number-public-guides"><h2 id="birth-number-public-guides" className="text-2xl font-semibold">{zh ? "十二篇完整公开指南" : "Twelve complete public guides"}</h2><ul className="mt-5 space-y-4">{quiz.profiles.map(profile => <li key={profile.id} className="rounded-lg border border-slate-200 bg-white p-5"><Link prefetch={false} className="text-lg font-semibold underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{profile.title[locale]}</Link><p className="mt-3 leading-7">{profile.summary[locale]}</p></li>)}</ul></section>
    <section className="my-8 space-y-5" aria-labelledby="birth-number-faq"><h2 id="birth-number-faq" className="text-2xl font-semibold">{zh ? "常见问题" : "Frequently asked questions"}</h2>{quiz.faq.map((item, index) => <div key={index}><h3 className="font-semibold">{item.question[locale]}</h3><p className="mt-2 leading-8">{item.answer[locale]}</p></div>)}</section>
    <p className="mt-8 text-sm leading-7 text-slate-600">{zh ? "规则／运算／指南版本" : "Rule / calculation / guide versions"}: {quiz.source.itemBankVersion} / {quiz.source.scoringVersion} / {quiz.source.resultContentVersion}</p>
  </Container></main>;
}

export function BirthNumberGuidePage({ quiz, profile, locale }: { quiz: BirthNumberQuestionnaire; profile: BirthNumberProfile; locale: Locale }) {
  const zh = locale === "zh", entry = questionnairePath(locale, quiz.slug), path = questionnaireGuidePath(locale, quiz.slug, profile.id);
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-guide-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: quiz.title[locale], path: entry }, { name: profile.title[locale], path }])} />
    <JsonLd id="questionnaire-guide-page" data={buildWebPageJsonLd({ path, title: profile.title[locale], description: profile.seo!.description[locale], locale })} />
    <nav aria-label={zh ? "面包屑" : "Breadcrumb"} className="mb-6 text-sm"><Link prefetch={false} className="underline" href={entry}>{quiz.title[locale]}</Link></nav>
    <p className="text-sm font-semibold text-violet-800">{zh ? "原创符号故事 · 完整读法免费" : "Original symbolic story · Full guide, free"}</p>
    <h1 className="mt-3 text-4xl font-semibold leading-tight">{profile.title[locale]}</h1>
    <p className="my-5 leading-8 text-slate-600">{zh ? "本篇公开指南不需要生日。运算规则说明标签怎样产生，故事、情境与问题由费马原创，不据此推断人格或未来。" : "This public guide needs no birth date. The rule explains how a label is produced; FermatMind wrote the story, scenes and questions without inferring personality or the future."}</p>
    <BirthNumberGuideBody profile={profile} locale={locale} headingLevel={2} idPrefix={`birth-public-${profile.id}`} />
    <BirthNumberAttribution quiz={quiz} locale={locale} />
    <Link prefetch={false} className="my-5 inline-block min-h-11 py-2 font-semibold underline" href={entry}>{zh ? "查看两种规则并计算" : "See both rules and calculate"}</Link>
    <nav aria-label={zh ? "其他符号指南" : "Other symbolic guides"}><ul className="space-y-3">{quiz.profiles.filter(item => item.id !== profile.id).map(item => <li key={item.id}><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, item.id)}>{item.title[locale]}</Link></li>)}</ul></nav>
  </Container></main>;
}
